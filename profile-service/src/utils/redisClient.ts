import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const client = new Redis({
  host: process.env.REDIS_CLIENT,
  port: 6379,
});

client.on("connect", () => {
  console.log("Connected to Redis");
});

client.on("error", (err) => {
  console.log("Redis error: " + err);
});

const getAsync = async (key: string) => {
  try {
    const result = await client.get(key);
    return result;
  } catch (error) {
    console.error("Error fetching from Redis:", error);
    throw error;
  }
};

export { client, getAsync };
