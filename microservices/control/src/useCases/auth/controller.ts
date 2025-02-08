import { AuthService } from "./service";
import { BunyanLogger } from "logger";
import { NextFunction, Response, Request } from "microservice";

export class AuthController {
  private readonly activity: { entity: string };
  private service: AuthService;
  private logger: BunyanLogger;

  constructor({
    service,
    logger,
  }: {
    service: AuthService;
    logger: BunyanLogger;
  }) {
    this.service = service;
    this.logger = logger;
    this.activity = {
      entity: "auth",
    };
  }

  async loginGoogle(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const url = await this.service.login();
    res.json({ url });
  }

  async loginGoogleCallback(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await this.service.callback(req.query.code as string);
      res
        .cookie("auth-token", result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          expires: result.expiry,
        })
        .status(200)
        .redirect(process.env.WEBAPP_URL as string);
    } catch (error: any) {
      this.logger.error(
        { error },
        `Error handling Google callback ${error?.message} for code ${req.query.code}`,
      );
      res
        .status(200)
        .redirect(`${process.env.WEBAPP_URL as string}/?error=login`);
    }
  }

  async loginDemo(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const result = await this.service.demoLogin(req.query.userID as string);
    res
      .cookie("auth-token", result.token, {
        httpOnly: false,
        secure: false,
        expires: result.expiry,
      })
      .status(200)
      .redirect(process.env.WEBAPP_URL as string);
  }

  async impersonate(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const result = await this.service.impersonateLogin(
      req.query.userID as string,
      res.locals.userId as string,
    );
    res
      .cookie("auth-token", result.token, {
        httpOnly: false,
        secure: false,
        expires: result.expiry,
      })
      .status(200)
      .redirect(process.env.WEBAPP_URL as string);
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    res.clearCookie("auth-token").status(200).json({ logout: true });
  }
}
