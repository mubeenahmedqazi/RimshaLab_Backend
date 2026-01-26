import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import app from "./app";

// Load environment variables from multiple possible locations
const envPaths = [
  path.join(process.cwd(), '.env.local'),  // Next.js style
  path.join(process.cwd(), '.env'),        // Standard
];

console.log("🔍 Loading environment variables...");
for (const envPath of envPaths) {
  try {
    dotenv.config({ path: envPath });
    console.log(`✅ Attempted load from: ${envPath}`);
  } catch (err) {
    console.log(`❌ Failed to load from: ${envPath}`);
  }
}

// Final load as fallback
dotenv.config();

console.log("\n=== 🚀 SERVER STARTING ===");
console.log("Time:", new Date().toISOString());
console.log("NODE_ENV:", process.env.NODE_ENV || "development");
console.log("PORT:", process.env.PORT || 5000);
console.log("Current directory:", process.cwd());

// Get MongoDB URI
const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoURI) {
  console.error("\n❌ ERROR: No MongoDB URI found!");
  console.error("Available environment variables:");
  Object.keys(process.env).forEach(key => {
    if (key.includes("MONGO") || key.includes("ENV") || key.includes("PORT")) {
      console.log(`  ${key}: ${process.env[key] ? "✓ Set" : "✗ Not set"}`);
    }
  });
  console.error("\n💡 Check if .env or .env.local file exists in project root");
  console.error("💡 Or set MONGODB_URI in Vercel environment variables");
  process.exit(1);
}

// Log safe URI (hide password)
const safeUri = mongoURI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://$1:****@');
console.log("🔗 MongoDB URI:", safeUri);

// Connect to MongoDB
async function startServer() {
  try {
    console.log("\n🔄 Connecting to MongoDB...");
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority',
    });
    
    console.log("✅ MongoDB Connected!");
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`📍 Host: ${mongoose.connection.host}`);
    console.log(`📈 Ready State: ${mongoose.connection.readyState} (1=Connected)`);
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📍 Local: http://localhost:${PORT}`);
      console.log(`🌐 Vercel: https://rimsha-lab-backend.vercel.app`);
      console.log(`📋 Endpoints:`);
      console.log(`   • http://localhost:${PORT}/`);
      console.log(`   • http://localhost:${PORT}/health`);
      console.log(`   • http://localhost:${PORT}/db-status`);
      console.log(`   • http://localhost:${PORT}/api/health-card/by-cnic/3520189089089`);
    });
    
  } catch (error: any) {
    console.error("\n❌ MongoDB Connection Failed!");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    
    if (error.message.includes("bad auth") || error.message.includes("authentication")) {
      console.error("\n🔧 PASSWORD ISSUE DETECTED!");
      console.error("If password contains @, encode it as %40");
      console.error("Or change password in MongoDB Atlas");
    }
    
    if (error.name === 'MongoServerSelectionError') {
      console.error("\n🔧 NETWORK ACCESS ISSUE:");
      console.error("Go to MongoDB Atlas → Network Access → Add IP Address: 0.0.0.0/0");
    }
    
    // Still start server (important for Vercel)
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`\n⚠️ Server running WITHOUT DATABASE on port ${PORT}`);
      console.log("❗ API routes will fail but server will respond");
    });
  }
}

// Handle server shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('\n👋 MongoDB connection closed');
  process.exit(0);
});

startServer();