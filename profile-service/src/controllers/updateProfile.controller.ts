import { Request, Response } from 'express';
import Profile from '../models/profile.model';
import Wallet from '../models/wallet.model';
import { client, getAsync } from '../utils/redisClient';
import axios from 'axios';

export const updateProfile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, balance } = req.body;

  try {
    // Fetch the profile and wallet associated with the user
    const profile = await Profile.findOne({ userId: id });
    const wallet = await Wallet.findOne({ userId: id });

    if (!profile || !wallet) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email already exists (skip update if it exists)
    if (email && email !== profile.email) {
      try {
        const authResponse = await axios.put(
          `http://127.0.0.1:5001/auth/updateEmail/${id}`,
          { email }
        );

        // If the Auth service confirms the email update, proceed to update the profile
        if (authResponse.status === 200) {
          profile.email = email; // Update email in profile
        } else {
          return res
            .status(400)
            .json({ message: 'Failed to update email in Auth service' });
        }
      } catch (err) {
        console.error('Error updating email in Auth service:', err);
        return res
          .status(500)
          .json({ message: 'Error updating email in Auth service' });
      }
    }

    // Check if phone already exists (skip update if it exists)
    if (phone && phone !== profile.phone) {
      const existingPhone = await Profile.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ message: 'Phone number already exists' });
      }
      profile.phone = phone; // Update phone if it's not already taken
    }

    // Update other profile details (name can be updated without conflict)
    if (name) profile.name = name;

    await profile.save(); // Save the updated profile

    // Update wallet balance if provided
    if (balance !== undefined) {
      wallet.balance = balance;
      await wallet.save(); // Save the updated wallet

      // Clear the old balance cache from Redis
      client.del(`wallet_balance:${id}`);

      // Cache the new balance in Redis
      client.setex(`wallet_balance:${id}`, 3600, wallet.balance.toString()); // Cache for 1 hour
    }

    return res.status(200).json({
      message: 'Profile updated successfully',
      profile,
      walletBalance: wallet.balance,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
