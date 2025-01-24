import mongoose, { Schema, Document } from 'mongoose';

interface IProfile extends Document {
  userId: string; 
  name: string;
  email: string;
  phone: string;
}

const profileSchema: Schema = new Schema({
  userId: { type: String, required: true },
  name: { type: String },
  email: { type: String, required: true, unique:true },
  phone: { type: String },
});

const Profile = mongoose.model<IProfile>('Profile', profileSchema);

export default Profile;
