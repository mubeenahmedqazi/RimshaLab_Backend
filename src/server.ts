// src/server.ts - THIS IS YOUR MAIN FILE
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Load environment variables
if (process.env.NODE_ENV !== "production") {
  dotenv.config(); 
}

// Import connectDB
import connectDB from "./config/db";

// Import routes
import healthCardRoutes from "./routes/healthCardRoutes";
import contactRoutes from "./routes/contactRoutes";
import bookingRoutes from "./routes/bookingRoutes";

// ✅ CONNECT TO MONGODB FIRST
connectDB();

const app = express();

// ✅ Update CORS with your actual frontend URL
app.use(
  cors({
    origin: [
      "http://localhost:3000", 
      "https://rimsha-lab-frontend.vercel.app"  // <-- CHANGE THIS!
    ],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads folder exists
const uploadPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
app.use("/uploads", express.static(uploadPath));

// ✅ Health check with DB status
app.get("/", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  
  res.json({
    success: true,
    message: `Backend is live! MongoDB: ${dbStatus}`,
    endpoints: [
      "/api/health-card",
      "/api/contact", 
      "/api/bookings",
      "/api/db-status"  // New endpoint
    ]
  });
});

// ✅ Add DB status endpoint
app.get("/api/db-status", (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    success: isConnected,
    message: isConnected ? "✅ MongoDB Connected" : "❌ MongoDB Not Connected",
    readyState: mongoose.connection.readyState,
    state: ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState],
    env: process.env.NODE_ENV,
    hasMongoUri: !!(process.env.MONGO_URI || process.env.MONGODB_URI)
  });
});

// Routes
app.use("/api/health-card", healthCardRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/bookings", bookingRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use(
  (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      message: "Something went wrong!",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});