import { Request, Response } from "express";
import Profile from "../models/profile.model";

export const updateName = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { Name } = req.body;

  try {
    const userId = req.headers["x-user-id"] as string;
    if (userId !== id) {
      res
        .status(403)
        .json({ message: "You are not authorized to update this profile" });
      return;
    }

    const profile = await Profile.findOne({ UserId: id });
    if (!profile) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (Name && Name !== profile.Name) {
      profile.Name = Name;
      await profile.save();
      res.status(200).json({ message: "Name updated successfully" });
    } else {
      res.status(400).json({ message: "No changes made to the name" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
