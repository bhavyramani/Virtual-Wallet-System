import { Request, Response } from 'express';
import axios from 'axios';
import Profile from '../models/profile.model';
import Redis from 'ioredis'; 

// Initialize Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

export const createProfile = async (req: Request, res: Response) => {
  const { UserId, name, Email, phone } = req.body;
  try {
    // Check if the Emailor UserId already exists
    const existingProfile = await Profile.findOne({ Email});
    if (existingProfile) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Send a request to the Wallet Service to create a new wallet
    const walletServiceUrl = process.env.WALLET_SERVICE_URL || 'http://localhost:5003';
    const walletResponse = await axios.post(walletServiceUrl + '/create-wallet', {
      UserId,
    });

    if (walletResponse.status !== 201) {
      return res.status(walletResponse.status).json({ message: 'Failed to create wallet' });
    }

    // Create a new profile in the database
    const newProfile = new Profile({ UserId, name, Email, phone });
    await newProfile.save();

    // Cache the wallet information in Redis
    await redis.set(`wallet:${UserId}`, JSON.stringify(walletResponse.data.wallet));

    return res.status(201).json({
      message: 'Profile created successfully',
      profile: newProfile,
      wallet: walletResponse.data, // Return the wallet data from the Wallet Service
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
