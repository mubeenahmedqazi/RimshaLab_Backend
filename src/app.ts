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
// CORS Configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://rimsha-lab-frontend.vercel.app",
      "https://rimsha-lab-admin.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log("📁 Created uploads directory");
}
app.use("/uploads", express.static(uploadPath));

// ========== HEALTH CHECK ENDPOINTS ==========
// Root endpoint
app.get("/", (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  
  res.json({
    success: true,
    message: "🚀 Rimsha Lab Backend API",
    status: dbConnected ? "Fully Operational ✅" : "Running (DB Issue) ⚠️",
    database: {
      connected: dbConnected,
      state: ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState],
      name: mongoose.connection.name || "Not connected"
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
  const dbConnected = mongoose.connection.readyState === 1;
  
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
      readyState: mongoose.connection.readyState,
      state: ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState],
      host: mongoose.connection.host || "Not connected",
      name: mongoose.connection.name || "Not connected"
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
  const isConnected = mongoose.connection.readyState === 1;
  
  res.json({
    success: isConnected,
    message: isConnected ? "✅ Database connected" : "❌ Database disconnected",
    database: {
      connected: isConnected,
      readyState: mongoose.connection.readyState,
      state: ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState],
      models: Object.keys(mongoose.models)
    }
  });
});

// ========== DATABASE CHECK MIDDLEWARE ==========
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
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
app.use("/api/health-card", healthCardRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/bookings", bookingRoutes);

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
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
      errors: Object.values(err.errors).map((e: any) => e.message)
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

export default app;