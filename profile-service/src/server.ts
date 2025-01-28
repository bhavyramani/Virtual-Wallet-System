import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import profileRoutes from "./routes/user.routes";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/profile-service")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

// Profile routes
app.use("/", profileRoutes);

const port = process.env.PORT || 5002;
app.listen(port, () => {
  console.log(`Profile Service is running on http://localhost:${port}`);
});
