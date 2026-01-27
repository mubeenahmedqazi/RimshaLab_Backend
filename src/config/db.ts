import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  console.warn("⚠️ MONGODB_URI not set");
}

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log("✅ MongoDB connected");
  } catch (err: any) {
    console.error("❌ MongoDB connection error:", err.message);
  }
};

export default connectDB;
