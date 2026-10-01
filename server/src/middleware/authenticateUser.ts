import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
export function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Token required" });
  }
  try {
    const verifiedToken = jwt.verify(token, process.env.SECRET_KEY);
    req.userId = verifiedToken.userId;
    return next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(401).json({
        message: "Unauthorized: Invalid or expired token",
      });
    }
  }
}
