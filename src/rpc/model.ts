import { ModelService } from "@buf/scrobble-moe_protobufs.bufbuild_connect-es/moe/scrobble/model/v1/model_service_connect.js";
import {
  AddLinkedAccountRequest,
  AddLinkedAccountResponse,
  AddServerRequest,
  AddServerResponse,
  GetAuthenticatorRequest,
  GetAuthenticatorResponse,
  GetAuthenticatorsRequest,
  GetAuthenticatorsResponse,
  GetLinkedAccountRequest,
  GetLinkedAccountResponse,
  GetLinkedAccountsRequest,
  GetLinkedAccountsResponse,
  GetScrobbleRequest,
  GetScrobbleResponse,
  GetScrobblesRequest,
  GetScrobblesResponse,
  GetServerRequest,
  GetServerResponse,
  GetServersRequest,
  GetServersResponse,
  GetUserRequest,
  GetUserResponse,
  GetUsersRequest,
  GetUsersResponse,
  Provider,
  RemoveLinkedAccountRequest,
  RemoveLinkedAccountResponse,
  RemoveScrobbleRequest,
  RemoveScrobbleResponse,
} from "@buf/scrobble-moe_protobufs.bufbuild_es/moe/scrobble/model/v1/model_pb.js";
import { Message, PartialMessage } from "@bufbuild/protobuf";
import {
  Code,
  ConnectError,
  HandlerContext,
  ServiceImpl,
} from "@connectrpc/connect";
// import { UnaryImpl } from "@connectrpc/connect/dist/types/implementation.js";
import { createId } from "@paralleldrive/cuid2";
import { prisma } from "../lib/prisma.js";
import { Anilist } from "../providers/anilist.js";
import { getPlexServers } from "../utils/plex.js";
import { UserManager } from "../utils/userManager.js";
import { BaseService } from "./BaseService.js";

/**
 * Shim pending: https://github.com/connectrpc/connect-es/issues/788
 */
export type UnaryImpl<I extends Message<I>, O extends Message<O>> = (
  request: I,
  context: HandlerContext,
) => Promise<O | PartialMessage<O>> | O | PartialMessage<O>;

