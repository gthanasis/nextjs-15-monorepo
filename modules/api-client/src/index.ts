import { UsersClient } from "./users";
import { control } from "./client";
import { Authenticated } from "./authenticated";

export class ApiClient {
  public users: UsersClient;

  constructor() {
    this.users = new UsersClient(control);
  }

  public setToken(token: string | null) {
    // Set token for all API clients
    Object.values(this)
    .filter((client): client is Authenticated => client instanceof Authenticated)
    .forEach(client => client.setToken(token));
  }
}

const client = new ApiClient();
export { client };

export * from "./types/generic";
export * from "./types/users";
export * from "./types/locations";
export * from "./types/images";

export * from "./enums/user-role.enum";
