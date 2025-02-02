import "source-map-support/register";

import express, {
  Express,
  Request,
  Response,
  NextFunction,
  Router,
  ErrorRequestHandler,
  RequestHandler,
} from "express";
import formData from "express-form-data";
import methodOverride from "method-override";
import { Server } from "http";
import process from "process";
import { BunyanLogger } from "logger";
import AsyncErrorHandler from "./AsyncErrorHandler";
import cors from "cors";
import cookieParser from "cookie-parser";

export type ServiceConstructorProps = {
  logger: BunyanLogger;
  port: number;
  name: string;
  version: string;
  env: string;
  host: string;
  options: ExpressOptions;
  allowedDomains?: string[];
  prefix?: string;
};

type ExpressOptions = {
  disableXpoweredBy?: boolean;
  bodyUrlencoded?: boolean;
  bodyJson?: boolean;
  formParseData?: boolean;
  methodOverride?: boolean;
  bodyText?: boolean;
  continueOnException?: boolean;
  continueOnRejection?: boolean;
};

class AbstractService {
  logger: BunyanLogger;
  app: Express;
  private server: Server | undefined;
  protected port: number;
  protected name: string;
  protected version: string;
  protected env: string;
  protected host: string;

  protected mongo?: any;
  protected producer?: any;
  protected messageConsumerFactory?: any;
  private messageProducer: any;
  // TODO: this is a temporary solution to prevent some
  //  services from failing when kafkajs raises an exception
  //  we should follow the best practices and fail on such exceptions
  //  or rethink the error handling
  private continueOnRejection = false;
  private continueOnException = false;
  private broadcastMessageConsumerFactory: any;
  private router: Router;
  private allowedDomains: string[];
  private prefix?: string;

  constructor(props: ServiceConstructorProps) {
    if (this.constructor.name === "AbstractService")
      throw new TypeError("Cannot construct Abstract instances directly");
    const {
      logger,
      port,
      name,
      version,
      env,
      host,
      options,
      allowedDomains = [],
      prefix,
    } = props;
    this.logger = logger;
    this.port = port;
    this.name = name;
    this.version = version;
    this.env = env;
    this.host = host;
    this.app = express();
    this.logger = logger;
    this.allowedDomains = allowedDomains;
    this.prefix = prefix;
    process.on("uncaughtException", this.uncaughtException.bind(this));
    process.on("unhandledRejection", this.unhandledRejection.bind(this));
    this.buildApp(options);
    this.router = Router();
  }

  protected buildApp(opts: ExpressOptions): void {
    const getOption = (
      options: ExpressOptions,
      optionName: string,
      def: boolean,
    ) => {
      if (typeof options !== "object") return def;
      if (options.hasOwnProperty(optionName)) return options[optionName];
      return def;
    };

    const optDisableXpoweredBy = getOption(opts, "disableXpoweredBy", true);
    let optBodyUrlencoded = getOption(opts, "bodyUrlencoded", false);
    let optBodyJson = getOption(opts, "bodyJson", true);
    const optFormParseData = getOption(opts, "formParseData", false);
    const optMethodOverride = getOption(opts, "methodOverride", true);
    const optBodyText = getOption(opts, "bodyText", false);
    this.continueOnException = getOption(opts, "continueOnException", false);
    this.continueOnRejection = getOption(opts, "continueOnRejection", false);

    // Check if we really need method override
    if (optMethodOverride) this.app.use(methodOverride());
    if (optDisableXpoweredBy) this.app.disable("x-powered-by");
    if (optBodyUrlencoded) {
      if (typeof optBodyUrlencoded !== "object")
        optBodyUrlencoded = { extended: true, limit: "15mb" };
      this.app.use(express.urlencoded(optBodyUrlencoded));
    }
    if (optBodyJson) {
      if (typeof optBodyJson !== "object") optBodyJson = {};
      this.app.use(express.json(optBodyJson));
    }
    if (optFormParseData) this.app.use(formData.parse());
    if (optBodyText) this.app.use(express.text());
    this.app.use(cookieParser());
    this.app.use(cors({ origin: this.allowedDomains, credentials: true }));
  }

  /**
   * Starts the service
   */
  async start(): Promise<void> {
    this.app.use(this.router);
    await this.listen(this.port, this.host);
    this.app.use("/", this.ping);
    this.app.use(this.errorBoundary);
    try {
      await this.createConnections();
      await this.createMessageQueueConnection();
      // this.setRoutes()
      this._printServiceInfo();
      process.on("SIGTERM", () => {
        this.logger.trace(`SIGTERM signal received, stopping`);
        return this.stop();
      });
      process.on("SIGINT", () => {
        this.logger.trace(`SIGINT signal received, stopping`);
        return this.stop();
      });
    } catch (error) {
      this.logger.error(error);
      process.exit(1);
    }
  }

