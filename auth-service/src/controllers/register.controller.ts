import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios'; // Import axios for making HTTP requests
import User from '../models/user.model';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// Validation middleware for register
export const validateRegister = [
  body('Email').isEmail().withMessage('Please provide a valid Email'),
  body('Password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// Controller for user registration
export const registerUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { Email, Password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ Email});
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate a unique UserId
    const UserId = uuidv4();

    // Hash the Password
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Create new user with UserId
    const newUser = new User({ UserId, Email, Password: hashedPassword });
    await newUser.save();

    // Make a request to the Profile service to create a profile
    try {
      const profileResponse = await axios.post(`${process.env.PROFILE_SERVICE_URL}/create`, {
        UserId,
        Email, // Include Emailin the profile creation request
      });

      if (profileResponse.status !== 201) {
        // If the profile creation fails, delete the user from the Auth service
        await User.deleteOne({ UserId });
        return res.status(500).json({ message: 'Profile creation failed' });
      }
    } catch (profileError) {
      console.error('Error creating profile:', profileError);
      // If the profile creation fails, delete the user from the Auth service
      await User.deleteOne({ UserId });
      return res.status(500).json({ message: 'Profile creation failed' });
    }

    // Create a JWT token
    const token = jwt.sign(
      { UserId: newUser.UserId },
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
    res.status(201).json({ message: 'User created successfully', UserId: newUser.UserId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
