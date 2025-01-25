import { UsersClient } from "./users";
import { control } from "./client";

export class ApiClient {
  public users: UsersClient;

  constructor() {
    this.users = new UsersClient(control);
  }
}

const client = new ApiClient();
export { client };

export * from "./types/generic";
export * from "./types/users";
export * from "./types/locations";
export * from "./types/images";

export * from "./enums/user-role.enum";
