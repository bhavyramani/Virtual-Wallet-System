import { Request, Response } from 'express';
import { validationResult, body } from 'express-validator';
import User from '../models/user.model'; // Assuming you have a User model to store user data

export const updateEmail = [
  // Validation for Emailformat
  body('Email').isEmail().withMessage('Please provide a valid Email'),

  
  async (req: Request, res: Response) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { Email} = req.body;
    const   UserId = req.params.id; 
    
    try {
      // Check if the Emailalready exists in the database
      const existingEmail = await User.findOne({ Email});
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      
      const user = await User.findOne({ UserId });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.Email= Email;
      await user.save();

      return res.status(200).json({ message: 'Email updated successfully' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  },
];
