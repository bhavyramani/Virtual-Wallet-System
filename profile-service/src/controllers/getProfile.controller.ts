import { Request, Response } from 'express';
import { Types } from 'mongoose';  // Import Types from mongoose
import Profile from '../models/profile.model';
import Wallet from '../models/wallet.model';
import { getAsync, client } from '../utils/redisClient';

export const getProfile = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log('id', id);  
  try {
    // Fetch profile from the database (always fetched from DB)
    const profile = await Profile.findOne({ userId: id });
    if (!profile) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check Redis for cached wallet balance
    const cachedBalance = await getAsync(`wallet_balance:${id}`);

    let walletBalance = null;

    if (cachedBalance) {
      // If balance is cached, use it
      walletBalance = cachedBalance;
    } else {
      // If balance is not cached, fetch it from the DB and cache it
      const wallet = await Wallet.findOne({ userId: id });
      if (!wallet) {
        return res.status(404).json({ message: 'Wallet not found' });
      }
      walletBalance = wallet.balance;

      // Cache wallet balance for 1 hour
      client.setex(`wallet_balance:${id}`, 3600, walletBalance.toString());
    }

    return res.status(200).json({
      profile,
      walletBalance,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
