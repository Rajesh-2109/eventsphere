import mongoose from "mongoose";
import dns from "node:dns";

// Google DNS only for local dev (helps with MongoDB SRV lookup on some networks)
if (!process.env.VERCEL) {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
}

// Cache the connection so serverless invocations reuse it
let cached = globalThis.__mongoose;
if (!cached) cached = globalThis.__mongoose = { conn: null, promise: null };

export default async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing");
  }
  if (cached.conn && mongoose.connection.readyState === 1) return cached.conn;

  mongoose.set("strictQuery", true);

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 15000,
        maxPoolSize: 5,
      })
      .then((m) => {
        console.log(`MongoDB connected: ${m.connection.name}`);
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
