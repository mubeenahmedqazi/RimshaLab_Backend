"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
// Load environment variables
dotenv_1.default.config();
console.log("=== 🚀 SERVER STARTING ===");
console.log("Time:", new Date().toISOString());
console.log("NODE_ENV:", process.env.NODE_ENV || "development");
console.log("PORT:", process.env.PORT || 5000);
// Get MongoDB URI (check both names) - FIXED TYPE ISSUE
const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!mongoURI) {
    console.error("❌ ERROR: No MongoDB URI found!");
    console.error("Check Vercel environment variables: MONGODB_URI or MONGO_URI");
    process.exit(1);
}
// Type assertion: mongoURI is now guaranteed to be string
const connectionString = mongoURI;
// Log safe URI
const safeUri = connectionString.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://$1:****@');
console.log("🔗 MongoDB URI:", safeUri);
// Connect to MongoDB
async function startServer() {
    try {
        console.log("🔄 Connecting to MongoDB...");
        await mongoose_1.default.connect(connectionString, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
        });
        console.log("✅ MongoDB Connected!");
        console.log(`📊 Database: ${mongoose_1.default.connection.name}`);
        console.log(`📍 Host: ${mongoose_1.default.connection.host}`);
        const PORT = process.env.PORT || 5000;
        app_1.default.listen(PORT, () => {
            console.log(`\n🚀 Server running on port ${PORT}`);
            console.log(`📍 Local: http://localhost:${PORT}`);
            console.log(`🌐 Vercel: https://rimsha-lab-backend.vercel.app`);
            console.log(`✅ API Status: https://rimsha-lab-backend.vercel.app/`);
        });
    }
    catch (error) {
        console.error("❌ MongoDB Connection Failed!");
        console.error("Error:", error.message);
        // Still start server for Vercel (serverless might need this)
        const PORT = process.env.PORT || 5000;
        app_1.default.listen(PORT, () => {
            console.log(`⚠️ Server running without DB on port ${PORT}`);
        });
    }
}
startServer();
