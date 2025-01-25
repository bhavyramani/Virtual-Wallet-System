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
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

    if (!token) {
      return res.status(401).json({ message: "Authentication token missing" }); // Token is missing
    }

    // Verify and decode the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AuthTokenPayload;

    // Ensure decoded token contains UserId
    if (!decoded.UserId) {
      return res
        .status(401)
        .json({ message: "Token does not contain a valid UserId" });
    }

    // Attach UserId to the request object
    req.user = { UserId: decoded.UserId };

    next(); // Proceed to the next middleware/route handler
  } catch (err) {
    console.error("Token verification error:", err); // Log error for debugging
    res.status(401).json({ message: "Invalid or expired token" }); // Return 401 error if token is invalid or expired
  }
};
