import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error("MongoDB URI missing");

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
  });

  console.log("✅ MongoDB Connected:", mongoose.connection.name);
};

export default connectDB;
