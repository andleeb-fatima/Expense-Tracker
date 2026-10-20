import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
export function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log("the token", token);
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Token required" });
  }

  try {
    const verifiedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.userId = verifiedToken.userId;
    if (!req.userId) {
      return next({
        statusCode: 401,
        message: "UserId Required",
      });
    }
    return next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(401).json({
        message: "Unauthorized: Invalid or expired token",
      });
    }
  }
}
