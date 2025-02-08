import { UserRepository } from "./repository";
import { User, validateLocation } from "./model";
import { BunyanLogger } from "logger";
import {CreateUserDto, GeoPoint, IUser} from "api-client";
import { BadRequestError } from "library";
import { RetrieveWithFilterProps } from "../../types/common";

export class UserService {
  private repository: UserRepository;
  private logger: BunyanLogger;
  private roles: string[];

  constructor({
    repository,
    logger,
  }: {
    repository: UserRepository;
    logger: BunyanLogger;
  }) {
    this.repository = repository;
    this.logger = logger;
    this.roles = ["admin", "user"];
  }

  async retrieve({
    query = {},
    pagination,
    order,
    search,
  }: RetrieveWithFilterProps<IUser>) {
    return await this.repository.retrieveWithFilter({
      query,
      pagination,
      order,
      search,
    });
  }

  async retrieveByIds(userIDs: string[], query: any) {
    return await this.repository.retrieveByIds(userIDs, query);
  }

  async retrieveById(userId: string) {
    return await this.repository.retrieveWithFilter({
      query: { id: userId },
      pagination: { page: 1, pageSize: 1 },
      search: null,
      order: { direction: null, order: null },
    });
  }

  async createFromProvider(user: Partial<CreateUserDto> & { id: string }, provider: string, role: 'user') {
    const userExists = await this.repository.retrieveWithFilter({
      query: { email: user.email },
      order: { direction: null, order: null },
      pagination: { page: 0, pageSize: 0 },
      search: null,
    });
    if (userExists.users.length > 0) {
      const existingUser = userExists.users[0];
      // User already exists, log them in
      this.logger.debug(
        `Found user ${existingUser.id} with role ${existingUser.role} on ${provider} login, logging them in.`,
      );
      this.logger.trace({ existingUser });
      return userExists.users[0];
    } else {
      // User doesn't exist, create a new account
      this.logger.debug(
        `Did not found user with ${provider} login, creating the user and logging them in.`,
      );
      const newUser = await this.insert({
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        social: {
          [provider]: { id: user.id },
        },
        settings: {},
        role: role,
        publicProfile: false,
      });
      this.logger.trace({ newUser });
      return newUser;
    }
  }

  async insert(payload: Partial<IUser>) {
    const exists = await this.repository.emailExists(payload.email as string);
    if (exists)
      throw new BadRequestError({
        code: 409,
        message: "There is already a user with this email",
      });
    const user = User({ ...payload, role: "user" });
    return await this.repository.insert(user);
  }

  async update({ filters, attrs }: any) {
    const { enabled, createdAt, deletedAt, role, ...safeAttributes } = attrs;
    return await this.repository.update({ filters, attrs: safeAttributes });
  }

  async enable(userID: string) {
    return await this.repository.update({
      filters: { id: userID },
      attrs: { enabled: true },
    });
  }

  async disable(userID: string) {
    return await this.repository.update({
      filters: { id: userID },
      attrs: { enabled: false },
    });
  }

  async updateLocation(
    userID: string,
    location: { lat: string; long: string },
  ) {
    validateLocation(location);
    return await this.repository.update({
      filters: { id: userID },
      attrs: { "location.geo": this.generateGeo(location) },
    });
  }

  async updateLastSeenOn(
    userID: string,
    location: { lat: string; long: string },
  ) {
    validateLocation(location);
    return await this.repository.update({
      filters: { id: userID },
      attrs: { "location.lastSeenOn": this.generateGeo(location) },
    });
  }

  async promote(userID: string, role: string) {
    if (!this.roles.includes(role))
      throw new BadRequestError({
        code: 400,
        message: `You need to provide a role to promote a user. Available roles [${this.roles.join(",")}]`,
      });
    return await this.repository.update({
      filters: { id: userID },
      attrs: { role: role },
    });
  }

  async delete(userId: any) {
    return await this.repository.delete(userId);
  }

  private generateGeo(location: { lat: string; long: string }): {
    point: GeoPoint;
  } {
    return {
      point: {
        type: "Point",
        coordinates: [parseFloat(location.long), parseFloat(location.lat)],
      },
    };
  }
}
