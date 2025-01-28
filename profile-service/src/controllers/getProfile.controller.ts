import { Request, Response } from "express";
import Profile from "../models/profile.model";
import axios from "axios";
import { getAsync, client } from "../utils/redisClient";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;

    const profile = await Profile.findOne({ UserId: userId });
    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }

    const cachedBalance = await getAsync(`wallet_balance:${userId}`);
    let walletBalance = null;

    if (cachedBalance) {
      walletBalance = cachedBalance;
    } else {
      const walletServiceUrl =
        process.env.WALLET_SERVICE_URL || "http://localhost:5003";
      try {
        const walletResponse = await axios.post(`${walletServiceUrl}/balance`, {
          UserId: userId,
        });
        if (walletResponse.status !== 200) {
          return res
            .status(walletResponse.status)
            .json({ message: "Failed to fetch wallet balance" });
        }
        walletBalance = walletResponse.data.balance;

        client.setex(`wallet_balance:${userId}`, 3600, walletBalance.toString());
      } catch (err) {
        console.error(
          "Error fetching wallet balance from Wallet Service:",
          err
        );
        return res.status(500).json({
          message: "Error fetching wallet balance from Wallet Service",
        });
      }
    }

    return res.status(200).json({
      profile,
      walletBalance,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
