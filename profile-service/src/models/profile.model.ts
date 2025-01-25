import mongoose, { Schema, Document } from 'mongoose';

interface IProfile extends Document {
  UserId: string; 
  name: string;
  Email: string;
  phone: string;
}

const profileSchema: Schema = new Schema({
  UserId: { type: String, required: true },
  name: { type: String },
  Email: { type: String, required: true, unique:true },
  phone: { type: String },
});

const Profile = mongoose.model<IProfile>('Profile', profileSchema);

export default Profile;
