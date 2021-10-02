import "reflect-metadata";

import { Field, InputType, registerEnumType } from "type-graphql";

import type { Role } from "@prisma/client";
import { Prisma } from "@prisma/client";

import { DateTimeFilter } from "../utils/types/DateTimeFilter";
import { StringFilter } from "../utils/types/StringFilter";
import { BaseUserFilterWhereInput, UserArrayFilter } from "./user";

export enum RequestScope {
  GLOBAL,
  USER,
}

@InputType()
export class RelationFilter {
  @Field({ nullable: true })
  is?: string;

  @Field({ nullable: true })
  isNot?: string;
}

registerEnumType(RequestScope, {
  name: "RequestScope",
});

registerEnumType(Prisma.SortOrder, {
  name: "SortOrder",
});

@InputType()
export class OrderByFilter {
  @Field(() => Prisma.SortOrder, { nullable: true })
  id?: Prisma.SortOrder;

  @Field(() => Prisma.SortOrder, { nullable: true })
  createdAt?: Prisma.SortOrder;

  @Field(() => Prisma.SortOrder, { nullable: true })
  updatedAt?: Prisma.SortOrder;
}

@InputType()
export class WhereUniqueInput {
  @Field({ nullable: true })
  id?: string;
}

@InputType()
export class FilterWhereInput {
  @Field(() => StringFilter, { nullable: true })
  id?: StringFilter;

  @Field({ nullable: true })
  createdAt?: DateTimeFilter;

  @Field({ nullable: true })
  updatedAt?: DateTimeFilter;
}

@InputType()
export abstract class FindManyInput {
  @Field({ nullable: true })
  take?: number;

  @Field({ nullable: true })
  skip?: number;

  @Field(() => OrderByFilter, { nullable: true })
  orderBy?: OrderByFilter;
}

@InputType()
export abstract class FindManyWithScopeInput extends FindManyInput {
  @Field(() => RequestScope, { nullable: true })
  requestScope?: RequestScope;
}

type RestrictUser = <
  T extends FindManyWithScopeInput & { where?: { user?: BaseUserFilterWhereInput } }
>(
  filter: T,
  role: Role,
  userId: string
) => Omit<T, "requestScope">;
export const restrictUser: RestrictUser = (filter, role, userId) => {
  const { requestScope, ...prismaFilter } = filter;
  if (role === "USER" || requestScope === RequestScope.USER) {
    prismaFilter.where = {
      ...prismaFilter.where,
      //@ts-ignore - typescript doesn't know about user
      id: {
        equals: userId,
      },
    };
  }
  return prismaFilter;
};

export const restrictUser2: RestrictUser = (filter, role, userId) => {
  const { requestScope, ...prismaFilter } = filter;
  if (role === "USER" || requestScope === RequestScope.USER) {
    prismaFilter.where = {
      ...prismaFilter.where,
      //@ts-ignore - typescript doesn't know about user
      userId: {
        equals: userId,
      },
    };
  }
  return prismaFilter;
};

type RestrictUserArray = <
  T extends FindManyWithScopeInput & { where?: { users?: UserArrayFilter } }
>(
  filter: T,
  role: Role,
  userId: string
) => Omit<T, "requestScope">;
export const restrictUserArray: RestrictUserArray = (filter, role, userId) => {
  const { requestScope, ...prismaFilter } = filter;
  if (role === "USER" || requestScope === RequestScope.USER) {
    prismaFilter.where = {
      ...prismaFilter.where,
      users: {
        every: {
          id: {
            equals: userId,
          },
        },
      },
    };
  }
  return prismaFilter;
};

//createargs / createmany? / update / updatemany / upsert / delete / deletemany
