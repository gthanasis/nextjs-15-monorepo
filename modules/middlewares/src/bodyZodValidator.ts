// zodBodyValidator.ts

import { RequestHandler } from "microservice";
import { z, ZodSchema, ZodError } from "zod";
import { BadRequestError } from "library";

/**
 * A middleware that validates req.body with a given Zod schema
 * and throws a BadRequestError if validation fails.
 *
 * @param schema - A Zod schema to validate req.body
 */
export const zodBodyValidator =
  (schema: ZodSchema): RequestHandler =>
  async (req, res, next) => {
    try {
      // Validate the incoming request body
      schema.parse(req.body);

      // If it doesn't throw, we're valid
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new BadRequestError({
            message: `Bad Request`,
            errors: (error as ZodError).errors,
          }),
        );
      } else {
        // For non-Zod errors, just pass it along
        next(error);
      }
    }
  };
