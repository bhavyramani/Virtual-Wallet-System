import { Request, Response } from 'express';
import Profile from '../models/profile.model';
import axios from 'axios';
import { getAsync, client } from '../utils/redisClient';

export const getProfile = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Fetch profile from the database (always fetched from DB)
    const profile = await Profile.findOne({ UserId: id });
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
      // If balance is not cached, send a request to the Wallet Service to fetch balance
      const walletServiceUrl = process.env.WALLET_SERVICE_URL || 'http://localhost:5003';
      try {
        const walletResponse = await axios.post(`${walletServiceUrl}/balance`, 
          {  UserId: id  });
        if (walletResponse.status !== 200) {
          return res.status(walletResponse.status).json({ message: 'Failed to fetch wallet balance' });
        }
        walletBalance = walletResponse.data.balance;

        // Cache wallet balance for 1 hour
        client.setex(`wallet_balance:${id}`, 3600, walletBalance.toString());
      } catch (err) {
        console.error('Error fetching wallet balance from Wallet Service:', err);
        return res.status(500).json({ message: 'Error fetching wallet balance from Wallet Service' });
      }
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
