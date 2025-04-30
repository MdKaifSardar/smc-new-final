import mongoose, { Mongoose } from "mongoose";
import dns from "node:dns";

// Certain ISP DNS servers (e.g., Reliance / Jio) fail to resolve mongodb+srv SRV records.
// Setting public DNS resolvers ensures reliable SRV lookup across development environments.
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Graceful fallback for non-Node or restricted runtimes
}

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

let cached: MongooseConnection = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  };
}
export const connectToDatabase = async () => {
  if (cached.conn) return cached.conn;
  if (!MONGODB_URL) throw new Error("Missing MONGODB_URL");

  cached.promise =
    cached.promise ||
    mongoose.connect(MONGODB_URL, {
      dbName: "smc",
      bufferCommands: false,
    });
  cached.conn = await cached.promise;
  return cached.conn;
};