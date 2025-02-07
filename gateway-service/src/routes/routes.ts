import { Router } from "express";
import dotenv from "dotenv";

const router = Router();
dotenv.config();

router.get("/health", (req, res) => {
  res.status(200).json({ message: "Gateway service is healthy!" });
});


export default router;
