"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
// Load from .env.local first, then .env
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env.local') });
dotenv_1.default.config(); // Fallback to .env
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
mongoose_1.default.connect(mongoURI, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
})
    .then(async () => {
    console.log("✅ MongoDB Connected!");
    console.log(`📊 Database: ${mongoose_1.default.connection.name}`);
    console.log(`📍 Host: ${mongoose_1.default.connection.host}`);
    // Start the server
    const { default: app } = await Promise.resolve().then(() => __importStar(require("./app")));
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`\n🚀 Server running on port ${PORT}`);
        console.log(`📍 Local: http://localhost:${PORT}`);
        console.log(`🌐 Vercel: https://rimsha-lab-backend.vercel.app`);
        console.log(`🔗 API Status: https://rimsha-lab-backend.vercel.app/api/db-status`);
    });
})
    .catch((error) => {
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
    Promise.resolve().then(() => __importStar(require("./app"))).then(({ default: app }) => {
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT} (no DB)`);
        });
    });
});
