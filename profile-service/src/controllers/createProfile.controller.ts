import { Request, Response } from "express";
import axios from "axios";
import Profile from "../models/profile.model";
import Redis from "ioredis";
import { client } from "../utils/redisClient";

export const createProfile = async (req: Request, res: Response): Promise<void> => {
  const { UserId, Name, Email, Phone } = req.body;
  try {
    
    const existingProfile = await Profile.findOne({ Email });
    if (existingProfile) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    // Send a request to the Wallet Service to create a new wallet
    const walletServiceUrl =
      process.env.WALLET_SERVICE_URL || "http://localhost:5003";
    const walletResponse = await axios.post(
      walletServiceUrl + "/create-wallet",
      {
        UserId,
      }
    );

    if (walletResponse.status !== 201) {
      res
        .status(walletResponse.status)
        .json({ message: "Failed to create wallet" });
      return;
    }

    const newProfile = new Profile({ UserId, Name, Email, Phone });
    await newProfile.save();

    await client.set(
      `wallet:${UserId}`,
      JSON.stringify(walletResponse.data.wallet)
    );

    res.status(201).json({
      message: "Profile created successfully",
      profile: newProfile,
      wallet: walletResponse.data,
    });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
    return;
  }
};
