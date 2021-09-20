import { Field, InputType } from "type-graphql";

@InputType()
export class IntFilter {
  @Field({ nullable: true })
  equals: number;

  @Field({ nullable: true })
  in: number;

  @Field({ nullable: true })
  notIn: number;

  @Field({ nullable: true })
  lt: number;

  @Field({ nullable: true })
  lte: number;

  @Field({ nullable: true })
  gt: number;

  @Field({ nullable: true })
  gte: number;

  @Field({ nullable: true })
  not: number;
}
