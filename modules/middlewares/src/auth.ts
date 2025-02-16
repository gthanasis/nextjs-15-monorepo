import { JWT } from "library";
import { BunyanLogger } from "logger";
import { RequestHandler } from "microservice";

interface JWTPayload {
  id: string;
  role: string;
  [key: string]: unknown;
}

type Props = {
  jtwLib: JWT;
  roles?: string[];
  restrictUserId?: boolean;
  logger?: BunyanLogger;
  enforceUserId?: boolean;
};

const extractToken = (req: any): string | null => {
  const authHeader = req.headers["authorization"];
  const cookieToken = req.cookies?.["auth-token"];
  const bearerToken = authHeader ? authHeader.split("Bearer ")[1] : null;
  
  return cookieToken || bearerToken || null;
};

const sendError = (
  res: any,
  status: number,
  message: string,
) => {
  res.status(status).json({ error: message });
};

export const auth =
  (props: Props): RequestHandler =>
  async (req, res, next) => {
    const {
      jtwLib,
      roles = [],
      restrictUserId = false,
      logger,
      enforceUserId = false,
    } = props;

    const token = extractToken(req);
    if (!token) {
      logger?.warn("Request received without authentication token");
      return sendError(res, 401, "No auth token provided");
    }

    try {
      const decoded = jtwLib.verify(token) as JWTPayload;
      const hasAllowedRole = roles.length === 0 || roles.includes(decoded.role);
      const isAdmin = decoded.role === "admin";
      const userIdParam = req.params.userId || req.query.userId;

      if (!hasAllowedRole) {
        logger?.warn(
          `User with role ${decoded.role} attempted to access resource requiring roles: ${roles.join(", ")}`,
          { requiredRoles: roles, userRole: decoded.role }
        );
        return sendError(
          res,
          401,
          "You don't have permission to access this resource"
        );
      }

      // Set decoded information in res.locals
      res.locals.decoded = decoded;
      res.locals.userId = decoded.id;

      if (enforceUserId) {
        return next();
      }

      // Admin-specific checks
      if (isAdmin) {
        if (restrictUserId && userIdParam == null) {
          logger?.warn(
            "Admin attempted to access a restricted resource without providing a user ID",
            { role: decoded.role }
          );
          return sendError(
            res,
            400,
            "You need to provide a user ID"
          );
        }
        res.locals.userId = userIdParam || null;
        return next();
      }

      // Regular user checks
      const requestedUserId = req.params.userId || req.query.userId;
      if (requestedUserId && requestedUserId !== decoded.id) {
        logger?.warn(
          `User ${decoded.id} attempted to access resources of user ${requestedUserId}`,
          { role: decoded.role, userId: decoded.id, requestedUserId }
        );
        return sendError(
          res,
          401,
          "You don't have permission to access this resource"
        );
      }

      return next();
    } catch (err) {
      logger?.error("Token verification failed", {
        error: err instanceof Error ? err.message : "Unknown error",
        stack: err instanceof Error ? err.stack : undefined
      });
      return sendError(res, 401, "Invalid auth token");
    }
  };
