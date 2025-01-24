import { Request, Response } from 'express';
import Profile from '../models/profile.model';
import Wallet from '../models/wallet.model';
import { client } from '../utils/redisClient';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const updateProfile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, balance } = req.body;

  try {
    // Ensure that the userId in the request headers matches the id in the URL parameter
    const userId = req.headers['x-user-id'] as string; // Extract userId from headers
    
    if (userId !== id) {
      return res.status(403).json({ message: 'You are not authorized to update this profile' });
    }

    // Fetch the profile and wallet associated with the user
    const profile = await Profile.findOne({ userId: id });
    const wallet = await Wallet.findOne({ userId: id });

    if (!profile || !wallet) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize a response object to track successful and failed updates
    const updateResponse: { message: string, nameUpdated?: boolean, emailUpdated?: boolean, phoneUpdated?: boolean, balanceUpdated?: boolean } = {
      message: 'Profile updated successfully',
    };

    // Email update
    if (email && email !== profile.email) {
      try {
        const authResponse = await axios.put(
          `${process.env.AUTH_SERVICE_URL}/updateEmail/${id}`,
          { email }
        );

        if (authResponse.status === 200) {
          profile.email = email; // Update email in profile
          updateResponse.emailUpdated = true; // Track email update success
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

    // Name update
    if (name && name !== profile.name) {
      profile.name = name; // Update name in profile
      updateResponse.nameUpdated = true; // Track name update success
    }

    // Phone update
    if (phone && phone !== profile.phone) {
      const existingPhone = await Profile.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ message: 'Phone number already exists' });
      }
      profile.phone = phone; // Update phone if it's not already taken
      updateResponse.phoneUpdated = true; // Track phone update success
    }

    await profile.save(); // Save the updated profile

    

    // Construct the final message based on which updates were successful
    if (updateResponse.nameUpdated) {
      updateResponse.message = 'Profile updated successfully. Name updated.';
    }
    if (updateResponse.emailUpdated) {
      updateResponse.message = updateResponse.message.concat(' Email updated.');
    }
    if (updateResponse.phoneUpdated) {
      updateResponse.message = updateResponse.message.concat(' Phone updated.');
    }

    // Return the response showing which updates were successful
    return res.status(200).json(updateResponse);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
