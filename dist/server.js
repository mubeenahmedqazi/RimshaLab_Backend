"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
// Load environment variables FIRST
dotenv_1.default.config();
console.log("=== 🚀 SERVER STARTING ===");
console.log("Time:", new Date().toISOString());
console.log("Environment:", process.env.NODE_ENV || "development");
console.log("PORT:", process.env.PORT || 5000);
// Check MongoDB URI
const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
if (mongoURI) {
    // Hide password in logs
    const safeUri = mongoURI.replace(/:([^:@]+)@/, ':****@');
    console.log("MongoDB URI found:", safeUri.substring(0, 50) + "...");
}
else {
    console.error("❌ WARNING: MongoDB URI not found in environment variables!");
    console.log("Available env vars:", Object.keys(process.env).filter(key => key.includes('MONGO') || key.includes('NODE') || key.includes('VERCEL')));
}
// Connect to MongoDB BEFORE importing app
const connectDB = async () => {
    if (!mongoURI) {
        console.log("⚠️ Skipping MongoDB connection - no URI provided");
        return;
    }
    try {
        console.log("🔄 Connecting to MongoDB...");
        await mongoose_1.default.connect(mongoURI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        console.log("✅ MongoDB Connected Successfully!");
        console.log(`📊 Database: ${mongoose_1.default.connection.name}`);
        console.log(`📍 Host: ${mongoose_1.default.connection.host}`);
    }
    catch (error) {
        console.error("❌ MongoDB Connection Failed!");
        console.error("Error:", error.message);
        // Don't crash - allow server to run in limited mode
        console.log("⚠️ Server will run without database connection");
    }
};
// Import app AFTER environment is loaded
const app_1 = __importDefault(require("./app"));
const startServer = async () => {
    // Connect to database
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app_1.default.listen(PORT, () => {
        console.log(`\n✅ Server successfully started!`);
        console.log(`📍 Local: http://localhost:${PORT}`);
        console.log(`🌐 Vercel: https://rimsha-lab-backend.vercel.app`);
        console.log(`📡 API Base: https://rimsha-lab-backend.vercel.app/api`);
        console.log(`🔗 Frontend: https://rimsha-lab-frontend.vercel.app`);
        console.log(`\n=== 🎯 READY TO SERVE ===\n`);
    });
};
startServer();
// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    mongoose_1.default.connection.close();
    process.exit(0);
});
