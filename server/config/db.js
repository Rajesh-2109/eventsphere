import mongoose from "mongoose";
import dns from "node:dns";

// Use Google DNS for MongoDB SRV lookup
dns.setServers(["8.8.8.8", "8.8.4.4"]);

export default async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
  });

  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}
