import mongoose, { Schema, Document } from "mongoose";

interface IProfile extends Document {
  UserId: string;
  Name: string;
  Email: string;
  Phone: string;
  EmailVerified: boolean;
  PhoneVerified: boolean;
  EmailVerificationToken?: string;
  EmailVerificationExpires?: Date;
  PasswordResetToken?: string;
  PasswordResetExpires?: Date;
  PhoneOtp?: string;
  PhoneOtpExpires?: Date;
  ProfileImageUrl?: string;
}

const profileSchema: Schema = new Schema({
  UserId: { type: String, required: true },
  Name: { type: String },
  Email: { type: String, required: true, unique: true },
  Phone: { type: String },
  EmailVerified: { type: Boolean, default: false },
  PhoneVerified: { type: Boolean, default: false },
  EmailVerificationToken: { type: String, default: null },
  EmailVerificationExpires: { type: Date, default: null },
  PasswordResetToken: { type: String, default: null },
  PasswordResetExpires: { type: Date, default: null },
  PhoneOtp: { type: String, default: null },
  PhoneOtpExpires: { type: Date, default: null },
  ProfileImageUrl: { type: String, default: null },
});

const Profile = mongoose.model<IProfile>("Profile", profileSchema);
export default Profile;
