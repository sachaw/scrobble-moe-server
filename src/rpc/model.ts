import {
  Code,
  ConnectError,
  HandlerContext,
  ServiceImpl,
} from "@bufbuild/connect";
import { prisma } from "../lib/prisma.js";
import { Provider } from "@prisma/client";
import { Anilist } from "../providers/anilist.js";
import { createId } from "@paralleldrive/cuid2";
import { ModelService } from "@protobufs/model/v1/model_service_connect.js";
import {
  AddServerRequest,
  AddServerResponse,
  GetServerRequest,
  GetServerResponse,
  GetServersRequest,
  GetServersResponse,
  GetUserRequest,
  GetUserResponse,
  GetUsersRequest,
  GetUsersResponse,
} from "@protobufs/model/v1/model_pb.js";
import { getPlexServers } from "../utils/plex.js";

// function Auth(userGroup: string): ClassDecorator {
//   return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
//     const originalMethod = descriptor.value;

//     descriptor.value = async function (...args: any[]) {
//       const [req, ctx] = args;
//       const userGroupFromContext = ctx.group; // Assuming the group information is located in ctx.group

//       // Check if the user group matches the allowed group
//       if (userGroupFromContext === userGroup) {
//         // Call the original method if the user is authorized
//         return await originalMethod.apply(this, args);
//       } else {
//         throw new Error('Unauthorized access');
//       }
//     };

//     return descriptor;
//   };
// }

export function Auth(group: boolean) {
  return (
    _target: Object,
    _key: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    // const original = descriptor.value;

    // // eslint-disable-next-line
    // descriptor.value = function (...args: any[]) {
    //   const context = args.find((arg) => arg instanceof ServiceContext);

    //   checkContext(context);

    //   const accessToken = (context as ServiceContext).request.cookies[tokenName];

    //   if (!accessToken) {
    //     throw new Errors.UnauthorizedError(
    //       `No '${tokenName}' access token provided.`
    //     );
    //   }

    //   checkSecret();

    //   try {
    //     jwt.verify(accessToken, process.env.JWT_SECRET as string);
    //   } catch (error) {
    //     throw new Errors.ForbiddenError(
    //       'Invalid or expired JWT provided.'
    //     );
    //   }

    //   return original.apply(this, args);
    // };
    console.log("test");
    return _target;
  };
}

export class Model implements ServiceImpl<typeof ModelService> {
  public async getUser(req: GetUserRequest): Promise<GetUserRequest> {
    return new GetUserResponse();
  }
  public async getUsers(req: GetUsersRequest): Promise<GetUsersResponse> {
    return new GetUsersResponse();
  }
  public async getServer(req: GetServerRequest): Promise<GetServerResponse> {
    return new GetServerResponse();
  }
  public async getServers(req: GetServersRequest): Promise<GetServersResponse> {
    return new GetServersResponse();
  }
  @Auth(true)
  public async addServer(
    req: AddServerRequest,
    ctx: HandlerContext,
  ): Promise<AddServerResponse> {
    //loged in user

    // const servers = await getPlexServers(ctx.user.plexAuthToken ?? "");

    // const serverToLink = servers.find(
    //   (server) => server._attributes.machineIdentifier === linkServerInput.machineIdentifier
    // );

    // await prisma.server.create({
    //   data: {
    //     id: createId(),
    //     name: req.name,
    //     secret:

    //   }
    // })
    return new AddServerResponse();
  }
}
