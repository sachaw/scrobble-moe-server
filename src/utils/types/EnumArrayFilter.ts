import { Field, InputType } from "type-graphql";

export const EnumArrayFilter = <T extends object>(Enum: T) => {
  @InputType({ isAbstract: true })
  abstract class AbstractFnClass {
    @Field(() => [Enum], { nullable: true })
    equals: [keyof T];

    @Field(() => Enum, { nullable: true })
    has: keyof T;

    @Field(() => [Enum], { nullable: true })
    hasEvery: [keyof T];

    @Field(() => [Enum], { nullable: true })
    hasSome: [keyof T];

    @Field(() => Enum, { nullable: true })
    isEmpty: boolean;
  }
  return AbstractFnClass;
};
