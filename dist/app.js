"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Import routes
const healthCardRoutes_1 = __importDefault(require("./routes/healthCardRoutes"));
const contactRoutes_1 = __importDefault(require("./routes/contactRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// -------------------
// Middleware
// -------------------
app.use((0, cors_1.default)());
app.use(express_1.default.json()); // for parsing application/json
app.use(express_1.default.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// -------------------
// Ensure uploads folder exists
// -------------------
const uploadPath = path_1.default.join(__dirname, "../uploads");
if (!fs_1.default.existsSync(uploadPath)) {
    fs_1.default.mkdirSync(uploadPath, { recursive: true });
}
// Serve static files from uploads directory
app.use("/uploads", express_1.default.static(uploadPath));
// -------------------
// Routes
// -------------------
app.use("/api/health-card", healthCardRoutes_1.default);
app.use("/api/contact", contactRoutes_1.default);
app.use("/api/bookings", bookingRoutes_1.default);
// Health check route
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Server is running!",
        timestamp: new Date().toISOString(),
    });
});
// -------------------
// Error Handling
// -------------------
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Something went wrong!",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// 404 handler for unmatched routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});
// -------------------
// Start Server
// -------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
exports.default = app;
