import { Request, Response } from "express";
import Profile from "../models/profile.model";
import { generatePhoneOtp } from "../utils/generateOTP";
import { sendSms } from "../utils/smsService";

export const sendOTP = async (req: Request, res: Response): Promise<void> => {
  const { UserId, Phone } = req.body;

  if (!UserId) {
    res.status(400).json({ message: "UserId is required" });
    return;
  }

  try {
    const userProfile = await Profile.findOne({ UserId });
    if (!userProfile) {
      res
        .status(404)
        .json({ message: "User not found or phone number is missing" });
      return;
    }

    const phone = Phone || (userProfile && userProfile.Phone);
    const otp = await generatePhoneOtp(UserId);

    if (!otp) {
      res.status(500).json({ message: "Failed to generate OTP" });
      return;
    }

    await sendSms(phone, `Your OTP is: ${otp}`);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};
