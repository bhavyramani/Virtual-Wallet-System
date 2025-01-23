import mongoose, { Schema, Document } from 'mongoose';

interface IProfile extends Document {
  userId: string;  // Change this to string
  name: string;
  email: string;
  phone: string;
}

const profileSchema: Schema = new Schema({
  userId: { type: String, required: true },  // Change ObjectId to String
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
});

const Profile = mongoose.model<IProfile>('Profile', profileSchema);

export default Profile;
