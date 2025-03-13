import { Request, Response } from "express";
import Profile from "../models/profile.model";

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const { UserId, OTP, type, Phone } = req.body;

  try {
    const profile = await Profile.findOne({ UserId });

    if (!profile) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    if (
      !profile.PhoneOtp ||
      profile.PhoneOtp !== OTP ||
      !profile.PhoneOtpExpires ||
      new Date() > profile.PhoneOtpExpires
    ) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    if (type === "change") {
      if (!Phone) {
        res.status(400).json({ message: "New phone number is required" });
        return;
      }

      const existingPhone = await Profile.findOne({ Phone });
      if (existingPhone) {
        res.status(400).json({ message: "Phone number already exists" });
        return;
      }

      profile.Phone = Phone;
      profile.PhoneVerified = true;
      await profile.save();
      res.status(200).json({ message: "Phone number updated successfully" });
      return;
    }
    profile.PhoneOtp = "null";
    profile.PhoneOtpExpires = new Date();
    await profile.save();
    res.status(200).json({});
    return;
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
