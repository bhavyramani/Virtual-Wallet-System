import { Request, Response } from "express";
import Profile from "../models/profile.model";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { Name, Email, Phone } = req.body;

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

    const updateResponse: {
      message: string;
      nameUpdated?: boolean;
      EmailUpdated?: boolean;
      phoneUpdated?: boolean;
    } = {
      message: "Profile updated successfully",
    };

    // Email update
    if (Email && Email !== profile.Email) {
      try {
        const authResponse = await axios.put(
          `${process.env.AUTH_SERVICE_URL}/updateEmail/${id}`,
          { Email }
        );

        if (authResponse.status === 200) {
          profile.Email = Email;
          updateResponse.EmailUpdated = true;
        } else {
          res
            .status(400)
            .json({ message: "Failed to update Email in Auth service" });
          return;
        }
      } catch (err) {
        res
          .status(500)
          .json({ message: "Email Already Exists" });
        return;
      }
    }

    // Name update
    if (Name && Name !== profile.Name) {
      profile.Name = Name;
      updateResponse.nameUpdated = true;
    }

    // Phone update
    if (Phone && Phone !== profile.Phone) {
      const existingPhone = await Profile.findOne({ Phone });
      if (existingPhone) {
        res.status(400).json({ message: "Phone number already exists" });
        return;
      }
      profile.Phone = Phone;
      updateResponse.phoneUpdated = true;
    }

    await profile.save();

    if (updateResponse.nameUpdated) {
      updateResponse.message = "Profile updated successfully. Name updated.";
    }
    if (updateResponse.EmailUpdated) {
      updateResponse.message = updateResponse.message.concat(" Email updated.");
    }
    if (updateResponse.phoneUpdated) {
      updateResponse.message = updateResponse.message.concat(" Phone updated.");
    }

    // Ensure that balance is not updated here
    if (req.body.Balance !== undefined) {
      res.status(400).json({ message: "Balance update is not allowed" });
      return;
    }

    res.status(200).json(updateResponse);
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
    return;
  }
};
