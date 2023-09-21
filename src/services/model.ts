import { ModelService } from "@buf/scrobble-moe_protobufs.bufbuild_connect-es/moe/scrobble/model/v1/model_service_connect.js";
import {
  AddLinkedAccountRequest,
  AddLinkedAccountResponse,
  AddServerRequest,
  AddServerResponse,
  AnimeInfoStatus,
  GetAuthenticatorRequest,
  GetAuthenticatorResponse,
  GetAuthenticatorsRequest,
  GetAuthenticatorsResponse,
  GetLinkedAccountRequest,
  GetLinkedAccountResponse,
  GetLinkedAccountsRequest,
  GetLinkedAccountsResponse,
  GetScrobbleEpisodeRequest,
  GetScrobbleEpisodeResponse,
  GetScrobbleEpisodesRequest,
  GetScrobbleEpisodesResponse,
  GetScrobbleGroupRequest,
  GetScrobbleGroupResponse,
  GetScrobbleGroupsRequest,
  GetScrobbleGroupsResponse,
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
  RemoveScrobbleEpisodeRequest,
  RemoveScrobbleEpisodeResponse,
  RemoveScrobbleGroupRequest,
  RemoveScrobbleGroupResponse,
  ScrobbleStatus,
} from "@buf/scrobble-moe_protobufs.bufbuild_es/moe/scrobble/model/v1/model_pb.js";
import { Timestamp } from "@bufbuild/protobuf";
import {
  Code,
  ConnectError,
  HandlerContext,
  ServiceImpl,
} from "@connectrpc/connect";
import { createId } from "@paralleldrive/cuid2";
import { prisma } from "../lib/prisma.js";
import { Anilist, anilist } from "../providers/anilist.js";
import { getPlexServers } from "../utils/plex.js";
import { UserManager } from "../utils/userManager.js";
import { BaseService } from "./BaseService.js";

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

  public async getUser(req: GetUserRequest, ctx: HandlerContext) {
    return new GetUserResponse();
  }

  public async getUsers(req: GetUsersRequest, ctx: HandlerContext) {
    return new GetUsersResponse();
  }

  /**
   * Authenticator RPC's
   */
  public async getAuthenticator(
    req: GetAuthenticatorRequest,
    ctx: HandlerContext,
  ) {
    try {
      await this.authorization(ctx);

      const authenticator = await prisma.authenticator.findUnique({
        where: {
          id: req.id,
        },
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
    } catch (error) {
      throw new ConnectError((error as Error).message, Code.Internal);
    }
  }

  public async getAuthenticators(
    req: GetAuthenticatorsRequest,
    ctx: HandlerContext,
  ) {
    try {
      await this.authorization(ctx);

      const authenticators = await prisma.authenticator.findMany({
        where: {
          userId: this.userManager.user.id,
        },
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
    } catch (error) {
      throw new ConnectError((error as Error).message, Code.Internal);
    }
  }

  /**
   * Server RPC's
   */
  public async getServer(req: GetServerRequest, ctx: HandlerContext) {
    try {
      await this.authorization(ctx);

      const server = await prisma.server.findUnique({
        where: {
          id: req.id,
          users: {
            some: {
              id: this.userManager.user.id,
            },
          },
        },
      });

      if (!server) {
        throw new ConnectError("Server not found.", Code.NotFound);
      }

      return new GetServerResponse({
        server: {
          id: server.id,
          createdAt: Timestamp.fromDate(server.createdAt),
          updatedAt: Timestamp.fromDate(server.updatedAt),
          name: server.name,
          uuid: server.uuid,
          secret: server.secret,
        },
      });
    } catch (error) {
      throw new ConnectError((error as Error).message, Code.Internal);
    }
  }

  public async getServers(req: GetServersRequest, ctx: HandlerContext) {
    try {
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
    } catch (error) {
      throw new ConnectError((error as Error).message, Code.Internal);
    }
  }

  public async addServer(req: AddServerRequest, ctx: HandlerContext) {
    try {
      await this.authorization(ctx);

      const servers = await getPlexServers(this.userManager.user.plexAuthToken);

      const serverToLink = servers.find(
        (server) => server.clientIdentifier === req.uuid,
      );

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
    } catch (error) {
      throw new ConnectError((error as Error).message, Code.Internal);
    }
  }

  /**
   * Scrobble RPC's
   */

  public async getScrobbleGroup(
    req: GetScrobbleGroupRequest,
    ctx: HandlerContext,
  ) {
    try {
      await this.authorization(ctx);

      const scrobbleGroup = await prisma.scrobbleGroup.findUnique({
        where: {
          id: req.id,
        },
        include: {
          scrobbleEpisodes: {
            include: {
              status: true,
            },
          },
        },
      });

      if (!scrobbleGroup) {
        throw new ConnectError("Scrobble not found.", Code.NotFound);
      }

      if (scrobbleGroup.userId !== this.userManager.user.id) {
        throw new ConnectError(
          "Scrobble does not belong to the authenticated user.",
          Code.PermissionDenied,
        );
      }

      const anime = (
        await anilist.getAnimeInfo([parseInt(scrobbleGroup.providerMediaId)])
      )[0];

      return new GetScrobbleGroupResponse({
        scrobbleGroup: {
          id: scrobbleGroup.id,
          createdAt: Timestamp.fromDate(scrobbleGroup.createdAt),
          updatedAt: Timestamp.fromDate(scrobbleGroup.updatedAt),
          providerMediaId: scrobbleGroup.providerMediaId,
          anime: {
            title: anime?.title,
            description: anime?.description,
            episodes: anime?.episodes,
            duration: anime?.duration,
            coverImage: anime?.coverImage,
            status: AnimeInfoStatus[anime?.status ?? "FINISHED"],
          },
          userId: scrobbleGroup.userId,
          scrobbleEpisodes: scrobbleGroup.scrobbleEpisodes.map(
            (scrobbleEpisode) => {
              return {
                id: scrobbleEpisode.id,
                createdAt: Timestamp.fromDate(scrobbleEpisode.createdAt),
                updatedAt: Timestamp.fromDate(scrobbleEpisode.updatedAt),
                episode: scrobbleEpisode.episode,
                scrobbleGroupId: scrobbleEpisode.scrobbleGroupId,
                status: scrobbleEpisode.status.map((status) => {
                  return {
                    id: status.id,
                    createdAt: Timestamp.fromDate(status.createdAt),
                    updatedAt: Timestamp.fromDate(status.updatedAt),
                    status: ScrobbleStatus[status.status],
                    provider: Provider[status.provider],
                    scrobbleEpisodeId: status.scrobbleEpisodeId,
                  };
                }),
              };
            },
          ),
        },
      });
    } catch (error) {
      throw new ConnectError((error as Error).message, Code.Internal);
    }
  }

  public async getScrobbleGroups(
    req: GetScrobbleGroupsRequest,
    ctx: HandlerContext,
  ) {
    try {
      await this.authorization(ctx);

      const scrobbleGroups = await prisma.scrobbleGroup.findMany({
        where: {
          userId: this.userManager.user.id,
        },
        include: {
          scrobbleEpisodes: {
            include: {
              status: true,
            },
          },
        },
      });

      const animeInfo = await anilist.getAnimeInfo([
        // Reduce to unique values
        ...new Set(
          scrobbleGroups.map((scrobble) => parseInt(scrobble.providerMediaId)),
        ),
      ]);

      return new GetScrobbleGroupsResponse({
        scrobbleGroups: scrobbleGroups.map((scrobble) => {
          const anime = animeInfo.find(
            (anime) => anime.id === parseInt(scrobble.providerMediaId),
          );

          return {
            id: scrobble.id,
            createdAt: Timestamp.fromDate(scrobble.createdAt),
            updatedAt: Timestamp.fromDate(scrobble.updatedAt),
            providerMediaId: scrobble.providerMediaId,
            anime: {
              title: anime?.title,
              description: anime?.description,
              episodes: anime?.episodes,
              duration: anime?.duration,
              coverImage: anime?.coverImage,
              status: AnimeInfoStatus[anime?.status ?? "FINISHED"],
            },
            userId: scrobble.userId,
            scrobbleEpisodes: scrobble.scrobbleEpisodes.map(
              (scrobbleEpisode) => {
                return {
                  id: scrobbleEpisode.id,
                  createdAt: Timestamp.fromDate(scrobbleEpisode.createdAt),
                  updatedAt: Timestamp.fromDate(scrobbleEpisode.updatedAt),
                  episode: scrobbleEpisode.episode,
                  scrobbleGroupId: scrobbleEpisode.scrobbleGroupId,
                  status: scrobbleEpisode.status.map((status) => {
                    return {
                      id: status.id,
                      createdAt: Timestamp.fromDate(status.createdAt),
                      updatedAt: Timestamp.fromDate(status.updatedAt),
                      status: ScrobbleStatus[status.status],
                      provider: Provider[status.provider],
                      scrobbleEpisodeId: status.scrobbleEpisodeId,
                    };
                  }),
                };
              },
            ),
          };
        }),
      });
    } catch (error) {
      console.error(error);

      throw new ConnectError((error as Error).message, Code.Internal);
    }
  }

  public async removeScrobbleGroup(
    req: RemoveScrobbleGroupRequest,
    ctx: HandlerContext,
  ) {
    try {
      await this.authorization(ctx);

      await prisma.scrobbleGroup.delete({
        where: {
          id: req.id,
          userId: this.userManager.user.id,
        },
      });

      return new RemoveScrobbleGroupResponse();
    } catch (error) {
      throw new ConnectError((error as Error).message, Code.Internal);
    }
  }

  public async getScrobbleEpisode(
    req: GetScrobbleEpisodeRequest,
    ctx: HandlerContext,
  ) {
    return new GetScrobbleEpisodeResponse();
  }

  public async getScrobbleEpisodes(
    req: GetScrobbleEpisodesRequest,
    ctx: HandlerContext,
  ) {
    return new GetScrobbleEpisodesResponse();
  }

  public async removeScrobbleEpisode(
    req: RemoveScrobbleEpisodeRequest,
    ctx: HandlerContext,
  ) {
    return new RemoveScrobbleEpisodeResponse();
  }

  /**
   * Linked Account RPC's
   */

  public async getLinkedAccount(
    req: GetLinkedAccountRequest,
    ctx: HandlerContext,
  ) {
    try {
      await this.authorization(ctx);

      const linkedAccount = await prisma.linkedAccount.findUnique({
        where: {
          id: req.id,
        },
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
          createdAt: Timestamp.fromDate(linkedAccount.createdAt),
          updatedAt: Timestamp.fromDate(linkedAccount.updatedAt),
          provider: Provider[linkedAccount.provider],
          accountId: linkedAccount.accountId,
          accessToken: linkedAccount.accessToken,
          accessTokenExpires: linkedAccount.accessTokenExpires
            ? Timestamp.fromDate(linkedAccount.accessTokenExpires)
            : undefined,
          refreshToken: linkedAccount.refreshToken ?? "",
        },
      });
    } catch (error) {
      throw new ConnectError((error as Error).message, Code.Internal);
    }
  }

  public async getLinkedAccounts(
    req: GetLinkedAccountsRequest,
    ctx: HandlerContext,
  ) {
    try {
      await this.authorization(ctx);

      const linkedAccounts = await prisma.linkedAccount.findMany({
        where: {
          userId: this.userManager.user.id,
        },
      });

      return new GetLinkedAccountsResponse({
        accounts: linkedAccounts.map((linkedAccount) => {
          return {
            id: linkedAccount.id,
            createdAt: Timestamp.fromDate(linkedAccount.createdAt),
            updatedAt: Timestamp.fromDate(linkedAccount.updatedAt),
            provider: Provider[linkedAccount.provider],
            accountId: linkedAccount.accountId,
            accessToken: linkedAccount.accessToken,
            accessTokenExpires: linkedAccount.accessTokenExpires
              ? Timestamp.fromDate(linkedAccount.accessTokenExpires)
              : undefined,
            refreshToken: linkedAccount.refreshToken ?? "",
          };
        }),
      });
    } catch (error) {
      throw new ConnectError((error as Error).message, Code.Internal);
    }
  }

  public async addLinkedAccount(
    req: AddLinkedAccountRequest,
    ctx: HandlerContext,
  ) {
    try {
      await this.authorization(ctx);

      const url = "https://anilist.co/api/v2/oauth/token";

      const data = {
        grant_type: "authorization_code",
        client_id: process.env.ANILIST_ID,
        client_secret: process.env.ANILIST_SECRET,
        redirect_uri: process.env.ANILIST_REDIRECT_URL,
        code: req.code,
      };

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
      });

      const json = (await response.json()) as AnilistResponse;

      const anilist = new Anilist(json.access_token);
      const userId = await anilist.getUserId();

      const linkedAccount = await prisma.linkedAccount.create({
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
      });

      return new AddLinkedAccountResponse({
        account: {
          id: linkedAccount.id,
          createdAt: Timestamp.fromDate(linkedAccount.createdAt),
          updatedAt: Timestamp.fromDate(linkedAccount.updatedAt),
          provider: Provider[linkedAccount.provider],
          accountId: linkedAccount.accountId,
          accessToken: linkedAccount.accessToken,
          accessTokenExpires: linkedAccount.accessTokenExpires
            ? Timestamp.fromDate(linkedAccount.accessTokenExpires)
            : undefined,
          refreshToken: linkedAccount.refreshToken ?? "",
        },
      });
    } catch (error) {
      throw new ConnectError((error as Error).message, Code.Internal);
    }
  }

  public async removeLinkedAccount(
    req: RemoveLinkedAccountRequest,
    ctx: HandlerContext,
  ) {
    try {
      await this.authorization(ctx);

      await prisma.linkedAccount.delete({
        where: {
          id: req.id,
          userId: this.userManager.user.id,
        },
      });

      return new RemoveLinkedAccountResponse();
    } catch (error) {
      throw new ConnectError((error as Error).message, Code.Internal);
    }
  }
}
