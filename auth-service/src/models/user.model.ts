import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  UserId: string; 
  Email: string;
  Password: string;
}

const userSchema: Schema = new Schema({
  UserId: { type: String, required: true, unique: true }, 
  Email: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
