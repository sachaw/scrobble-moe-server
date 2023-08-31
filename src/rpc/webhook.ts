import { WebhookService } from "@buf/scrobble-moe_protobufs.bufbuild_connect-es/moe/scrobble/webhook/v1/webhook_service_connect.js";
import {
  ScrobbleRequest,
  ScrobbleResponse,
} from "@buf/scrobble-moe_protobufs.bufbuild_es/moe/scrobble/webhook/v1/webhook_pb.js";
import { Code, ConnectError, ServiceImpl } from "@connectrpc/connect";
import { createId } from "@paralleldrive/cuid2";
import { LinkedAccount, Provider } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { Anilist } from "../providers/anilist.js";

export class Webhook implements ServiceImpl<typeof WebhookService> {
  public async scrobble(req: ScrobbleRequest): Promise<ScrobbleResponse> {
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

        return Promise.all(accountPromises).then(() => new ScrobbleResponse());
      })
      .catch((err) => {
        throw new ConnectError(err.message, Code.Internal);
      });
  }

  private async handleAccount(account: LinkedAccount, params: ScrobbleRequest) {
    const { serverUuid, providerMediaId, episode, secret } = params;

    switch (account.provider) {
      case Provider.ANILIST: {
        const anilist = new Anilist(account.accessToken);
        return prisma.scrobble
          .findFirst({
            where: {
              providerMediaId,
              episode,
              user: { id: account.userId },
            },
          })
          .then((existingScrobble) => {
            const newScrobbleId = createId();
            return anilist
              .setProgress(parseInt(providerMediaId), episode)
              .then((status) =>
                prisma.scrobbleProviderStatus.create({
                  data: {
                    id: createId(),
                    provider: account.provider,
                    status,
                    scrobble: {
                      connectOrCreate: {
                        create: {
                          id: newScrobbleId,
                          episode,
                          providerMediaId,
                          server: { connect: { uuid: serverUuid, secret } },
                          user: { connect: { id: account.userId } },
                        },
                        where: {
                          id: existingScrobble
                            ? existingScrobble.id
                            : newScrobbleId,
                        },
                      },
                    },
                  },
                }),
              )
              .catch((err) => {
                return Promise.reject(
                  new ConnectError(
                    `Scrobble failed at provider ${account.provider} for media ${providerMediaId}:${episode}. Error: ${err}`,
                  ),
                );
              });
          });
      }
      case Provider.KITSU: {
      }
      break;
    }
  }
}
