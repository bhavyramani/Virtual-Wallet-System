import { Request, Response } from "express";
import Profile from "../models/profile.model";

export const searchProfile = async (req: Request, res: Response) => {
  try {
    const { user } = req.body;
    if (!user) return res.status(500).json({ message: "User Id Not Found" });

    const profile = await Profile.findOne({
      $or: [{ Phone: user }, { Email: user }],
    });
    if (!profile) return res.status(500).json({ message: "User not found" });

    if (profile["UserId"] == req.headers["x-user-id"])
      return res.status(500).json({ message: "Can not transfer to self" });

    return res.status(200).json({
      UserId: profile["UserId"],
      Name: profile["Name"],
      Phone: profile["Phone"],
      Email: profile["Email"],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
