import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import router from './routes';
import bodyParser from 'body-parser';
import morgan from 'morgan';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const RateLimit = parseInt(process.env.RATE_LIMIT || '100');

// Proxy middleware for /auth
// Middleware
app.use(cors());
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(
  '/auth',
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL, // Forward to Auth Service
    changeOrigin: true,
    pathRewrite: {
      '^/auth': '', // Remove `/auth` from forwarded path
    },
    onProxyReq: (proxyReq, req) => {
      // Debug: Log incoming request at the gateway
      console.log('Incoming Request to Gateway:');
      console.log('Method:', req.method);
      console.log('Path:', req.path);
      console.log('Body:', req.body);

      // Forward the request body
      if (req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err) => {
      console.error('Proxy Error:', err);
    },
  })
);
app.use(express.json()); 
app.use(morgan('combined'));



// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: RateLimit,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Route to handle health check
app.use('/', router);



// Start the Gateway Service
app.listen(PORT, () => {
  console.log(`Gateway Service is running on http://127.0.0.1:${PORT}`);
});
