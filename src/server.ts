import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";

// Load from .env.local first, then .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config(); // Fallback to .env

console.log("=== 🚀 SERVER STARTING ===");
console.log("Time:", new Date().toISOString());
console.log("NODE_ENV:", process.env.NODE_ENV || "development");
console.log("PORT:", process.env.PORT || 5000);

// Get MongoDB URI
const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ ERROR: No MongoDB URI found!");
  console.log("Check .env.local or Vercel environment variables");
  process.exit(1);
}

// Log safe URI (hide password)
const safeUri = mongoURI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://$1:****@');
console.log("🔗 MongoDB URI:", safeUri);

// Fix: If password contains @, it needs to be URL encoded
// But MongoDB Atlas might have issues. Let's test connection
console.log("🔄 Testing MongoDB connection...");

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
})
.then(async () => {
  console.log("✅ MongoDB Connected!");
  console.log(`📊 Database: ${mongoose.connection.name}`);
  console.log(`📍 Host: ${mongoose.connection.host}`);
  
  // Start the server
  const { default: app } = await import("./app");
  const PORT = process.env.PORT || 5000;
  
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📍 Local: http://localhost:${PORT}`);
    console.log(`🌐 Vercel: https://rimsha-lab-backend.vercel.app`);
    console.log(`🔗 API Status: https://rimsha-lab-backend.vercel.app/api/db-status`);
  });
})
.catch((error: any) => {
  console.error("❌ MongoDB Connection Failed!");
  console.error("Error:", error.name);
  console.error("Message:", error.message);
  
  if (error.message.includes("bad auth") || error.message.includes("authentication")) {
    console.error("\n🔧 PASSWORD ISSUE DETECTED!");
    console.error("Your password 'lahore123@cluster0' contains @ symbol");
    console.error("Solution 1: URL encode @ as %40 in connection string");
    console.error("Solution 2: Change MongoDB password (recommended)");
    console.error("\nGo to MongoDB Atlas → Database Access → Edit User → Change Password");
    console.error("Use a password WITHOUT @ symbol");
  }
  
  if (error.name === 'MongoServerSelectionError') {
    console.error("\n🔧 NETWORK ACCESS ISSUE:");
    console.error("Go to MongoDB Atlas → Network Access → Add IP Address: 0.0.0.0/0");
  }
  
  // Still start server but in limited mode
  console.log("\nStarting server in limited mode (no database)...");
  
  import("./app").then(({ default: app }) => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (no DB)`);
    });
  });
});