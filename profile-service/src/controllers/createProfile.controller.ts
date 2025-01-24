import { Request, Response } from 'express';
import Profile from '../models/profile.model';
import Wallet from '../models/wallet.model';

export const createProfile = async (req: Request, res: Response) => {
  const { userId, name, email, phone } = req.body;

  try {
    // Check if the email or userId already exists
    const existingProfile = await Profile.findOne({ $or: [{ email }, { userId }] });
    if (existingProfile) {
      return res.status(400).json({ message: 'Email or User ID already exists' });
    }

    // Create new profile
    const newProfile = new Profile({ userId, name, email, phone });
    await newProfile.save();

    // Create a new wallet associated with the new profile
    const newWallet = new Wallet({ userId, balance: 0 }); // Set balance to 0 initially
    await newWallet.save();

    return res.status(201).json({
      message: 'Profile created successfully',
      profile: newProfile,
      wallet: newWallet,  // Return the created wallet as well
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
