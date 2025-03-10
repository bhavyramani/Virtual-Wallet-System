import { Request, Response } from "express";
import Profile from "../models/profile.model";
import axios from "axios";
import { getAsync, client } from "../utils/redisClient";

export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.headers["x-user-id"] as string;

    const profile = await Profile.findOne({ UserId: userId });
    if (!profile) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const { Name, Phone, Email, UserId } = profile;
    // Allow dynamic properties like Balance by adding an index signature
    const profileData: {
      Name: string;
      Phone: string;
      Email: string;
      UserId: string;
      [key: string]: any;
    } = {
      Name,
      Phone,
      Email,
      UserId,
    };

    const { id } = req.params;
    if (id === userId) {
      const cachedBalance = await getAsync(`wallet_balance:${userId}`);
      let walletBalance = "0";

      if (cachedBalance) {
        walletBalance = cachedBalance;
      } else {
        const walletServiceUrl =
          process.env.WALLET_SERVICE_URL || "http://localhost:5003";

        try {
          const walletResponse = await axios.post(
            `${walletServiceUrl}/balance`,
            {
              UserId: userId,
            }
          );

          if (walletResponse.status !== 200) {
            res
              .status(walletResponse.status)
              .json({ message: "Failed to fetch wallet balance" });
            return;
          }
          walletBalance = walletResponse.data.balance;
          client.setex(
            `wallet_balance:${userId}`,
            3600,
            walletBalance.toString()
          );
        } catch (err) {
          console.error(
            "Error fetching wallet balance from Wallet Service:",
            err
          );
          res.status(500).json({
            message: "Error fetching wallet balance from Wallet Service",
          });
          return;
        }
      }

      // Add balance to the response if it's the current user's profile
      profileData["Balance"] = walletBalance;
      profileData["EmailVerified"] = profile.EmailVerified;
    }

    res.status(200).json(profileData);
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
    return;
  }
};
