import mongoose, { Schema, Document } from "mongoose";

interface IProfile extends Document {
  UserId: string;
  Name: string;
  Email: string;
  Phone: string;
}

const profileSchema: Schema = new Schema({
  UserId: { type: String, required: true },
  Name: { type: String },
  Email: { type: String, required: true, unique: true },
  Phone: { type: String },
});

const Profile = mongoose.model<IProfile>("Profile", profileSchema);

export default Profile;
