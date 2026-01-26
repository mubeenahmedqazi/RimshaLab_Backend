import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

// Import routes
import healthCardRoutes from "./routes/healthCardRoutes";
import contactRoutes from "./routes/contactRoutes";
import bookingRoutes from "./routes/bookingRoutes";

const app = express();

// ========== MIDDLEWARE ==========
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://rimsha-lab-frontend.vercel.app",
    "https://rimsha-lab-admin.vercel.app"
  ],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads folder
const uploadPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
app.use("/uploads", express.static(uploadPath));

// ========== TEST ENDPOINTS ==========
app.get("/", (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  
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
  const isConnected = mongoose.connection.readyState === 1;
  const states = ["Disconnected", "Connected", "Connecting", "Disconnecting"];
  
  res.json({
    success: isConnected,
    database: {
      connected: isConnected,
      state: states[mongoose.connection.readyState],
      name: mongoose.connection.name || "N/A",
      host: mongoose.connection.host || "N/A"
    }
  });
});

// ========== DATABASE CHECK ==========
const dbCheck = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database not available",
      error: "Try changing MongoDB password (remove @ symbol) or check network access"
    });
  }
  next();
};

// ========== ROUTES ==========
app.use("/api/health-card", dbCheck, healthCardRoutes);
app.use("/api/contact", dbCheck, contactRoutes);
app.use("/api/bookings", dbCheck, bookingRoutes);

// ========== ERROR HANDLERS ==========
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

export default app;