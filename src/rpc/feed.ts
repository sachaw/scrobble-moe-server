import { ServiceImpl } from "@bufbuild/connect";
import { FeedService } from "@protobufs/feed/v1/feed_service_connect.js";
import {
  ScrobbleFeedRequest,
  ScrobbleFeedResponse,
} from "@protobufs/feed/v1/feed_pb.js";
import { ScrobbleFeedEventStream } from "../utils/events.js";

export class Feed implements ServiceImpl<typeof FeedService> {
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
