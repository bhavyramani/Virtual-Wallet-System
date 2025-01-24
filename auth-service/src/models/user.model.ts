import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  userId: string; 
  email: string;
  password: string;
}

const userSchema: Schema = new Schema({
  userId: { type: String, required: true, unique: true }, 
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
