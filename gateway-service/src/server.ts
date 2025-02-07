import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createProxyMiddleware } from "http-proxy-middleware";
import router from "./routes/routes";
import bodyParser from "body-parser";
import morgan from "morgan";
import { authMiddleware } from "./middlewares/auth.middleware";
import { Request, Response, NextFunction } from "express";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const RateLimit = parseInt(process.env.RATE_LIMIT || "100");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});
const connectedUsers: Record<string, string> = {};

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen for user registration with their ID
  socket.on("register", (userId) => {
    connectedUsers[userId] = socket.id;
    console.log(`User registered: ${userId} -> ${socket.id}`);
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    for (const userId in connectedUsers) {
      if (connectedUsers[userId] === socket.id) {
        delete connectedUsers[userId];
        console.log(`User disconnected: ${userId}`);
        break;
      }
    }
  });
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  "/auth",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL, // Forward to Auth Service
    changeOrigin: true,
    pathRewrite: {
      "^/auth": "", // Remove `/auth` from forwarded path
    },
  })
);

app.use(
  "/profile",
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    req.headers["x-user-id"] = req.user?.UserId; // Add UserId to headers
    next();
  },
  createProxyMiddleware({
    target: process.env.PROFILE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/profile": "",
    },
  })
);

app.use(
  "/wallet",
  authMiddleware,
  createProxyMiddleware({
    target: process.env.WALLET_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/wallet": "",
    },
  })
);

app.use(express.json());
app.use(morgan("combined"));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: RateLimit,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

app.post(
  "/notify",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { To, Amount, From } = req.body;

    if (!To || !Amount || !From) {
      res.status(400).json({ message: "Invalid notification data" });
      return;
    }
    
    const receiverSocketId = connectedUsers[To];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("fund_transfer", {
        message: `You received ₹${Amount} from ${From}`,
      });
      console.log(
        `Notification sent to User ${To}: ${Amount} credits received.`
      );
    } else {
      console.log(`User ${To} is not connected, cannot send notification.`);
    }

    res.status(200).json({ message: "Notification processed" });
    return;
  }
);

// Start the Gateway Service
server.listen(PORT, () => {
  console.log(`Gateway Service is running on http://localhost:${PORT}`);
});

export { io, connectedUsers };