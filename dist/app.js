"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Import routes
const healthCardRoutes_1 = __importDefault(require("./routes/healthCardRoutes"));
const contactRoutes_1 = __importDefault(require("./routes/contactRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const app = (0, express_1.default)();
// ========== MIDDLEWARE ==========
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "https://rimsha-lab-frontend.vercel.app",
        "https://rimsha-lab-admin.vercel.app",
        "https://*.vercel.app" // Allow all Vercel domains
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
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
    var _a;
    // Check database connection safely
    const dbConnected = ((_a = mongoose_1.default === null || mongoose_1.default === void 0 ? void 0 : mongoose_1.default.connection) === null || _a === void 0 ? void 0 : _a.readyState) === 1;
    res.json({
        success: true,
        message: "Rimsha Lab Backend API",
        database: dbConnected ? "Connected ✅" : "Disconnected ⚠️",
        timestamp: new Date().toISOString(),
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
        uptime: process.uptime(),
        nodeVersion: process.version
    });
});
app.get("/db-status", (req, res) => {
    var _a, _b, _c, _d, _e;
    const isConnected = ((_a = mongoose_1.default === null || mongoose_1.default === void 0 ? void 0 : mongoose_1.default.connection) === null || _a === void 0 ? void 0 : _a.readyState) === 1;
    const states = ["Disconnected", "Connected", "Connecting", "Disconnecting"];
    const stateIndex = ((_b = mongoose_1.default === null || mongoose_1.default === void 0 ? void 0 : mongoose_1.default.connection) === null || _b === void 0 ? void 0 : _b.readyState) || 0;
    res.json({
        success: isConnected,
        database: {
            connected: isConnected,
            state: states[stateIndex],
            name: ((_c = mongoose_1.default === null || mongoose_1.default === void 0 ? void 0 : mongoose_1.default.connection) === null || _c === void 0 ? void 0 : _c.name) || "N/A",
            host: ((_d = mongoose_1.default === null || mongoose_1.default === void 0 ? void 0 : mongoose_1.default.connection) === null || _d === void 0 ? void 0 : _d.host) || "N/A",
            readyState: (_e = mongoose_1.default === null || mongoose_1.default === void 0 ? void 0 : mongoose_1.default.connection) === null || _e === void 0 ? void 0 : _e.readyState
        }
    });
});
// ========== ROUTES ==========
app.use("/api/health-card", healthCardRoutes_1.default);
app.use("/api/contact", contactRoutes_1.default);
app.use("/api/bookings", bookingRoutes_1.default);
// ========== ERROR HANDLERS ==========
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.path
    });
});
app.use((err, req, res, next) => {
    console.error("Server Error:", err);
    res.status(500).json(Object.assign({ success: false, message: err.message || "Internal server error" }, (process.env.NODE_ENV === "development" && { stack: err.stack })));
});
exports.default = app;
