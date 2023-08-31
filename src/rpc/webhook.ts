import { WebhookService } from "@buf/scrobble-moe_protobufs.bufbuild_connect-es/moe/scrobble/webhook/v1/webhook_service_connect.js";
import {
  ScrobbleRequest,
  ScrobbleResponse,
} from "@buf/scrobble-moe_protobufs.bufbuild_es/moe/scrobble/webhook/v1/webhook_pb.js";
import { Code, ConnectError, ServiceImpl } from "@connectrpc/connect";
import { createId } from "@paralleldrive/cuid2";
import { Provider } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { Anilist } from "../providers/anilist.js";

export class Webhook implements ServiceImpl<typeof WebhookService> {
  public async scrobble(req: ScrobbleRequest): Promise<ScrobbleResponse> {
    const server = await prisma.server
      .findUnique({
        where: {
          uuid: req.serverUuid,
        },
        include: {
          users: {
            include: {
              accounts: true,
            },
          },
        },
      })
      .catch((err: Error) => {
        throw new ConnectError(err.message, Code.Internal);
      });

    if (!server) {
      throw new ConnectError(
        `Server with UUID: ${req.serverUuid} not found.`,
        Code.NotFound,
      );
    }

    const user = server.users.find((u) => u.username === req.username);

    if (!user) {
      throw new ConnectError(`User: ${req.username} not found`, Code.NotFound);
    }

    if (!user.accounts.length) {
      throw new ConnectError(
        `No linked accounts for user: ${req.username}`,
        Code.FailedPrecondition,
      );
    }

    for (const account of user.accounts) {
      console.log(account);

      switch (account.provider) {
        case Provider.ANILIST: {
          console.log("ANILIST");

          const anilist = new Anilist(account.accessToken);

          const existingScrobble = await prisma.scrobble.findFirst({
            where: {
              providerMediaId: req.providerMediaId,
              episode: req.episode,
              user: {
                id: user.id,
              },
            },
          });

          const newScrobbleId = createId();

          await anilist
            .setProgress(parseInt(req.providerMediaId), req.episode)
            .then(async (status) => {
              await prisma.scrobbleProviderStatus.create({
                data: {
                  id: createId(),
                  provider: account.provider,
                  status,
                  scrobble: {
                    connectOrCreate: {
                      create: {
                        id: newScrobbleId,
                        episode: req.episode,
                        providerMediaId: req.providerMediaId,
                        server: {
                          connect: {
                            uuid: req.serverUuid,
                            secret: req.secret,
                          },
                        },
                        user: {
                          connect: {
                            id: user.id,
                          },
                        },
                      },
                      where: {
                        id: existingScrobble
                          ? existingScrobble.id
                          : newScrobbleId,
                      },
                    },
                  },
                },
              });
            })
            .catch((err: Error) => {
              throw new ConnectError(
                `Scrobble failed at provider ${account.provider} for media ${req.providerMediaId}:${req.episode}. Error: ${err}`,
              );
            });
        }

        break;

        case Provider.KITSU: {
          console.log("KITSU");
        }
        break;
      }
    }

    return new ScrobbleResponse();
  }
}
