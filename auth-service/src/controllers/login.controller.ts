import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { Request, Response } from "express";

// Validation middleware for login
export const validateLogin = [
  body("Email").isEmail().withMessage("Please provide a valid Email"),
  body("Password").notEmpty().withMessage("Password is required"),
];

// Controller for user login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { Email, Password } = req.body;
  try {
    const user = await User.findOne({ Email });
    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { UserId: user.UserId },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );

    // Set the JWT token as a cookie
    res.cookie("token", token, {
      httpOnly: true, // Helps to prevent XSS attacks
      secure: process.env.NODE_ENV === "production",
      sameSite: false,
      maxAge: 3600000,
    });
    res.status(200).json({ message: "Login successful", UserId: user.UserId });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
    return;
  }
};
