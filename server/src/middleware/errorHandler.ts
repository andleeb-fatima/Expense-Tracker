import type { Request, Response, NextFunction } from "express";
import type { ApiError } from "../types/error.ts";
export const globalErrorHandler = (
  err: ApiError & { name?: string; path?: string; kind?: string },
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "CastError" || err.kind === "ObjectId") {
    statusCode = 400;
    message = `Invalid ${err.path || "ID"} format`;
  }
  if (err.statusCode === 11000) {
    statusCode = 409;
    err.message = "This item already exists.";
  }

  return res.status(statusCode).json({
    status: statusCode,
    message: message,
    ...(err.details ? { details: err.details } : {}),
  });
};
