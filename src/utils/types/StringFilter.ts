import { Field, InputType, registerEnumType } from "type-graphql";

export enum FilterMode {
  "default",
  "insensitive",
}

registerEnumType(FilterMode, {
  name: "FilterMode",
});

@InputType()
export class StringFilter {
  @Field({ nullable: true })
  equals?: string;

  @Field({ nullable: true })
  in?: string;

  @Field({ nullable: true })
  notIn?: string;

  @Field({ nullable: true })
  lt?: string;

  @Field({ nullable: true })
  lte?: string;

  @Field({ nullable: true })
  gt?: string;

  @Field({ nullable: true })
  gte?: string;

  @Field({ nullable: true })
  contains?: string;

  @Field({ nullable: true })
  endsWith?: string;

  @Field(() => FilterMode, { nullable: true })
  mode?: "default" | "insensitive";

  @Field({ nullable: true })
  not?: string;

  @Field({ nullable: true })
  startsWith?: string;
}
