import { Request, Response } from "express";
import axios from "axios";
import bcrypt from "bcryptjs";
import User from "../models/user.model";
import dotenv from "dotenv";

dotenv.config();

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400).json({ message: "Token and new password are required." });
      return;
    }

    const validateResponse = await axios.get(
      `${process.env.PROFILE_SERVICE_URL}/validate-reset-token?token=${token}`
    );

    const { UserId } = validateResponse.data;
    if (!UserId) {
      res.status(400).json({ message: "Invalid or expired token." });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.findOneAndUpdate(
      { UserId },
      { Password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};
