"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// config/db.ts
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        console.log("🔍 Attempting to connect to MongoDB...");
        // Check both common environment variable names
        const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
        console.log("Environment check:");
        console.log("- MONGO_URI exists:", !!process.env.MONGO_URI);
        console.log("- MONGODB_URI exists:", !!process.env.MONGODB_URI);
        console.log("- NODE_ENV:", process.env.NODE_ENV);
        if (!mongoURI) {
            throw new Error("❌ MongoDB URI is not defined in environment variables! Check Vercel settings.");
        }
        // Connect with timeout options
        const conn = await mongoose_1.default.connect(mongoURI, {
            serverSelectionTimeoutMS: 30000, // 30 seconds
            socketTimeoutMS: 45000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        return conn;
    }
    catch (error) {
        console.error("❌ MongoDB Connection Failed!");
        console.error("Error:", error.message);
        console.error("Full error:", error);
        // Helpful debugging info
        if (error.message.includes("ENOTFOUND") || error.message.includes("getaddrinfo")) {
            console.error("\n🔧 TROUBLESHOOTING:");
            console.error("1. Check MongoDB Atlas Network Access - add IP 0.0.0.0/0");
            console.error("2. Verify connection string format");
            console.error("3. Check if MongoDB cluster is running");
        }
        process.exit(1);
    }
};
exports.default = connectDB;
