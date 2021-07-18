import "reflect-metadata";

import { Arg, Authorized, Ctx, Field, FieldResolver, InputType, Query, Resolver, Root } from "type-graphql";

import { Role, Scrobble, SeriesSubscription, Server, Session, TorrentClient } from "@prisma/client";

import { Context } from "../";
import { User } from "./user";
import { Authenticator, LinkedAccount, Token } from ".pnpm/@prisma+client@2.27.0_prisma@2.27.0/node_modules/.prisma/client";

@InputType()
class UserUniqueInput {
  @Field({ nullable: true })
  id: string;
}

@Resolver(User)
export class UserResolver {
  constructor() {}

  @FieldResolver()
  async authenticators(@Root() user: User, @Ctx() ctx: Context): Promise<Authenticator[]> {
    return ctx.prisma.user
      .findUnique({
        where: {
          id: user.id,
        },
      })
      .authenticators();
  }

  @FieldResolver()
  async accounts(@Root() user: User, @Ctx() ctx: Context): Promise<LinkedAccount[]> {
    return ctx.prisma.user
      .findUnique({
        where: {
          id: user.id,
        },
      })
      .accounts();
  }

  @FieldResolver()
  async tokens(@Root() user: User, @Ctx() ctx: Context): Promise<Token[]> {
    return ctx.prisma.user
      .findUnique({
        where: {
          id: user.id,
        },
      })
      .tokens();
  }

  @FieldResolver()
  async sessions(@Root() user: User, @Ctx() ctx: Context): Promise<Session[]> {
    return ctx.prisma.user
      .findUnique({
        where: {
          id: user.id,
        },
      })
      .sessions();
  }

  @FieldResolver()
  async scrobbles(@Root() user: User, @Ctx() ctx: Context): Promise<Scrobble[]> {
    return ctx.prisma.user
      .findUnique({
        where: {
          id: user.id,
        },
      })
      .scrobbles();
  }

  @FieldResolver()
  async servers(@Root() user: User, @Ctx() ctx: Context): Promise<Server[]> {
    return ctx.prisma.user
      .findUnique({
        where: {
          id: user.id,
        },
      })
      .servers();
  }

  @FieldResolver()
  async torrentClients(@Root() user: User, @Ctx() ctx: Context): Promise<TorrentClient[]> {
    return ctx.prisma.user
      .findUnique({
        where: {
          id: user.id,
        },
      })
      .torrentClients();
  }

  @FieldResolver()
  async seriesSubscriptions(@Root() user: User, @Ctx() ctx: Context): Promise<SeriesSubscription[]> {
    return ctx.prisma.user
      .findUnique({
        where: {
          id: user.id,
        },
      })
      .seriesSubscriptions();
  }

  @Authorized(Role.ADMIN)
  @Query((returns) => [User])
  async allUsers(@Ctx() ctx: Context) {
    return ctx.prisma.user.findMany();
  }

  @Authorized(Role.ADMIN, Role.USER)
  @Query((returns) => User, { nullable: true })
  async user(@Arg("userUniqueInput") userUniqueInput: UserUniqueInput, @Ctx() ctx: Context) {
    if (ctx.user.role && ctx.user.role === Role.ADMIN) {
      return ctx.prisma.user.findUnique({
        where: {
          id: userUniqueInput.id ? userUniqueInput.id : ctx.user.id,
        },
      });
    } else {
      return ctx.prisma.user.findUnique({
        where: {
          id: ctx.user.id,
        },
      });
    }
  }

  //   @Query((returns) => User)
  //   async user(@Arg("id") id: string) {
  //     const recipe = await this.recipeService.findById(id);
  //     if (recipe === undefined) {
  //       throw new RecipeNotFoundError(id);
  //     }
  //     return recipe;
  //   }

  //   @Query((returns) => [Recipe])
  //   recipes(@Args() { skip, take }: RecipesArgs) {
  //     return this.recipeService.findAll({ skip, take });
  //   }

  //   @Mutation((returns) => Recipe)
  //   @Authorized()
  //   addRecipe(
  //     @Arg("newRecipeData") newRecipeData: NewRecipeInput,
  //     @Ctx("user") user: User
  //   ): Promise<Recipe> {
  //     return this.recipeService.addNew({ data: newRecipeData, user });
  //   }

  //   @Mutation((returns) => Boolean)
  //   @Authorized(Roles.Admin)
  //   async removeRecipe(@Arg("id") id: string) {
  //     try {
  //       await this.recipeService.removeById(id);
  //       return true;
  //     } catch {
  //       return false;
  //     }
  //   }
}
