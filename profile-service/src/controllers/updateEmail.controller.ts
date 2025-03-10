import { Request, Response } from "express";
import Profile from "../models/profile.model";
import { generateEmailVerificationToken } from "../utils/generateToken";
import { sendEmail } from "../utils/emailService";

export const updateEmail = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const Email = req.body.email;
  
  try {
    // Basic validations
    const UserId = req.headers["x-user-id"] as string;
    if (UserId !== id) {
      res.status(403).json({ message: "You are not authorized to update this profile" });
      return;
    }

    const profile = await Profile.findOne({ UserId: id });
    if (!profile) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!Email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    // If the requested email is the same and already verified, return no change.
    if (profile.Email === Email && profile.EmailVerified) {
      res.status(400).json({ message: "No Change in Email ID" });
      return;
    }

    // If the new email is different, check if it's already used by another user.
    if (profile.Email !== Email) {
      const otherProfile = await Profile.findOne({ Email, UserId: { $ne: id } });
      if (otherProfile) {
        res.status(400).json({ message: "Email already in use by another user." });
        return;
      }
    }

    // Generate verification token and send the verification email
    const token = await generateEmailVerificationToken(id);
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}&newEmail=${Email}`;
    const emailContent = `
      <p>You requested to change your email to <strong>${Email}</strong>.</p>
      <p>Click <a href="${verificationLink}">here</a> to verify your new email. This link will expire in 1 hour.</p>
    `;

    await sendEmail(Email, "Verify Your New Email", emailContent);

    res.status(200).json({
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
