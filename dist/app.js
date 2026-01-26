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
// CORS Configuration
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "https://rimsha-lab-frontend.vercel.app",
        "https://rimsha-lab-admin.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
// Parse JSON and URL-encoded data
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Create uploads directory if it doesn't exist
const uploadPath = path_1.default.join(process.cwd(), "uploads");
if (!fs_1.default.existsSync(uploadPath)) {
    fs_1.default.mkdirSync(uploadPath, { recursive: true });
    console.log("📁 Created uploads directory");
}
app.use("/uploads", express_1.default.static(uploadPath));
// ========== HEALTH CHECK ENDPOINTS ==========
// Root endpoint
app.get("/", (req, res) => {
    const dbConnected = mongoose_1.default.connection.readyState === 1;
    res.json({
        success: true,
        message: "🚀 Rimsha Lab Backend API",
        status: dbConnected ? "Fully Operational ✅" : "Running (DB Issue) ⚠️",
        database: {
            connected: dbConnected,
            state: ["disconnected", "connected", "connecting", "disconnecting"][mongoose_1.default.connection.readyState],
            name: mongoose_1.default.connection.name || "Not connected"
        },
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        endpoints: {
            healthCard: "/api/health-card",
            contact: "/api/contact",
            bookings: "/api/bookings",
            debug: "/api/debug"
        }
    });
});
// Debug endpoint
app.get("/api/debug", (req, res) => {
    const dbConnected = mongoose_1.default.connection.readyState === 1;
    res.json({
        success: true,
        server: {
            environment: process.env.NODE_ENV || "development",
            platform: process.platform,
            uptime: process.uptime(),
            memory: process.memoryUsage()
        },
        database: {
            connected: dbConnected,
            readyState: mongoose_1.default.connection.readyState,
            state: ["disconnected", "connected", "connecting", "disconnecting"][mongoose_1.default.connection.readyState],
            host: mongoose_1.default.connection.host || "Not connected",
            name: mongoose_1.default.connection.name || "Not connected"
        },
        environment: {
            node_env: process.env.NODE_ENV,
            vercel: process.env.VERCEL ? "Yes" : "No",
            region: process.env.VERCEL_REGION || "local",
            has_mongodb_uri: !!(process.env.MONGODB_URI || process.env.MONGO_URI)
        },
        routes: {
            healthCard: {
                GET: "/api/health-card",
                POST: "/api/health-card",
                "GET by CNIC": "/api/health-card/by-cnic/:cnic"
            },
            contact: {
                POST: "/api/contact"
            },
            bookings: {
                GET: "/api/bookings",
                POST: "/api/bookings"
            }
        }
    });
});
// Database status endpoint
app.get("/api/db-status", (req, res) => {
    const isConnected = mongoose_1.default.connection.readyState === 1;
    res.json({
        success: isConnected,
        message: isConnected ? "✅ Database connected" : "❌ Database disconnected",
        database: {
            connected: isConnected,
            readyState: mongoose_1.default.connection.readyState,
            state: ["disconnected", "connected", "connecting", "disconnecting"][mongoose_1.default.connection.readyState],
            models: Object.keys(mongoose_1.default.models)
        }
    });
});
// ========== DATABASE CHECK MIDDLEWARE ==========
app.use((req, res, next) => {
    if (mongoose_1.default.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            message: "Database temporarily unavailable",
            error: "DB_DISCONNECTED",
            solution: "Check MongoDB connection and Vercel environment variables"
        });
    }
    next();
});
// ========== API ROUTES ==========
app.use("/api/health-card", healthCardRoutes_1.default);
app.use("/api/contact", contactRoutes_1.default);
app.use("/api/bookings", bookingRoutes_1.default);
// ========== ERROR HANDLING ==========
// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        availableRoutes: [
            "GET /",
            "GET /api/debug",
            "GET /api/db-status",
            "GET /api/health-card",
            "POST /api/health-card",
            "GET /api/health-card/by-cnic/:cnic",
            "POST /api/contact",
            "GET /api/bookings",
            "POST /api/bookings"
        ]
    });
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err);
    // MongoDB specific errors
    if (err.name === 'MongoServerSelectionError' || err.name === 'MongoNetworkError') {
        return res.status(503).json({
            success: false,
            message: "Database connection error",
            error: "MONGODB_CONNECTION_FAILED",
            details: "Check MongoDB Atlas network access and connection string"
        });
    }
    // Mongoose validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: Object.values(err.errors).map((e) => e.message)
        });
    }
    // Default error
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
        error: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
});
exports.default = app;
