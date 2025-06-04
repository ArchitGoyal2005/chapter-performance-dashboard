import mongoose from "mongoose";
import { Redis } from "ioredis";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION!  Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

import app from "./app";

const databaseUrl = process.env.DB_URI;
const databasePassword = process.env.DB_PASS;

if (!databaseUrl || !databasePassword) {
  console.error(
    "Database URL or password is not defined in the environment variables."
  );
  process.exit(1);
}

const DB = databaseUrl.replace("<password>", databasePassword);

mongoose.connect(DB).then(() => {
  console.log("DB connection successful");
});

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
});

redisClient.on("connect", () => {
  console.log("Redis client connected successfully");
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

export { redisClient };

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on("unhandledRejection", (err: Error) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
