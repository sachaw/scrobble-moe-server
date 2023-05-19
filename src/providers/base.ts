import got, { Got } from "got";
import { GraphQLClient } from "graphql-request";

import { ScrobbleStatus } from "@prisma/client";

export interface ILibraryEntry {
  mediaProviderId: number;
  title: string;
  progress: number;
  total: number;
}

type ClientType = "graphql" | "rest";
type Client<T extends ClientType> = T extends "graphql"
  ? GraphQLClient
  : T extends "rest"
  ? Got
  : never;

export abstract class BaseProvider<T extends ClientType> {
  constructor(type: T, endpoint: string, accessToken?: string) {
    this.clientType = type;
    this.endpoint = endpoint;
    if (accessToken) {
      this.accessToken = accessToken;
    }

    switch (this.clientType) {
      case "graphql":
        this.client = new GraphQLClient(this.endpoint) as Client<T>;
        break;
      case "rest":
        this.client = got as Client<T>;
        break;
      default:
        throw new Error("Invalid client type");
    }
  }

  protected endpoint: string;

  protected clientType: T;

  protected client: Client<T>;

  protected providerUserId: string;

  protected accessToken: string;

  abstract getEntry(id: number): Promise<ILibraryEntry | undefined>;

  abstract setProgress(
    id: number,
    episode: number,
    entry?: ILibraryEntry,
  ): Promise<ScrobbleStatus>;
}
