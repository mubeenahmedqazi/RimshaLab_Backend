import express from "express";
import multer from "multer";
import {
  applyHealthCard,
  getHealthCards,
  getHealthCardById,
  deleteHealthCard,
  getHealthCardRequests,
  verifyHealthCardRequest,
  getHealthCardByCnic,
  updateHealthCardStatus,
} from "../controllers/healthCard.controller";

const router = express.Router();

// Memory storage for Vercel (no local files)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes - FIXED ORDER
router.post("/apply", upload.single("image"), applyHealthCard);  
router.get("/by-cnic/:cnic", getHealthCardByCnic);             
router.get("/requests", getHealthCardRequests);                
router.get("/", getHealthCards);                               
router.get("/:id", getHealthCardById);                         
router.patch("/verify/:id", verifyHealthCardRequest);
router.patch("/:id/status", updateHealthCardStatus);
router.delete("/:id", deleteHealthCard);

export default router;