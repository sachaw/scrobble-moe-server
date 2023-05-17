import { Code, ConnectError, ServiceImpl } from "@bufbuild/connect";
import { AuthService } from "@protobufs/auth/v1/auth_connect.js";
import {
  PlexAuthRequest,
  PlexAuthResponse,
  WebAuthnRequest,
  WebAuthnResponse,
} from "@protobufs/auth/v1/auth_pb.js";
import { prisma } from "../lib/prisma.js";
import got from "got";
import { createId } from "@paralleldrive/cuid2";
import { decode, encode } from "universal-base64";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/typescript-types";
import base64url from "base64url";
import { Transport } from "@prisma/client";
import { ScrobbleFeedEventStream } from "../utils/events.js";
import { secrets } from "../lib/infisical.js";
interface PlexAccountResponse {
  user: {
    id: number;
    uuid: string;
    email: string;
    joined_at: string;
    username: string;
    title: string;
    thumb: string;
    hasPassword: boolean;
    authToken: string;
    authentication_token: string;
    subscription: {
      active: boolean;
      status: string;
      plan: string;
      features: string[];
    };
    roles: { roles: string[] };
  };
  entitlements: string[];
  confirmedAt: string;
  forumId: string | null;
}

export class Auth implements ServiceImpl<typeof AuthService> {
  private dispatcher = ScrobbleFeedEventStream;

  private async getPlexAccount(token: string) {
    console.log("fetching plex user data");
    this.dispatcher.dispatch(token);
    return await got
      .get("https://plex.tv/users/account.json", {
        headers: {
          "X-Plex-Token": token,
          Accept: "application/json",
        },
      })
      .json<PlexAccountResponse>()
      .catch((err: Error) => {
        throw new ConnectError(err.message, Code.Internal);
      });
  }

  public async plexAuth(req: PlexAuthRequest): Promise<PlexAuthResponse> {
    const plexAccountData = await this.getPlexAccount(req.plexToken);

    const user = await prisma.user
      .upsert({
        where: {
          plexId: plexAccountData.user.id,
        },
        include: {
          authenticators: true,
        },
        update: {
          email: plexAccountData.user.email,
          plexAuthToken: req.plexToken,
          thumb: plexAccountData.user.thumb,
          username: plexAccountData.user.username,
        },
        create: {
          id: createId(),
          email: plexAccountData.user.email,
          plexAuthToken: req.plexToken,
          plexId: plexAccountData.user.id,
          thumb: plexAccountData.user.thumb,
          username: plexAccountData.user.username,
        },
      })
      .catch((err: Error) => {
        throw new ConnectError(err.message, Code.Internal);
      });

    const isRegistering = user.authenticators.length === 0;

    let webauthnOptions:
      | PublicKeyCredentialCreationOptionsJSON
      | PublicKeyCredentialRequestOptionsJSON;

    if (isRegistering) {
      webauthnOptions = generateRegistrationOptions({
        rpID: secrets.RP_ID,
        rpName: secrets.RP_NAME,
        userID: user.id,
        userName: user.username,
        attestationType: "direct",
        authenticatorSelection: {
          requireResidentKey: true,
        },
      });
    } else {
      webauthnOptions = generateAuthenticationOptions({
        rpID: secrets.RP_ID,
        userVerification: "required",
        allowCredentials: user.authenticators
          .filter((a) => !a.revoked)
          .map((authenticator) => {
            return {
              id: authenticator.credentialID,
              transports: authenticator.transports.map(
                (transport) =>
                  transport.toLowerCase() as AuthenticatorTransport,
              ),
              type: "public-key",
            };
          }),
      });
    }
    await prisma.user
      .update({
        data: {
          challenge: webauthnOptions.challenge,
          challengeExpiresAt: new Date(new Date().getTime() + 1000 * 60 * 1),
        },
        where: {
          id: user.id,
        },
      })
      .catch((err: Error) => {
        throw new ConnectError(err.message, Code.Internal);
      });

    return new PlexAuthResponse({
      username: plexAccountData.user.username,
      avatarUrl: plexAccountData.user.thumb,
      webauthnOptions: {
        case: isRegistering ? "create" : "request",
        value: encode(JSON.stringify(webauthnOptions)),
      },
    });
  }

