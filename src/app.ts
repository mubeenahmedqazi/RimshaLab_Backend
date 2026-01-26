// src/app.ts
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

// ✅ CORS - Allow your frontend
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://rimsha-lab-frontend.vercel.app",
      "https://rimsha-lab-admin.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

// ✅ Health check endpoint
app.get("/", (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const isConnected = dbStatus === 1;
  
  res.json({
    success: isConnected,
    message: isConnected ? "Backend is running ✅" : "Backend running but MongoDB disconnected ⚠️",
    database: {
      connected: isConnected,
      state: ["disconnected", "connected", "connecting", "disconnecting"][dbStatus],
      readyState: dbStatus
    },
    endpoints: [
      "/api/health-card",
      "/api/contact",
      "/api/bookings",
      "/api/debug"
    ]
  });
});

// ✅ Debug endpoint
app.get("/api/debug", (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  
  res.json({
    success: isConnected,
    timestamp: new Date().toISOString(),
    database: {
      connected: isConnected,
      readyState: mongoose.connection.readyState,
      state: ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState],
      host: mongoose.connection.host,
      name: mongoose.connection.name
    },
    environment: {
      node_env: process.env.NODE_ENV,
      vercel: process.env.VERCEL ? "true" : "false",
      region: process.env.VERCEL_REGION || "unknown"
    }
  });
});

// Import routes
import healthCardRoutes from "./routes/healthCardRoutes";
import contactRoutes from "./routes/contactRoutes";
import bookingRoutes from "./routes/bookingRoutes";

// Use routes
app.use("/api/health-card", healthCardRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/bookings", bookingRoutes);

// ✅ Add database check middleware
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database not connected. Please try again later.",
      error: "DATABASE_DISCONNECTED"
    });
  }
  next();
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("🚨 Server Error:", err);
  
  // MongoDB specific errors
  if (err.name === 'MongoServerSelectionError') {
    return res.status(503).json({
      success: false,
      message: "Database connection failed. Please check MongoDB configuration.",
      error: "MONGODB_CONNECTION_FAILED"
    });
  }
  
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

export default app;