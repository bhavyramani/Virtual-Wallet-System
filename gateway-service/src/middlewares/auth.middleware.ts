import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthTokenPayload {
  userId: string;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing' }); // Token is missing
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthTokenPayload;
    
    // Ensure decoded token contains userId
    if (!decoded.userId) {
      return res.status(401).json({ message: 'Token does not contain a valid userId' });
    }

    // Attach userId to the request object
    req.user = { userId: decoded.userId };
    console.log('Token decoded, userId:', req.user.userId); // Log decoded userId for debugging

    next(); // Proceed to the next middleware/route handler
  } catch (err) {
    console.error('Token verification error:', err); // Log error for debugging
    res.status(401).json({ message: 'Invalid or expired token' }); // Return 401 error if token is invalid or expired
  }
};
