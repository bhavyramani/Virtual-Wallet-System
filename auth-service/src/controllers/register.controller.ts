import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import User from '../models/user.model';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// Validation middleware for register
export const validateRegister = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// Controller for user registration
export const registerUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    // Create a JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET as string, // Make sure you set JWT_SECRET in .env
      { expiresIn: '1h' }
    );

    // Set the JWT token as a cookie
    res.cookie('token', token, {
      httpOnly: true, // Helps to prevent XSS attacks
      secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
      maxAge: 3600000, // Cookie expiry time (1 hour)
    });

    // Send response
    res.status(201).json({ message: 'User created successfully', userId: newUser._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
