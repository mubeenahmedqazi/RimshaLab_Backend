"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = __importDefault(require("./config/db"));
const healthCardRoutes_1 = __importDefault(require("./routes/healthCardRoutes"));
const contactRoutes_1 = __importDefault(require("./routes/contactRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json());
/* 🔑 Background DB connection */
app.use((_req, _res, next) => {
    if (mongoose_1.default.connection.readyState !== 1) {
        (0, db_1.default)();
    }
    next();
});
app.get("/", (_req, res) => {
    res.send("🚀 Rimsha Lab Backend is running!");
});
/* ✅ Health check */
app.get("/db-status", (_req, res) => {
    const states = ["Disconnected", "Connected", "Connecting", "Disconnecting"];
    res.json({
        connected: mongoose_1.default.connection.readyState === 1,
        state: states[mongoose_1.default.connection.readyState]
    });
});
app.use("/api/health-card", healthCardRoutes_1.default);
app.use("/api/contact", contactRoutes_1.default);
app.use("/api/bookings", bookingRoutes_1.default);
exports.default = app;
