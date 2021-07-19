// import "reflect-metadata";

// import { Arg, Authorized, Ctx, Field, FieldResolver, InputType, Mutation, Query, Resolver, Root } from "type-graphql";

// import { Role, Scrobble, SeriesSubscription, Server, Session, TorrentClient } from "@prisma/client";

// import { Context } from "../";
// import { User } from "./user";
// import { Authenticator, LinkedAccount, Token } from ".pnpm/@prisma+client@2.27.0_prisma@2.27.0/node_modules/.prisma/client";

// @InputType()
// class ScrobbleInput {
//     @Field()
//   secret: string;

//   @Field({ nullable: true })
//   providerMediaId: string;

// }

// @Resolver(User)
// export class UserResolver {
//   constructor() {}

//   @Authorized(Role.ADMIN)
//   @Query((returns) => [User])
//   async allUsers(@Ctx() ctx: Context) {
//     return ctx.prisma.user.findMany();
//   }

//   @Authorized(Role.ADMIN, Role.USER)
//   @Query((returns) => User, { nullable: true })
//   async user(@Arg("userUniqueInput") userUniqueInput: UserUniqueInput, @Ctx() ctx: Context) {
//     if (ctx.user.role && ctx.user.role === Role.ADMIN) {
//       return ctx.prisma.user.findUnique({
//         where: {
//           id: userUniqueInput.id ? userUniqueInput.id : ctx.user.id,
//         },
//       });
//     } else {
//       return ctx.prisma.user.findUnique({
//         where: {
//           id: ctx.user.id,
//         },
//       });
//     }
//   }

//   //   @Query((returns) => User)
//   //   async user(@Arg("id") id: string) {
//   //     const recipe = await this.recipeService.findById(id);
//   //     if (recipe === undefined) {
//   //       throw new RecipeNotFoundError(id);
//   //     }
//   //     return recipe;
//   //   }

//   //   @Query((returns) => [Recipe])
//   //   recipes(@Args() { skip, take }: RecipesArgs) {
//   //     return this.recipeService.findAll({ skip, take });
//   //   }

//     @Mutation((returns) => Recipe)
//     @Authorized()
//     addRecipe(
//       @Arg("newRecipeData") newRecipeData: NewRecipeInput,
//       @Ctx("user") user: User
//     ): Promise<Recipe> {
//       return this.recipeService.addNew({ data: newRecipeData, user });
//     }

//   //   @Mutation((returns) => Boolean)
//   //   @Authorized(Roles.Admin)
//   //   async removeRecipe(@Arg("id") id: string) {
//   //     try {
//   //       await this.recipeService.removeById(id);
//   //       return true;
//   //     } catch {
//   //       return false;
//   //     }
//   //   }
// }
