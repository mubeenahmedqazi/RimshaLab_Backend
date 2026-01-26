import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("🔍 Checking MongoDB connection...");
    
    // Try both common environment variable names
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
    console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
    
    if (!mongoURI) {
      throw new Error("MongoDB URI is missing in environment variables!");
    }

    console.log("🔗 Connecting to MongoDB...");
    
    // Simplified for Mongoose v6+
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Event listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    // Return the connection
    return conn;
    
  } catch (error: any) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error("Error details:", error);
    process.exit(1);
  }
};

export default connectDB;