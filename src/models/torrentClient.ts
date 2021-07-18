import 'reflect-metadata';

import { Field, ID, ObjectType, registerEnumType } from 'type-graphql';

import { User } from './user';

enum TorrentClientApplication {
  DELUGE,
  RTORRENT,
  QBITTORRENT,
  UTORRENT,
}

registerEnumType(TorrentClientApplication, {
  name: "TorrentClientApplication",
});

@ObjectType()
export class TorrentClient {
  @Field((type) => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field((type) => TorrentClientApplication)
  client: TorrentClientApplication;

  @Field()
  clientVersion: string;

  @Field((type) => User)
  user: User;
}
