import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    if (conn.connection.db) {
      const collections = await conn.connection.db.listCollections().toArray();
      console.log("Available collections:", collections.map((c) => c.name));
    } else {
      console.warn("Warning: Unable to list collections, 'conn.connection.db' is undefined.");
    }

  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
