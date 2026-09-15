import dns from "dns";
import mongoose from "mongoose";
import logger from "@log/logger";
import { env_var } from "./env.config";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalCache = globalThis as typeof globalThis & {
  mongoose?: MongooseCache;
};

if (!globalCache.mongoose) {
  globalCache.mongoose = { conn: null, promise: null };
}

const connectWithRetry = async (
  uri: string,
  maxRetries = 5,
  delay = 1000,
): Promise<typeof mongoose> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      dns.setServers(["1.1.1.1", "8.8.8.8"]);
      logger.info(` Attempt ${attempt} to connect MongoDB...`);
      const conn = await mongoose.connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
      });
      logger.info(" Database is connected successfully");
      return conn;
    } catch (err) {
      logger.error(` MongoDB connection attempt ${attempt} failed`, err);

      if (attempt === maxRetries) {
        logger.error(" All retries failed. Giving up.");
        throw err;
      }

      const wait = delay * Math.pow(2, attempt - 1);
      logger.info(`Retrying in ${wait / 1000}s...`);
      await new Promise((res) => setTimeout(res, wait));
    }
  }

  throw new Error("MongoDB connection failed after retries");
};

export const dbConnection = async (): Promise<typeof mongoose> => {
  if (globalCache.mongoose!.conn) {
    return globalCache.mongoose!.conn;
  }

  if (!globalCache.mongoose!.promise) {
    globalCache.mongoose!.promise = connectWithRetry(
      env_var.DATABASE_KEY as string,
    );
  }

  globalCache.mongoose!.conn = await globalCache.mongoose!.promise;
  return globalCache.mongoose!.conn;
};
