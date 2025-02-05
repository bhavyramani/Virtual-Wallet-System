import { Request, Response } from "express";
import axios from "axios";
import Profile from "../models/profile.model";
import Redis from "ioredis";
import {client } from "../utils/redisClient"

export const createProfile = async (req: Request, res: Response) => {
  const { UserId, Name, Email, Phone } = req.body;
  try {
    const existingProfile = await Profile.findOne({ Email });
    if (existingProfile) {
      return res.status(400).json({ message: "Email already exists" });
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
      return res
        .status(walletResponse.status)
        .json({ message: "Failed to create wallet" });
    }

    const newProfile = new Profile({ UserId, Name, Email, Phone });
    await newProfile.save();

    await client.set(
      `wallet:${UserId}`,
      JSON.stringify(walletResponse.data.wallet)
    );

    return res.status(201).json({
      message: "Profile created successfully",
      profile: newProfile,
      wallet: walletResponse.data,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
