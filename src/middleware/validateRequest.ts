import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod'; // no change needed, just for completeness

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((error: any) => ({
        field: error.path.join('.'),
        message: error.message,
      }));
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    req.body = result.data;
    next();
  };
};
