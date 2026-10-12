import { ZodObject } from "zod";
import type { Request, Response, NextFunction } from "express";

export const validateQuery = (schema: ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid request query", details: parsed.error.issues });
    }
    //to ask
    req.query = parsed.data as unknown as Request["query"];
    next();
  };
};
