import { Field, InputType } from "type-graphql";

export const ArrayFilter = <T extends object>(Filter: T) => {
  @InputType({ isAbstract: true })
  abstract class AbstractFnClass {
    @Field(() => Filter, { nullable: true })
    every: T;

    @Field(() => Filter, { nullable: true })
    some: T;

    @Field(() => Filter, { nullable: true })
    none: T;
  }
  return AbstractFnClass;
};
