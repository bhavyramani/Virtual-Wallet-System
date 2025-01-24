import { Request, Response } from 'express';
import { validationResult, body } from 'express-validator';
import User from '../models/user.model'; // Assuming you have a User model to store user data

export const updateEmail = [
  // Validation for email format
  body('email').isEmail().withMessage('Please provide a valid email'),

  
  async (req: Request, res: Response) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    const   userId = req.params.id; 
    
    try {
      // Check if the email already exists in the database
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      
      const user = await User.findOne({ userId });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.email = email;
      await user.save();

      return res.status(200).json({ message: 'Email updated successfully' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  },
];
