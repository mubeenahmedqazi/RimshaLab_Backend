"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts - THIS IS YOUR MAIN FILE
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
// Load environment variables
if (process.env.NODE_ENV !== "production") {
    dotenv_1.default.config();
}
// Import connectDB
const db_1 = __importDefault(require("./config/db"));
// Import routes
const healthCardRoutes_1 = __importDefault(require("./routes/healthCardRoutes"));
const contactRoutes_1 = __importDefault(require("./routes/contactRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
// ✅ CONNECT TO MONGODB FIRST
(0, db_1.default)();
const app = (0, express_1.default)();
// ✅ Update CORS with your actual frontend URL
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "https://rimsha-lab-frontend.vercel.app" // <-- CHANGE THIS!
    ],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Ensure uploads folder exists
const uploadPath = path_1.default.join(process.cwd(), "uploads");
if (!fs_1.default.existsSync(uploadPath))
    fs_1.default.mkdirSync(uploadPath, { recursive: true });
app.use("/uploads", express_1.default.static(uploadPath));
// ✅ Health check with DB status
app.get("/", (req, res) => {
    const dbStatus = mongoose_1.default.connection.readyState === 1 ? "connected" : "disconnected";
    res.json({
        success: true,
        message: `Backend is live! MongoDB: ${dbStatus}`,
        endpoints: [
            "/api/health-card",
            "/api/contact",
            "/api/bookings",
            "/api/db-status" // New endpoint
        ]
    });
});
// ✅ Add DB status endpoint
app.get("/api/db-status", (req, res) => {
    const isConnected = mongoose_1.default.connection.readyState === 1;
    res.json({
        success: isConnected,
        message: isConnected ? "✅ MongoDB Connected" : "❌ MongoDB Not Connected",
        readyState: mongoose_1.default.connection.readyState,
        state: ["disconnected", "connected", "connecting", "disconnecting"][mongoose_1.default.connection.readyState],
        env: process.env.NODE_ENV,
        hasMongoUri: !!(process.env.MONGO_URI || process.env.MONGODB_URI)
    });
});
// Routes
app.use("/api/health-card", healthCardRoutes_1.default);
app.use("/api/contact", contactRoutes_1.default);
app.use("/api/bookings", bookingRoutes_1.default);
// 404
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});
// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Something went wrong!",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
