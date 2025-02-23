import { BunyanLogger } from "logger";
import { RequestHandler } from "microservice";
import { randomUUID } from "crypto";

type Props = {
  logger: BunyanLogger;
  excludePaths?: string[];
};

export const requestLogger =
  (props: Props): RequestHandler =>
  (req, res, next) => {
    const { logger, excludePaths = [] } = props;
    const requestId = randomUUID();
    const startTime = Date.now();

    // Skip logging for excluded paths
    if (excludePaths.some((path) => req.path.startsWith(path))) {
      return next();
    }

    // Prepare request details for logging
    const requestDetails = {
      requestId,
      method: req.method,
      path: req.path,
      query: req.query,
      headers: {
        ...req.headers,
        // Exclude sensitive headers
        authorization: req.headers.authorization ? "[REDACTED]" : undefined,
        cookie: req.headers.cookie ? "[REDACTED]" : undefined,
      },
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    };

    // Format query parameters for logging
    const queryString = Object.keys(req.query).length
      ? `?${new URLSearchParams(req.query as Record<string, string>).toString()}`
      : "";

    // Log request start
    logger.trace(
      // { ...requestDetails, event: "request_start" },
      `[${requestId}] → ${req.method} ${req.path}${queryString} - From: ${req.ip} - Agent: ${req.headers["user-agent"] || "unknown"}`,
    );

    // Add request ID to response headers for tracking
    res.setHeader("X-Request-ID", requestId);

    // Store request ID in res.locals for potential use in other middlewares
    res.locals.requestId = requestId;

    next();
  };
