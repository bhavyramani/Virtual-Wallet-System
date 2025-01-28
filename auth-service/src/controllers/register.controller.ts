import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import User from "../models/user.model";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

// Validation middleware for register
export const validateRegister = [
  body("Email").isEmail().withMessage("Please provide a valid Email"),
  body("Password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

// Controller for user registration
export const registerUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { Email, Password } = req.body;

  try {
    const existingUser = await User.findOne({ Email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const UserId = uuidv4();
    const hashedPassword = await bcrypt.hash(Password, 10);

    const newUser = new User({ UserId, Email, Password: hashedPassword });
    await newUser.save();

    try {
      const profileResponse = await axios.post(
        `${process.env.PROFILE_SERVICE_URL}/create`,
        {
          UserId,
          Email,
        }
      );

      // If the profile creation fails, delete the user from the Auth service
      if (profileResponse.status !== 201) {
        await User.deleteOne({ UserId });
        return res.status(500).json({ message: "Profile creation failed" });
      }
    } catch (profileError) {
      // If the profile creation fails, delete the user from the Auth service
      console.error("Error creating profile:", profileError);
      await User.deleteOne({ UserId });
      return res.status(500).json({ message: "Profile creation failed" });
    }

    const token = jwt.sign(
      { UserId: newUser.UserId },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
    });

    res
      .status(201)
      .json({ message: "User created successfully", UserId: newUser.UserId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
