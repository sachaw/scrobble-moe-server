import axios, { AxiosStatic } from "axios";
import { GraphQLClient } from "graphql-request";

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
  ? AxiosStatic
  : never;

export abstract class BaseProvider<T extends ClientType> {
  constructor(type: T, endpoint: string, providerUserId: string, accessToken: string) {
    this.clientType = type;
    this.endpoint = endpoint;
    this.providerUserId = providerUserId;
    this.accessToken = accessToken;

    switch (this.clientType) {
      case "graphql":
        this.client = new GraphQLClient(this.endpoint) as Client<T>;
        break;
      case "rest":
        this.client = axios as Client<T>;
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

  abstract getEntry(id: number): Promise<ILibraryEntry>;

  abstract setProgress(id: number, episode: number, entry?: ILibraryEntry): Promise<ILibraryEntry>;
}
