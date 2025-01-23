import { Request, Response } from 'express';
import Profile from '../models/profile.model';
import { body, validationResult } from 'express-validator';

// Validation middleware for profile update
export const validateProfileUpdate = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
];

export const updateProfile = async (req: Request, res: Response) => {
  const { id } = req.params;

  // Validate incoming request data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Find the profile and update it
    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    return res.status(200).json({
      message: 'Profile updated successfully',
      updatedProfile,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
