import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";

// Import routes
import healthCardRoutes from "./routes/healthCardRoutes";
import contactRoutes from "./routes/contactRoutes";
import bookingRoutes from "./routes/bookingRoutes";

const app = express();

// ========== MIDDLEWARE ==========
app.use(cors({
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
  // Check database connection safely
  const dbConnected = mongoose?.connection?.readyState === 1;
  
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
  const isConnected = mongoose?.connection?.readyState === 1;
  const states = ["Disconnected", "Connected", "Connecting", "Disconnecting"];
  const stateIndex = mongoose?.connection?.readyState || 0;
  
  res.json({
    success: isConnected,
    database: {
      connected: isConnected,
      state: states[stateIndex],
      name: mongoose?.connection?.name || "N/A",
      host: mongoose?.connection?.host || "N/A",
      readyState: mongoose?.connection?.readyState
    }
  });
});

// ========== ROUTES ==========
app.use("/api/health-card", healthCardRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/bookings", bookingRoutes);

// ========== ERROR HANDLERS ==========
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: "Route not found",
    path: req.path 
  });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Server Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

export default app;