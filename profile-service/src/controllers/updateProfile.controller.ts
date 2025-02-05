import { Request, Response } from "express";
import Profile from "../models/profile.model";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const updateProfile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { Name, Email, Phone } = req.body;

  try {
    const userId = req.headers["x-user-id"] as string;
    if (userId !== id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this profile" });
    }

    const profile = await Profile.findOne({ UserId: id });
    if (!profile) {
      return res.status(404).json({ message: "User not found" });
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
          return res
            .status(400)
            .json({ message: "Failed to update Email in Auth service" });
        }
      } catch (err) {
        console.error("Error updating Emailin Auth service:", err);
        return res
          .status(500)
          .json({ message: "Error updating Emailin Auth service" });
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
        return res.status(400).json({ message: "Phone number already exists" });
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
      return res.status(400).json({ message: "Balance update is not allowed" });
    }

    return res.status(200).json(updateResponse);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
