import { Request, Response } from "express";
import Profile from "../models/profile.model";

export const searchProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user } = req.body;
    if (!user) {
      res.status(500).json({ message: "User Id Not Found" });
      return;
    }

    const profile = await Profile.findOne({
      $or: [{ Phone: user }, { Email: user }],
    });
    if (!profile) {
      res.status(500).json({ message: "User not found" });
      return;
    }

    if (profile["UserId"] == req.headers["x-user-id"]) {
      res.status(500).json({ message: "Can not transfer to self" });
      return;
    }

    res.status(200).json({
      UserId: profile["UserId"],
      Name: profile["Name"],
      Phone: profile["Phone"],
      Email: profile["Email"],
    });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
    return;
  }
};
