import crypto from "crypto";
import Profile from "../models/profile.model";

export const generateEmailVerificationToken = async (
  UserId: String,
  Verification: String
) => {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  try {
    if (Verification === "email") {
      await Profile.findOneAndUpdate(
        { UserId },
        {
          EmailVerificationToken: token,
          EmailVerificationExpires: expires,
        }
      );
    } else {
      await Profile.findOneAndUpdate(
        { UserId },
        {
          PasswordResetToken: token,
          PasswordResetExpires: expires,
        }
      );
    }
    return token;
  } catch (err) {
    console.error(err);
    return "";
  }
};
