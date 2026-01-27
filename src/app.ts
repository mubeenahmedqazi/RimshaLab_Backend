import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import healthCardRoutes from "./routes/healthCardRoutes";
import contactRoutes from "./routes/contactRoutes";
import bookingRoutes from "./routes/bookingRoutes";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    success: true,
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

app.get("/db-status", (_req, res) => {
  res.json({
    connected: mongoose.connection.readyState === 1,
    state: mongoose.connection.readyState,
  });
});

app.use("/api/health-card", healthCardRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/bookings", bookingRoutes);

export default app;
