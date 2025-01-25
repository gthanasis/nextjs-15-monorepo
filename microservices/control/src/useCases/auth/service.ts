import { BunyanLogger } from "logger";
import { Credentials, OAuth2Client } from "google-auth-library";
import { UserService } from "../users/service";
import { JWT } from "library";

interface UserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export class AuthService {
  private logger: BunyanLogger;
  private client: OAuth2Client;
  private userService: UserService;
  private jwtLib: JWT;

  constructor({
    logger,
    client,
    userService,
    jwtLib,
  }: {
    logger: BunyanLogger;
    client: OAuth2Client;
    userService: UserService;
    jwtLib: JWT;
  }) {
    this.logger = logger;
    this.client = client;
    this.userService = userService;
    this.jwtLib = jwtLib;
  }

  /**
   * Redirects the user to Google for authentication
   */
  async login(): Promise<string> {
    this.logger.debug(`Staring Google auth`);
    return this.client.generateAuthUrl({
      access_type: "offline",
      scope: ["openid", "email", "profile"],
    });
  }

  /**
   * Handles the Google callback and logs the user in
   */
  async callback(code: string) {
    this.logger.debug(`Getting info back from Google auto`);
    const { tokens } = await this.client.getToken(code);

    // Use the tokens to authenticate the user and get their profile info
    const user = await this.authenticate(tokens);

    // Log the user in
    const { token, expiry } = await this.loginUser(user);
    return { token, expiry };
  }

  /**
   * Authenticates the user with Google and returns their profile info
   */
  async authenticate(tokens: Credentials) {
    this.logger.debug(`Authenticating user with Google`);
    this.client.setCredentials(tokens);

    const { data } = await this.client.request<UserInfo>({
      url: "https://www.googleapis.com/oauth2/v1/userinfo",
      method: "GET",
    });

    // eslint-disable-next-line camelcase
    const { id, email, given_name, family_name, picture } = data;

    this.logger.debug(data);

    // eslint-disable-next-line camelcase
    return { id, email, given_name, family_name, picture };
  }

  async loginGoogleOneTouch(code: string) {
    this.logger.debug(`Authenticating user with Google`, {
      audience: process.env.GOOGLE_LOGIN_CLIENTID,
    });
    const ticket = await this.client.verifyIdToken({
      idToken: code,
      audience: process.env.GOOGLE_LOGIN_CLIENTID, // Ensure the token is for your app
    });

    const payload = ticket.getPayload(); // Contains user info
    const userId = payload?.sub; // Unique Google user ID

    const { token, expiry } = await this.loginUser({ email: payload?.email });
    return { token, expiry };
  }

  /**
   * Logs the user in by creating or finding their account in the database
   */
  async loginUser(user: any) {
    this.logger.debug(`Logging user in`);
    // Check if the user already exists in the database
    const response = await this.userService.retrieve({
      // We should renable this. It's disabled cause of a bug that was removing the social.google.id from the user
      // query: { email: user.email, 'social.google.id': user.id },
      query: { email: user.email },
      order: { direction: null, order: null },
      pagination: { page: 0, pageSize: 0 },
      search: null,
    });

    if (response.count > 0) {
      const existingUser = response.users[0];
      // User already exists, log them in
      this.logger.debug(
        `Found user ${existingUser.id} with role ${existingUser.role} on google login, logging them in.`,
      );
      this.logger.trace({ existingUser });
      return await this.generateToken(existingUser.id, existingUser.role);
    } else {
      // User doesn't exist, create a new account
      this.logger.debug(
        `Did not found user with google login, creating the user and logging them in.`,
      );
      const newUser = await this.userService.insert({
        name: `${user.given_name || ""} ${user.family_name || ""}`,
        email: user.email,
        profileImage: user.picture,
        social: {
          google: { id: user.id },
        },
      });
      this.logger.trace({ newUser });
      return await this.generateToken(newUser.id, newUser.role);
    }
  }

