import { Request, Response } from "express";
import Profile from "../models/profile.model";

export const validateResetToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token = req.query.token as string;

    if (!token) {
      res.status(400).json({ message: "Token is required." });
      return;
    }

    // Find a profile where the token matches and the token has not expired
    const profile = await Profile.findOne({
      PasswordResetToken: token,
      PasswordResetExpires: { $gt: new Date() },
    });

    if (!profile) {
      res.status(400).json({ message: "Invalid or expired token." });
      return;
    }

    res.status(200).json({ UserId: profile.UserId });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};
