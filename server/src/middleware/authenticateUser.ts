import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
export function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(authHeader);
  console.log("the token", token);
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Token required" });
  }
  try {
    // const verifiedToken = jwt.verify(token, process.env.SECRET_KEY);
    const verifiedToken = { userId: "fff", token: "1243534" };
    if (token === verifiedToken.token && req.userId === verifiedToken.userId)
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
