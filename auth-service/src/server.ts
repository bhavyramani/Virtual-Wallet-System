import express, { Application } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors"; // Import cors
import userRoutes from "./routes/user.routes";

dotenv.config();

const port = process.env.AUTH_PORT || 5001;
const host = process.env.HOST || "localhost";

const app: Application = express();

app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI || "")
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.log("MongoDB connection error:", error));

app.use(userRoutes);

app.listen(port, () => {
  console.log(`Auth Service is running at http://${host}:${port}`);
});

export default app;
