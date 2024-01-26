import type { WebhookService } from "@buf/scrobble-moe_protobufs.bufbuild_connect-es/moe/scrobble/webhook/v1/webhook_service_connect.js";
import {
  type ScrobbleRequest,
  ScrobbleResponse,
} from "@buf/scrobble-moe_protobufs.bufbuild_es/moe/scrobble/webhook/v1/webhook_pb.js";
import { Code, ConnectError, type ServiceImpl } from "@connectrpc/connect";
import { createId } from "@paralleldrive/cuid2";
import { type LinkedAccount, Provider } from "@prisma/client";
import { prisma } from "../lib/index.js";
import { Anilist } from "../providers/index.js";

export class Webhook implements ServiceImpl<typeof WebhookService> {
  public async scrobble(req: ScrobbleRequest): Promise<ScrobbleResponse> {
    try {
      const { serverUuid, username } = req;

      return prisma.server
        .findUnique({
          where: { uuid: serverUuid },
          include: {
            users: {
              include: { accounts: true },
            },
          },
        })
        .then((server) => {
          if (!server) {
            return Promise.reject(
              new ConnectError(
                `Server with UUID: ${serverUuid} not found.`,
                Code.NotFound,
              ),
            );
          }

          const user = server.users.find((u) => u.username === username);

          if (!user) {
            return Promise.reject(
              new ConnectError(`User: ${username} not found`, Code.NotFound),
            );
          }

          if (!user.accounts.length) {
            return Promise.reject(
              new ConnectError(
                `No linked accounts for user: ${username}`,
                Code.FailedPrecondition,
              ),
            );
          }

          const accountPromises = user.accounts.map((account) =>
            this.handleAccount(account, req),
          );

          return Promise.all(accountPromises).then(
            () => new ScrobbleResponse(),
          );
        });
    } catch (error) {
      throw new ConnectError((error as Error).message, Code.Internal);
    }
  }

  private async handleAccount(account: LinkedAccount, params: ScrobbleRequest) {
    try {
      const { serverUuid, providerMediaId, episode, secret } = params;

      const scrobbleEpisode = await prisma.scrobbleEpisode.create({
        data: {
          id: createId(),
          episode,
          scrobbleGroup: {
            connectOrCreate: {
              where: {
                userId_providerMediaId: {
                  userId: account.userId,
                  providerMediaId,
                },
              },
              create: {
                id: createId(),
                providerMediaId,
                user: {
                  connect: {
                    id: account.userId,
                  },
                },
              },
            },
          },
          server: {
            connect: {
              uuid: serverUuid,
            },
          },
        },
      });

      switch (account.provider) {
        case Provider.ANILIST: {
          const anilist = new Anilist(account.accessToken);

          const scrobbleStatus = await anilist.setProgress(
            Number.parseInt(providerMediaId),
            episode,
          );

          await prisma.scrobbleEpisode.update({
            where: {
              id: scrobbleEpisode.id,
            },
            data: {
              accounts: {
                connect: {
                  id: account.id,
                },
              },
              status: {
                create: {
                  id: createId(),
                  status: scrobbleStatus,
                  provider: account.provider,
                },
              },
            },
          });
          break;
        }
        case Provider.KITSU: {
          break;
        }
      }
    } catch (error) {
      throw new ConnectError((error as Error).message, Code.Internal);
    }
  }
}
