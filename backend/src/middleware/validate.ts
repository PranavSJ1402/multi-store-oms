import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Validates request body or query params against a Zod schema.
 * @param schema - Zod schema to validate against
 * @param target - Which part of the request to validate ('body' | 'query')
 */
export const validate = (schema: AnyZodObject, target: 'body' | 'query' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req[target]);
      // Replace request data with the parsed/coerced version
      if (target === 'body') req.body = parsed;
      if (target === 'query') req.query = parsed as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        res.status(400).json({
          error: 'Validation failed',
          details: fieldErrors,
        });
        return;
      }
      next(error);
    }
  };
};
