import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

// 1. Create the client using your Upstash URL
const redisClient = createClient({
  url: process.env.REDIS_URL
});

// 2. Handle connection events
redisClient.on("error", (err) => console.error("Redis Client Error:", err));
redisClient.on("connect", () => console.log("Connected to Redis Cache! 🚀"));

// 3. Connect immediately when this file is imported
await redisClient.connect();

// 4. Export the connected client (DO NOT disconnect it)
export default redisClient;