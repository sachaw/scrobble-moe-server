import { Field, InputType } from "type-graphql";

export const EnumFilter = <T extends object>(Enum: T) => {
  @InputType({ isAbstract: true })
  abstract class AbstractFnClass {
    @Field(() => Enum, { nullable: true })
    equals?: keyof T;

    @Field(() => Enum, { nullable: true })
    in?: keyof T;

    @Field(() => Enum, { nullable: true })
    notIn?: keyof T;

    @Field(() => Enum, { nullable: true })
    not?: keyof T;
  }
  return AbstractFnClass;
};
