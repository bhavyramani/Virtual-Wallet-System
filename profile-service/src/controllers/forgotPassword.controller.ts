import { Request, Response } from "express";
import Profile from "../models/profile.model";
import { generateEmailVerificationToken } from "../utils/generateToken";
import { sendEmail } from "../utils/emailService";

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { Email } = req.body;

    if (!Email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const profile = await Profile.findOne({ Email });
    if (!profile) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const token = await generateEmailVerificationToken(
      profile.UserId,
      "password"
    );
    if (!token) {
      res.status(500).json({ message: "Error generating reset token" });
      return;
    }

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const emailContent = `
      <p>You requested a password reset.</p>
      <p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>
    `;

    await sendEmail(Email, "Password Reset Request", emailContent);

    res.status(200).json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
