import mongoose, { Schema, Document } from "mongoose";

interface IProfile extends Document {
  UserId: string;
  Name: string;
  Email: string;
  Phone: string;
  EmailVerified: boolean;
  EmailVerificationToken?: string;
  EmailVerificationExpires?: Date;
}

const profileSchema: Schema = new Schema({
  UserId: { type: String, required: true },
  Name: { type: String },
  Email: { type: String, required: true, unique: true },
  Phone: { type: String },
  EmailVerified: { type: Boolean, default: false },
  EmailVerificationToken: { type: String, default: null },
  EmailVerificationExpires: { type: Date, default: null },
});

const Profile = mongoose.model<IProfile>("Profile", profileSchema);
export default Profile;
