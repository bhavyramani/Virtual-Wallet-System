import { Request, Response } from 'express';
import Profile from '../models/profile.model';
import Wallet from '../models/wallet.model';
import { getAsync, client } from '../utils/redisClient';

export const getProfile = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Check Redis for cached wallet balance
    const cachedBalance = await getAsync(`wallet_balance:${id}`);

    if (cachedBalance) {
      return res.status(200).json({
        message: 'Profile fetched from cache',
        profile: {
          userId: id,
          walletBalance: cachedBalance,
        },
      });
    }

    // Fetch profile and wallet from the database
    const profile = await Profile.findOne({ userId: id });
    const wallet = await Wallet.findOne({ userId: id });

    if (!profile || !wallet) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cache wallet balance in Redis
    client.setex(`wallet_balance:${id}`, 3600, wallet.balance.toString()); // Cache for 1 hour

    return res.status(200).json({
      profile,
      walletBalance: wallet.balance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