  /**
   * Stops the express server and closes connections
   */
  async stop(): Promise<void> {
    try {
      this.logger.warn("Shut down requested, closing connections");
      process.on("SIGTERM", () => {
        process.exit();
      });
      process.on("SIGINT", () => {
        process.exit();
      });
      this.logger.trace(`Close express server`);
      await this.close();
      this.logger.trace(`Close open third party connections`);
      await this.closeConnections();
      this.logger.warn("Server shut down gracefully");
      await process.exit();
    } catch (err) {
      this.logger.trace("Error while stopping");
      this.logger.error({ err });
      process.exit();
    }
  }

  /**
   * Express promisified methods
   */

  protected async listen(port: number, host: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = this.app
        .listen(port, host)
        .on("listening", () => resolve())
        .on("error", (err) => reject(err));
    });
  }

  protected close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server !== undefined) {
        this.server.close((err) => {
          if (err) this.logger.error(err);
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  protected closeConnections(): Promise<void> {
    return Promise.resolve();
  }

  protected createConnections(): Promise<void> {
    return Promise.resolve();
  }

  protected createMessageQueueConnection(): Promise<void> {
    return Promise.resolve();
  }

  public addRouter(router: Router): void {
    this.prefix
      ? this.app.use(`/${this.prefix}`, router)
      : this.app.use(router);
  }

  /**
   * Misc helper methods
   */

  protected ping: RequestHandler = (req, res, next) => {
    const stats = Object.assign(
      {},
      { mscName: this.name },
      { uptime: process.uptime() },
      { memoryUsage: process.memoryUsage() },
      { cpuUsage: process.cpuUsage() },
    );
    res.json(stats);
  };

  protected errorBoundary: ErrorRequestHandler = (err, req, res, next) => {
    if (err) {
      const errorType = err.type;
      let message = `Something went wrong.`;
      let code = 500;
      switch (errorType) {
        case "operational":
          message = err.message;
          code = err.code;
          break;
      }
      if (err.original) err.message += `\noriginal:\n ${err.original.message}`;
      this.logger.error({ err });
      const error = { error: message };
      res.status(code).json({ error: message });
    }
  };

  protected _printServiceInfo(): void {
    const levels = {
      60: "fatal",
      50: "error",
      40: "warn",
      30: "info",
      20: "debug",
      10: "trace",
    };
    const name = `Name: ${this.name}`;
    const version = `Version: ${this.version}`;
    const environment = `Environment: ${this.env}`;
    const port = `Port: ${this.port}`;
    const logLevel = `Log level: ${levels[this.logger.level()]}`;

    const mongoCols = this.mongo != null ? this.mongo.collectionsAvailable : [];
    const collections =
      this.mongo != null
        ? `⛁ Mongo Collections:\n| - ${mongoCols.join(",\n| - ")}`
        : `⛁ No connection with Mongo`;

    const producer =
      this.messageProducer != null
        ? `📨 Kafka producer: Connected`
        : "📨 No Kafka producer";
    const consumer =
      this.messageConsumerFactory != null &&
      this.messageConsumerFactory.topics.length > 0
        ? `📨 Kafka consumer subscribed to: ${this.messageConsumerFactory.topics.join(", ")}\n`
        : "📨 No Kafka consumer";
    const broadCastConsumer =
      this.broadcastMessageConsumerFactory != null &&
      this.broadcastMessageConsumerFactory.topics.length > 0
        ? `📨 Kafka broadcast consumer subscribed to: ${this.broadcastMessageConsumerFactory.topics.join(", ")}\n`
        : "";

    this.logger.info(
      `\nService started\n| ${name}\n| ${version}\n| ${environment}\n| ${port}\n| ${logLevel}\n| ${collections}\n| ${producer}\n| ${consumer}\n| ${broadCastConsumer}`,
    );
  }

  protected unhandledRejection(err: Error): void {
    this.logger.warn(`Exiting due to unhandledRejection`);
    // TODO: exit if error in not Operational
    // https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/shuttingtheprocess.md
    if (this.logger) this.logger.error({ err });
    else console.error(err);
    if (!this.continueOnRejection) process.exit(1);
  }

  protected uncaughtException(err: Error): void {
    this.logger.warn(`Exiting due to uncaughtException`);
    // TODO: exit if error in not Operational
    // https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/shuttingtheprocess.md
    if (this.logger) this.logger.error({ err });
    else console.error(err);
    if (!this.continueOnException) process.exit(1);
  }

  static generateRouter(): Router {
    return Router();
  }
}

export default AbstractService;
export {
  AsyncErrorHandler,
  Express,
  Request,
  Response,
  NextFunction,
  Router,
  ErrorRequestHandler,
  RequestHandler,
};
