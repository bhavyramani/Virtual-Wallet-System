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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const RateLimit = parseInt(process.env.RATE_LIMIT || "100");

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

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

app.use("/", router);

// Start the Gateway Service
app.listen(PORT, () => {
  console.log(`Gateway Service is running on http://127.0.0.1:${PORT}`);
});
