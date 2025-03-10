import { Request, Response } from "express";
import Profile from "../models/profile.model";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token, newEmail } = req.body;
    if (!token) {
      res.status(400).json({ message: "Verification token is required." });
      return;
    }

    // Find the profile by the verification token
    const profile = await Profile.findOne({ EmailVerificationToken: token });

    if (!profile) {
      res.status(400).json({ message: "Invalid or expired token." });
      return;
    }

    // Check if the token is expired
    if (
      !profile.EmailVerificationExpires ||
      profile.EmailVerificationExpires < new Date()
    ) {
      res.status(400).json({ message: "Verification token has expired." });
      return;
    }

    const authResponse = await axios.put(
      `${process.env.AUTH_SERVICE_URL}/updateEmail/${profile.UserId}`,
      { Email: newEmail }
    );

    if (authResponse.status !== 200) {
      res
        .status(400)
        .json({ message: "Failed to update Email in Auth service." });
      return;
    }
    profile.Email = newEmail;
    profile.EmailVerified = true;
    profile.EmailVerificationToken = "";
    profile.EmailVerificationExpires = new Date();
    await profile.save();

    res
      .status(200)
      .json({ message: "Email verified and updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during verification." });
  }
};
