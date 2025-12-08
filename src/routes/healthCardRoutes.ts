import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { 
  applyHealthCard, 
  getHealthCards, 
  updateHealthCardStatus, 
  getHealthCardById, 
  deleteHealthCard,
  getHealthCardRequests,
  verifyHealthCardRequest,
  getHealthCardByCnic
} from "../controllers/healthCard.controller";

const router = express.Router();

// Ensure uploads folder exists
const uploadPath = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Multer disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Apply health card
router.post("/apply", upload.single("image"), applyHealthCard);

// MUST BE FIRST — this fixes "Route not found"
router.get("/by-cnic/:cnic", getHealthCardByCnic);

// Get all health cards
router.get("/", getHealthCards);

// Get single health card by ID
router.get("/:id", getHealthCardById);

// Get health card requests
router.get("/requests", getHealthCardRequests);

// Verify health card
router.patch("/verify/:id", verifyHealthCardRequest);

// Approve
router.patch("/:id/approve", (req, res) => {
  req.body = { status: "approved" };
  updateHealthCardStatus(req, res);
});

// Verify status
router.patch("/:id/verify-status", (req, res) => {
  req.body = { status: "verified" };
  updateHealthCardStatus(req, res);
});

// Delete health card
router.delete("/:id", deleteHealthCard);

export default router;
