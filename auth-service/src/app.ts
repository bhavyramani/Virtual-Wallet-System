import express, { Application } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';

dotenv.config();

const app: Application = express();

// Middleware to parse incoming JSON
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || '')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.log('MongoDB connection error:', error));

// Routes
app.use(userRoutes);

export default app;
