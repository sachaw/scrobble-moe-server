import { GraphQLByte } from "graphql-scalars";
import { Field, InputType } from "type-graphql";

@InputType()
export class BytesFilter {
  @Field(() => GraphQLByte, { nullable: true })
  equals?: Buffer;

  @Field(() => GraphQLByte, { nullable: true })
  not?: Buffer;
}
