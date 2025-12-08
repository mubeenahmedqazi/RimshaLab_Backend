import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Import routes
import healthCardRoutes from "./routes/healthCardRoutes";
import contactRoutes from "./routes/contactRoutes";
import bookingRoutes from "./routes/bookingRoutes";

dotenv.config();
const app = express();

// -------------------
// Middleware
// -------------------
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// -------------------
// Ensure uploads folder exists
// -------------------
const uploadPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Serve static files from uploads directory
app.use("/uploads", express.static(uploadPath));

// -------------------
// Routes
// -------------------
app.use("/api/health-card", healthCardRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/bookings", bookingRoutes);

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
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

export default app;
