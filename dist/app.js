"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
// Import routes
const healthCardRoutes_1 = __importDefault(require("./routes/healthCardRoutes"));
const contactRoutes_1 = __importDefault(require("./routes/contactRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const app = (0, express_1.default)();
// ========== MIDDLEWARE ==========
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "https://rimsha-lab-frontend.vercel.app",
        "https://rimsha-lab-admin.vercel.app"
    ],
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Uploads folder
const uploadPath = path_1.default.join(process.cwd(), "uploads");
if (!fs_1.default.existsSync(uploadPath)) {
    fs_1.default.mkdirSync(uploadPath, { recursive: true });
}
app.use("/uploads", express_1.default.static(uploadPath));
// ========== TEST ENDPOINTS ==========
app.get("/", (req, res) => {
    const dbConnected = mongoose_1.default.connection.readyState === 1;
    res.json({
        success: true,
        message: "Rimsha Lab Backend",
        database: dbConnected ? "Connected ✅" : "Disconnected ⚠️",
        endpoints: {
            health: "/health",
            dbStatus: "/db-status",
            healthCard: "/api/health-card",
            contact: "/api/contact",
            bookings: "/api/bookings"
        }
    });
});
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
app.get("/db-status", (req, res) => {
    const isConnected = mongoose_1.default.connection.readyState === 1;
    const states = ["Disconnected", "Connected", "Connecting", "Disconnecting"];
    res.json({
        success: isConnected,
        database: {
            connected: isConnected,
            state: states[mongoose_1.default.connection.readyState],
            name: mongoose_1.default.connection.name || "N/A",
            host: mongoose_1.default.connection.host || "N/A"
        }
    });
});
// ========== DATABASE CHECK ==========
const dbCheck = (req, res, next) => {
    if (mongoose_1.default.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            message: "Database not available",
            error: "Try changing MongoDB password (remove @ symbol) or check network access"
        });
    }
    next();
};
// ========== ROUTES ==========
app.use("/api/health-card", dbCheck, healthCardRoutes_1.default);
app.use("/api/contact", dbCheck, contactRoutes_1.default);
app.use("/api/bookings", dbCheck, bookingRoutes_1.default);
// ========== ERROR HANDLERS ==========
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Not found" });
});
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json(Object.assign({ success: false, message: err.message || "Server error" }, (process.env.NODE_ENV === "development" && { stack: err.stack })));
});
exports.default = app;