export class Model
  extends BaseService<string>
  implements ServiceImpl<typeof ModelService>
{
  constructor(protected userManager: UserManager) {
    super(userManager);
  }

  /**
   * User RPC's
   */

  getUser: UnaryImpl<GetUserRequest, GetUserResponse> = async (req, ctx) => {
    return new GetUserResponse();
  };

  getUsers: UnaryImpl<GetUsersRequest, GetUsersResponse> = async (req, ctx) => {
    return new GetUsersResponse();
  };

  /**
   * Authenticator RPC's
   */

  getAuthenticator: UnaryImpl<
    GetAuthenticatorRequest,
    GetAuthenticatorResponse
  > = async (req, ctx) => {
    await this.authorization(ctx);

    const authenticator = await prisma.authenticator
      .findUnique({
        where: {
          id: req.id,
        },
      })
      .catch((err: Error) => {
        throw new ConnectError(
          `Failed to get authenticator: ${err}`,
          Code.Internal,
        );
      });

    if (!authenticator) {
      throw new ConnectError("Authenticator not found.", Code.NotFound);
    }

    if (authenticator.userId !== this.userManager.user.id) {
      throw new ConnectError(
        "Authenticator does not belong to the authenticated user.",
        Code.PermissionDenied,
      );
    }

    return new GetAuthenticatorResponse({
      authenticator: {
        id: authenticator.id,
        aaguid: authenticator.AAGUID,
        credentialId: authenticator.credentialID,
        credentialPublicKey: authenticator.credentialPublicKey,
        counter: authenticator.counter,
        revoked: authenticator.revoked,
      },
    });
  };

  getAuthenticators: UnaryImpl<
    GetAuthenticatorsRequest,
    GetAuthenticatorsResponse
  > = async (req, ctx) => {
    await this.authorization(ctx);

    const authenticators = await prisma.authenticator
      .findMany({
        where: {
          userId: this.userManager.user.id,
        },
      })
      .catch((err: Error) => {
        throw new ConnectError(
          `Failed to get authenticators: ${err}`,
          Code.Internal,
        );
      });

    return new GetAuthenticatorsResponse({
      authenticators: authenticators.map((authenticator) => {
        return {
          id: authenticator.id,
          friendlyName: authenticator.friendlyName,
          aaguid: authenticator.AAGUID,
          credentialId: authenticator.credentialID,
          credentialPublicKey: authenticator.credentialPublicKey,
          counter: authenticator.counter,
          revoked: authenticator.revoked,
        };
      }),
    });
  };

  /**
   * Server RPC's
   */
  getServer: UnaryImpl<GetServerRequest, GetServerResponse> = async (
    req,
    ctx,
  ) => {
    await this.authorization(ctx);

    return new GetServerResponse();
  };

  getServers: UnaryImpl<GetServersRequest, GetServersResponse> = async (
    req,
    ctx,
  ) => {
    this.authorization(ctx);

    const servers = await prisma.server.findMany({
      where: {
        users: {
          every: {
            id: this.userManager.user.id,
          },
        },
      },
    });
    return new GetServersResponse({
      servers: servers.map((server) => {
        return {
          id: server.id,
          secret: server.secret,
          uuid: server.uuid,
        };
      }),
    });
  };

  addServer: UnaryImpl<AddServerRequest, AddServerResponse> = async (
    req,
    ctx,
  ) => {
    await this.authorization(ctx);

    const servers = await getPlexServers(this.userManager.user.plexAuthToken);

    console.log(servers);

    const serverToLink = servers.find(
      (server) => server.clientIdentifier === req.uuid,
    );

    console.log(serverToLink);

    if (!serverToLink) {
      throw new ConnectError("Server not found.", Code.NotFound);
    }

    await prisma.server.create({
      data: {
        id: createId(),
        name: req.name,
        uuid: req.uuid,
        secret: createId(),
        users: {
          connect: {
            id: this.userManager.user.id,
          },
        },
      },
    });
    return new AddServerResponse();
  };

  /**
   * Scrobble RPC's
   */

  getScrobble: UnaryImpl<GetScrobbleRequest, GetScrobbleResponse> = async (
    req,
    ctx,
  ) => {
    await this.authorization(ctx);

    return new GetScrobbleResponse();
  };

  getScrobbles: UnaryImpl<GetScrobblesRequest, GetScrobblesResponse> = async (
    req,
    ctx,
  ) => {
    await this.authorization(ctx);

    return new GetScrobblesResponse();
  };

  removeScrobble: UnaryImpl<RemoveScrobbleRequest, RemoveScrobbleResponse> =
    async (req, ctx) => {
      await this.authorization(ctx);

      return new RemoveScrobbleResponse();
    };

  /**
   * Linked Account RPC's
   */

  getLinkedAccount: UnaryImpl<
    GetLinkedAccountRequest,
    GetLinkedAccountResponse
  > = async (req, ctx) => {
    await this.authorization(ctx);

    const linkedAccount = await prisma.linkedAccount
      .findUnique({
        where: {
          id: req.id,
        },
      })
      .catch((err: Error) => {
        throw new ConnectError(
          `Failed to get linked account: ${err}`,
          Code.Internal,
        );
      });

    if (!linkedAccount) {
      throw new ConnectError("Linked account not found.", Code.NotFound);
    }

    if (linkedAccount.userId !== this.userManager.user.id) {
      throw new ConnectError(
        "Linked account does not belong to the authenticated user.",
        Code.PermissionDenied,
      );
    }

    return new GetLinkedAccountResponse({
      account: {
        id: linkedAccount.id,
        createdAt: linkedAccount.createdAt.getTime(),
        updatedAt: linkedAccount.updatedAt.getTime(),
        provider: Provider[linkedAccount.provider],
        accountId: linkedAccount.accountId,
        accessToken: linkedAccount.accessToken,
        accessTokenExpires: linkedAccount.accessTokenExpires?.getTime(),
        refreshToken: linkedAccount.refreshToken ?? "",
      },
    });
  };

  getLinkedAccounts: UnaryImpl<
    GetLinkedAccountsRequest,
    GetLinkedAccountsResponse
  > = async (req, ctx) => {
    await this.authorization(ctx);

    const linkedAccounts = await prisma.linkedAccount
      .findMany({
        where: {
          userId: this.userManager.user.id,
        },
      })
      .catch((err: Error) => {
        throw new ConnectError(
          `Failed to get linked accounts: ${err}`,
          Code.Internal,
        );
      });

    return new GetLinkedAccountsResponse({
      accounts: linkedAccounts.map((linkedAccount) => {
        return {
          id: linkedAccount.id,
          createdAt: linkedAccount.createdAt.getTime(),
          updatedAt: linkedAccount.updatedAt.getTime(),
          provider: Provider[linkedAccount.provider],
          accountId: linkedAccount.accountId,
          accessToken: linkedAccount.accessToken,
          accessTokenExpires: linkedAccount.accessTokenExpires?.getTime(),
          refreshToken: linkedAccount.refreshToken ?? "",
        };
      }),
    });
  };

  addLinkedAccount: UnaryImpl<
    AddLinkedAccountRequest,
    AddLinkedAccountResponse
  > = async (req, ctx) => {
    await this.authorization(ctx);

    const url = "https://anilist.co/api/v2/oauth/token";

    const data = {
      grant_type: "authorization_code",
      client_id: process.env.ANILIST_ID,
      client_secret: process.env.ANILIST_SECRET,
      redirect_uri: process.env.ANILIST_REDIRECT_URL,
      code: req.code,
    };

    console.log(data);

    interface AnilistResponse {
      token_type: "Bearer";
      expires_in: number;
      access_token: string;
      refresh_token: string;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    }).catch((err: Error) => {
      throw new ConnectError(
        `Failed to get linked account: ${err}`,
        Code.Internal,
      );
    });

    const json = (await response.json()) as AnilistResponse;

    const anilist = new Anilist(json.access_token);
    const userId = await anilist.getUserId();

    console.log(json);

    const linkedAccount = await prisma.linkedAccount
      .create({
        data: {
          id: createId(),
          provider: "ANILIST",
          accountId: userId,
          accessToken: json.access_token,
          accessTokenExpires: new Date(Date.now() + json.expires_in * 1000),
          refreshToken: json.refresh_token,
          user: {
            connect: {
              id: this.userManager.user.id,
            },
          },
        },
      })
      .catch((err: Error) => {
        throw new ConnectError(
          `Failed to create linked account: ${err}`,
          Code.Internal,
        );
      });

    console.log(linkedAccount);

    return new AddLinkedAccountResponse({
      account: {
        id: linkedAccount.id,
        createdAt: linkedAccount.createdAt.getTime(),
        updatedAt: linkedAccount.updatedAt.getTime(),
        provider: Provider[linkedAccount.provider],
        accountId: linkedAccount.accountId,
        accessToken: linkedAccount.accessToken,
        accessTokenExpires: linkedAccount.accessTokenExpires?.getTime(),
        refreshToken: linkedAccount.refreshToken ?? "",
      },
    });
  };

  removeLinkedAccount: UnaryImpl<
    RemoveLinkedAccountRequest,
    RemoveLinkedAccountResponse
  > = async (req, ctx) => {
    await this.authorization(ctx);

    const linkedAccount = await prisma.linkedAccount
      .findUnique({
        where: {
          id: req.id,
        },
      })
      .catch((err: Error) => {
        throw new ConnectError(
          `Failed to get linked account: ${err}`,
          Code.Internal,
        );
      });

    if (!linkedAccount) {
      throw new ConnectError("Linked account not found.", Code.NotFound);
    }

    if (linkedAccount.userId !== this.userManager.user.id) {
      throw new ConnectError(
        "Linked account does not belong to the authenticated user.",
        Code.PermissionDenied,
      );
    }

    await prisma.linkedAccount
      .delete({
        where: {
          id: req.id,
        },
      })
      .catch((err: Error) => {
        throw new ConnectError(
          `Failed to delete linked account: ${err}`,
          Code.Internal,
        );
      });

    return new RemoveLinkedAccountResponse();
  };
}
