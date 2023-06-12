import { ServiceImpl } from "@bufbuild/connect";
import { FeedService } from "@buf/scrobble-moe_protobufs.bufbuild_connect-es/moe/scrobble/feed/v1/feed_service_connect.js";
import {
  ScrobbleFeedRequest,
  ScrobbleFeedResponse,
} from "@buf/scrobble-moe_protobufs.bufbuild_es/moe/scrobble/feed/v1/feed_pb.js";
import { ScrobbleFeedEventStream } from "../utils/events.js";
import { UserManager } from "../utils/userManager.js";

export class Feed implements ServiceImpl<typeof FeedService> {
  constructor(protected userManager: UserManager) {}

  private eventSource = ScrobbleFeedEventStream;

  public async *scrobbleFeed(
    req: ScrobbleFeedRequest,
  ): AsyncGenerator<ScrobbleFeedResponse> {
    while (true) {
      yield new Promise<ScrobbleFeedResponse>((resolve) => {
        this.eventSource.subscribe(async (token) => {
          resolve(
            new ScrobbleFeedResponse({
              data: token,
            }),
          );
        });
      });
    }
  }
}
