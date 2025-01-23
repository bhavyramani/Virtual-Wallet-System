import mongoose, { Schema, Document } from 'mongoose';

interface IWallet extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  balance: number;
}

const WalletSchema: Schema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    balance: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IWallet>('Wallet', WalletSchema);
