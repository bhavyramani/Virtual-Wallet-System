import { Request, Response } from 'express';
import User from '@src/models/user.model';

export const updateEmail = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    // Find the user in the profile service
    const profile = await User.findOne({ email });

    if (!profile) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the email already exists (and is not the same user)
    const existingProfile = await User.findOne({ email });
    if (existingProfile && existingProfile.userId !== id) {
      return res.status(400).json({ message: 'Email is already in use by another account' });
    }

    // Update the email in the Auth service's database
    profile.email = email;
    await profile.save();

    return res.status(200).json({
      message: 'Email updated successfully',
      profile,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
