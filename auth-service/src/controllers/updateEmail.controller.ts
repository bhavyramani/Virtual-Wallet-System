import { Request, Response } from "express";
import { validationResult, body } from "express-validator";
import User from "../models/user.model";

export const updateEmail = [
  body("Email").isEmail().withMessage("Please provide a valid Email"),

  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { Email } = req.body;
    const UserId = req.params.id;
    
    try {
      const existingEmail = await User.findOne({ Email });
      if (existingEmail && existingEmail.UserId !== UserId) {
        res.status(400).json({ message: "Email already exists" });
        return;
      }

      const user = await User.findOne({ UserId });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      user.Email = Email;
      await user.save();

      res.status(200).json({ message: "Email updated successfully" });
      return;
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
      return;
    }
  },
];