  async demoLogin(userId: string) {
    let userID = userId;
    if (!userID) {
      this.logger.debug(
        `No user passed, resolving to the first admin user found.`,
      );
      const results = await this.userService.retrieve({
        query: { role: "admin" },
        order: { direction: null, order: null },
        pagination: { page: 0, pageSize: 0 },
        search: null,
      });
      userID = results.users[0].id;
    }
    this.logger.debug(`Logging user ${userID} in`);
    // Check if the user already exists in the database
    const response = await this.userService.retrieve({
      query: { id: userID },
      order: { direction: null, order: null },
      pagination: { page: 0, pageSize: 0 },
      search: null,
    });

    if (response.count > 0) {
      const existingUser = response.users[0];
      // User already exists, log them in
      this.logger.debug(
        `Found user ${existingUser.id} with role ${existingUser.role} on demo login, logging them in.`,
      );
      this.logger.trace({ existingUser });
      return await this.generateToken(existingUser.id, existingUser.role);
    } else {
      throw new Error("Did not find user for demo login");
    }
  }

  async impersonateLogin(userID: string, impersonatorID: string) {
    this.logger.debug(`Logging user in`);
    // Check if the user already exists in the database
    const response = await this.userService.retrieve({
      query: { id: userID },
      order: { direction: null, order: null },
      pagination: { page: 0, pageSize: 0 },
      search: null,
    });

    if (response.count > 0) {
      const existingUser = response.users[0];
      // User already exists, log them in
      this.logger.debug(
        `Found user ${existingUser.id} with role ${existingUser.role} on impersonate login, logging them in.`,
      );
      this.logger.trace({ existingUser });
      return await this.generateToken(
        existingUser.id,
        existingUser.role,
        true,
        impersonatorID,
      );
    } else {
      throw new Error("Did not find user for impersonate login");
    }
  }

  /**
   *
   * Here are some best practices for using JWTs:
   *
   *  - Use strong secret keys: Choose a secret key that is long and random, and keep it secret. Do not use easily guessable keys.
   *  - Set appropriate expiration times: Set expiration times on your JWTs that are appropriate for your use case. Shorter expiration times can help reduce the risk of stolen or compromised tokens.
   *  - Use HTTPS: Always use HTTPS to transmit JWTs to prevent man-in-the-middle attacks.
   *  - Do not store sensitive data: Do not store sensitive data, such as passwords or credit card information, in JWTs. Instead, store a reference to the data in the token and verify the reference on the server.
   *  - Verify the signature: Verify the signature of incoming JWTs to ensure that they have not been tampered with or modified.
   *  - Use refresh tokens: Use refresh tokens to obtain new JWTs instead of requesting the user to log in again. This can help improve user experience and reduce the number of authentication requests.
   *  - Implement rate limiting: Implement rate limiting to prevent brute force attacks and limit the number of requests an attacker can make.
   *  - Always validate inputs: Always validate inputs to prevent injection attacks and other vulnerabilities.
   *  - Keep your libraries up to date: Keep your JWT libraries up to date to ensure that you are using the latest security patches and fixes.
   *  - Use JWTs in addition to other security measures: Use JWTs as part of a larger security strategy that includes other measures, such as encryption and access control.
   *
   * @param userId
   * @param role
   * @param impersonate
   * @param impersonatorID
   * @private
   */

  private async generateToken(
    userId: string,
    role: string,
    impersonate = false,
    impersonatorID = "",
  ): Promise<{ token: string; expiry: Date }> {
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 20);
    const unixTimestamp = Math.floor(oneWeekFromNow.getTime() / 1000);
    const impersonated = impersonate
      ? { impersonate: true, impersonatorID }
      : {};
    return {
      token: this.jwtLib.create({
        payload: {
          role,
          id: userId,
          exp: unixTimestamp,
          ...impersonated,
        },
      }),
      expiry: oneWeekFromNow,
    };
  }
}
