import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./config/db";

import healthCardRoutes from "./routes/healthCardRoutes";
import contactRoutes from "./routes/contactRoutes";
import bookingRoutes from "./routes/bookingRoutes";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

/* 🔑 Background DB connection */
app.use((_req, _res, next) => {
  if (mongoose.connection.readyState !== 1) {
    connectDB();
  }
  next();
});

/* ✅ Health check */
app.get("/db-status", (_req, res) => {
  const states = ["Disconnected", "Connected", "Connecting", "Disconnecting"];

  res.json({
    connected: mongoose.connection.readyState === 1,
    state: states[mongoose.connection.readyState]
  });
});

app.use("/api/health-card", healthCardRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/bookings", bookingRoutes);

export default app;
