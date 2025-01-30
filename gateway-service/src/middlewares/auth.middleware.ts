import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface AuthTokenPayload {
  UserId: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.cookie?.split("=")[1];
    if (!token) {
      return res.status(401).json({ message: "Authentication token missing" });
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AuthTokenPayload;

    if (!decoded.UserId) {
      return res
      .status(401)
      .json({ message: "Token does not contain a valid UserId" });
    }
    
    req.user = { UserId: decoded.UserId };
    
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