  public async webAuthn(req: WebAuthnRequest): Promise<WebAuthnResponse> {
    const plexAccountData = await this.getPlexAccount(req.plexToken);

    const user = await prisma.user.findUnique({
      where: {
        plexId: plexAccountData.user.id,
      },
      include: {
        _count: {
          select: {
            authenticators: true,
          },
        },
      },
    });

    if (!user) {
      throw new ConnectError("User not found.", Code.NotFound);
    }

    if (!user.challenge) {
      throw new ConnectError(
        "Challenge has not been generated yet.",
        Code.FailedPrecondition,
      );
    }
    console.log("Number of authenticators: ", user._count.authenticators);

    if (user._count.authenticators > 0) {
      const response = JSON.parse(
        decode(req.verification),
      ) as AuthenticationResponseJSON;
      const authenticator = await prisma.authenticator
        .findUnique({
          where: {
            credentialID: base64url.toBuffer(response.rawId),
          },
        })
        .catch((err: Error) => {
          throw new ConnectError(err.message, Code.Internal);
        });

      if (!authenticator) {
        throw new ConnectError("Authenticator not found", Code.NotFound);
      }

      const verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge: user.challenge,
        expectedOrigin: secrets.RP_ORIGIN,
        expectedRPID: secrets.RP_ID,
        authenticator: {
          counter: authenticator.counter,
          credentialID: authenticator.credentialID,
          credentialPublicKey: authenticator.credentialPublicKey,
          transports: authenticator.transports.map(
            (transport) => transport.toLowerCase() as AuthenticatorTransport,
          ),
        },
      }).catch((err: Error) => {
        throw new ConnectError(err.message, Code.Internal);
      });

      if (!verification.verified) {
        throw new ConnectError("Challenge Failed", Code.PermissionDenied);
      }

      await prisma.authenticator
        .update({
          where: {
            credentialID: authenticator.credentialID,
          },
          data: {
            counter: verification.authenticationInfo.newCounter,
          },
        })
        .catch((err: Error) => {
          throw new ConnectError(err.message, Code.Internal);
        });

      // const tokens = await generateTokens(ctx.prisma, user);

      // ctx.setTokens(tokens);

      return new WebAuthnResponse();
    } else {
      const authenticatorData = JSON.parse(
        decode(req.verification),
      ) as RegistrationResponseJSON;
      const verification = await verifyRegistrationResponse({
        response: authenticatorData,
        expectedChallenge: user.challenge,
        expectedOrigin: secrets.RP_ORIGIN,
        expectedRPID: secrets.RP_ID,
      }).catch((err: Error) => {
        throw new ConnectError(err.message, Code.Internal);
      });

      if (!verification.verified) {
        // throw new AuthenticationError("Challenge Failed");
        throw new ConnectError("Challenge Failed", Code.PermissionDenied);
      }

      if (!verification.registrationInfo) {
        throw new ConnectError(
          "Registration data malformed",
          Code.InvalidArgument,
        );
      }

      await prisma.authenticator
        .create({
          data: {
            id: createId(),
            AAGUID: verification.registrationInfo.aaguid,
            credentialID: Buffer.from(
              verification.registrationInfo.credentialID,
            ),
            credentialPublicKey: Buffer.from(
              verification.registrationInfo.credentialPublicKey,
            ),
            counter: verification.registrationInfo.counter,
            revoked: false,
            transports: authenticatorData.response.transports?.map(
              (transport) => {
                return transport.toUpperCase() as Transport;
              },
            ),
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        })
        .catch((err: Error) => {
          throw new ConnectError(err.message, Code.Internal);
        });

      // const tokens = await generateTokens(ctx.prisma, user);

      return new WebAuthnResponse();
    }
  }
}
