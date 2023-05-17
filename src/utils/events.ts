import { PromiseSimpleEventDispatcher } from "ste-promise-simple-events";

export const ScrobbleFeedEventStream =
  new PromiseSimpleEventDispatcher<string>();
