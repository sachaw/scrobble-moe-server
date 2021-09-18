import "reflect-metadata";

import { ByteResolver, ByteTypeDefinition } from "graphql-scalars";
import { Field, InputType, registerEnumType } from "type-graphql";

import type { Role } from "@prisma/client";
import { Prisma } from "@prisma/client";

import { UserFilterWhereInput } from "./user";

/**
 * @todo check enum type may need to have string value
 */
export enum FilterMode {
  "default",
  "insensitive",
}

export enum RequestScope {
  GLOBAL,
  USER,
}

@InputType()
export class RelationFilter {
  @Field({ nullable: true })
  is: string;

  @Field({ nullable: true })
  isNot: string;
}

registerEnumType(RequestScope, {
  name: "RequestScope",
});

registerEnumType(FilterMode, {
  name: "FilterMode",
});

registerEnumType(Prisma.SortOrder, {
  name: "SortOrder",
});

@InputType()
export class DateTimeFilter {
  @Field({ nullable: true })
  equals: Date;

  @Field({ nullable: true })
  in: Date;

  @Field({ nullable: true })
  notIn: Date;

  @Field({ nullable: true })
  lt: Date;

  @Field({ nullable: true })
  lte: Date;

  @Field({ nullable: true })
  gt: Date;

  @Field({ nullable: true })
  gte: Date;

  @Field({ nullable: true })
  not: Date;
}

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

@InputType()
export class StringFilter {
  @Field({ nullable: true })
  equals: string;

  @Field({ nullable: true })
  in: string;

  @Field({ nullable: true })
  notIn: string;

  @Field({ nullable: true })
  lt: string;

  @Field({ nullable: true })
  lte: string;

  @Field({ nullable: true })
  gt: string;

  @Field({ nullable: true })
  gte: string;

  @Field({ nullable: true })
  contains: string;

  @Field({ nullable: true })
  endsWith: string;

  @Field(() => FilterMode, { nullable: true })
  mode: "default" | "insensitive";

  @Field({ nullable: true })
  not: string;

  @Field({ nullable: true })
  startsWith: string;
}

/**
 * FIXME:
 */
@InputType()
export class BytesFilter {
  @Field(() => ByteResolver, { nullable: true })
  equals: typeof ByteTypeDefinition;

  // @Field({ nullable: true })
  // not: Byte;
}

@InputType()
export class OrderByFilter {
  @Field(() => Prisma.SortOrder, { nullable: true })
  id: Prisma.SortOrder;

  @Field(() => Prisma.SortOrder, { nullable: true })
  createdAt: Prisma.SortOrder;

  @Field(() => Prisma.SortOrder, { nullable: true })
  updatedAt: Prisma.SortOrder;
}

@InputType()
export class WhereUniqueInput {
  @Field({ nullable: true })
  id: string;
}

@InputType()
export class FilterWhereInput {
  @Field(() => StringFilter, { nullable: true })
  id: StringFilter;
  @Field({ nullable: true })
  createdAt: DateTimeFilter;
  @Field({ nullable: true })
  updatedAt: DateTimeFilter;
}

@InputType()
export abstract class FindManyInput {
  @Field({ nullable: true })
  take: number;

  @Field({ nullable: true })
  skip: number;

  @Field(() => OrderByFilter, { nullable: true })
  orderBy: OrderByFilter;
}

@InputType()
export abstract class FindManyWithScopeInput extends FindManyInput {
  @Field(() => RequestScope, { nullable: true })
  requestScope: RequestScope;
}

type RestrictUser = <T extends FindManyWithScopeInput & { where: { user: UserFilterWhereInput } }>(
  filter: T,
  role: Role,
  userId: string
) => Omit<T, "requestScope">;
export const restrictUser: RestrictUser = (filter, role, userId) => {
  const { requestScope, ...prismaFilter } = filter;
  if (role === "USER" || requestScope === RequestScope.USER) {
    prismaFilter.where.user.id.equals = userId;
  }
  return prismaFilter;
};

//createargs / createmany? / update / updatemany / upsert / delete / deletemany
