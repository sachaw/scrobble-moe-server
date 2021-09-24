import { Field, InputType } from "type-graphql";

@InputType()
export class DateTimeFilter {
  @Field({ nullable: true })
  equals?: Date;

  @Field({ nullable: true })
  in?: Date;

  @Field({ nullable: true })
  notIn?: Date;

  @Field({ nullable: true })
  lt?: Date;

  @Field({ nullable: true })
  lte?: Date;

  @Field({ nullable: true })
  gt?: Date;

  @Field({ nullable: true })
  gte?: Date;

  @Field({ nullable: true })
  not?: Date;
}
