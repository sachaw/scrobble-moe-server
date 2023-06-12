import { prisma } from "../lib/prisma.js";
import { Anilist } from "../providers/anilist.js";
import { UserManager } from "../utils/userManager.js";
import { BaseService } from "./BaseService.js";
import { ModelService } from "@buf/scrobble-moe_protobufs.bufbuild_connect-es/moe/scrobble/model/v1/model_service_connect.js";
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
} from "@buf/scrobble-moe_protobufs.bufbuild_es/moe/scrobble/model/v1/model_pb.js";
import {
  Code,
  ConnectError,
  HandlerContext,
  ServiceImpl,
} from "@bufbuild/connect";
import { createId } from "@paralleldrive/cuid2";
import { Provider, Role, Transport } from "@prisma/client";

export class Model
  extends BaseService<string>
  implements ServiceImpl<typeof ModelService>
{
  constructor(protected userManager: UserManager) {
    super(userManager);
  }

  public async getUser(req: GetUserRequest): Promise<GetUserRequest> {
    return new GetUserResponse();
  }
  public async getUsers(req: GetUsersRequest): Promise<GetUsersResponse> {
    return new GetUsersResponse();
  }

  public async getServer(
    req: GetServerRequest,
    ctx: HandlerContext,
  ): Promise<GetServerResponse> {
    this.authorization(ctx);

    return new GetServerResponse();
  }

  public async getServers(
    req: GetServersRequest,
    ctx: HandlerContext,
  ): Promise<GetServersResponse> {
    this.authorization(ctx);

    const servers = await prisma.server.findMany({
      where: {
        users: {
          every: {
            id: this.userManager.user.id,
          },
        },
      },
    });
    return new GetServersResponse({
      servers: servers.map((server) => {
        return {
          id: server.id,
          secret: server.secret,
          uuid: server.uuid,
        };
      }),
    });
  }

  public async addServer(
    req: AddServerRequest,
    ctx: HandlerContext,
  ): Promise<AddServerResponse> {
    this.authorization(ctx);

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
