import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface AuthTokenPayload {
  UserId: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if(req.url.startsWith("/verify-email")){
      req.user = { UserId: "verify-email" };
      next();
      return;
    }
    const token = req.headers.cookie?.split("=")[1];
    if (!token) {
      res.status(401).json({ message: "Authentication token missing" });
      return;
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as AuthTokenPayload;

    if (!decoded.UserId) {
      res
        .status(401)
        .json({ message: "Token does not contain a valid UserId" });
      return;
    }

    req.user = { UserId: decoded.UserId };

    next();
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
};
