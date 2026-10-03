import type { Request, Response, NextFunction } from "express";
import type { ApiError } from "../types/error.ts";
export const globalErrorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode).json({
    status: statusCode,
    message: message,
    ...(err.details ? { details: err.details } : {}),
  });
};
