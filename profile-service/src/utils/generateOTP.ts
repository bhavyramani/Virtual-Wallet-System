import crypto from "crypto";
import Profile from "../models/profile.model";

export const generatePhoneOtp = async (UserId: string) => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  try {
    await Profile.findOneAndUpdate(
      { UserId },
      {
        PhoneOtp: otp,
        PhoneOtpExpires: expires,
      }
    );
    return otp;
  } catch (err) {
    console.error(err);
    return "";
  }
};
