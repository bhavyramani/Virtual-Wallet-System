import mongoose, { Schema, Document } from 'mongoose';

interface IWallet extends Document {
  userId: string;  
  balance: number;
}

const WalletSchema: Schema = new Schema(
  {
    userId: { type: String, required: true }, 
    balance: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IWallet>('Wallet', WalletSchema);
