import { Request, Response } from "express";
import Profile from "../models/profile.model";

export const searchProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { user } = req.body;
    const userId = req.headers["x-user-id"];

    if (!user) {
      res.status(400).json({ message: "Search query is required." });
      return;
    }

    const profiles = await Profile.find({
      $or: [
        { Phone: { $regex: user, $options: "i" } },
        { Email: { $regex: user, $options: "i" } },
        { Name: { $regex: user, $options: "i" } },
      ],
      UserId: { $ne: userId }, // exclude self
    }).select("UserId Name Email Phone");

    if (profiles.length === 0) {
      res.status(404).json({ message: "No users found" });
      return;
    }

    res.status(200).json(profiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
