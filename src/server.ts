// src/server.ts
import dotenv from "dotenv";
import mongoose from "mongoose";

// Load environment variables FIRST
dotenv.config();

console.log("=== 🔍 VERCEL DEPLOYMENT CHECK ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
console.log("PORT:", process.env.PORT);

// Get MongoDB URI (try both common names)
const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ CRITICAL: No MongoDB URI found in environment variables!");
  console.log("Available env vars:", Object.keys(process.env).join(", "));
  process.exit(1);
}

// Hide password in logs for security
const safeUri = mongoURI.replace(/:([^:@]+)@/, ':****@');
console.log("MongoDB URI:", safeUri);

// Connect to MongoDB
mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log("✅ MongoDB Connected Successfully!");
  console.log(`📊 Database: ${mongoose.connection.name}`);
  
  // Start the server AFTER MongoDB connects
  import("./app").then(({ default: app }) => {
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 URL: https://rimsha-lab-backend.vercel.app`);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        mongoose.connection.close();
        console.log('Server closed');
        process.exit(0);
      });
    });
  });
})
.catch((error) => {
  console.error("❌ MongoDB Connection Failed!");
  console.error("Error name:", error.name);
  console.error("Error message:", error.message);
  console.error("Error code:", error.code);
  
  if (error.name === 'MongoServerSelectionError') {
    console.error("\n🔧 TROUBLESHOOTING:");
    console.error("1. Check MongoDB Atlas → Network Access → IP Whitelist");
    console.error("2. Add IP: 0.0.0.0/0 (allow all)");
    console.error("3. Check if MongoDB cluster is active");
    console.error("4. Verify username/password in connection string");
  }
  
  process.exit(1);
});

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});