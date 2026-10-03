import { ZodObject } from "zod";
import type { Request, Response, NextFunction } from "express";

export const validateBody = (schema: ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid request body", details: parsed.error.issues });
    }
    req.body = parsed.data;
    next();
  };
};
