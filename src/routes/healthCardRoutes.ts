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

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.get("/apply", (req, res) => {
  res.json({ 
    success: true, 
    message: "Health card application form endpoint. Use POST to submit." 
  });
});

router.post("/apply", upload.single("image"), applyHealthCard);
router.get("/by-cnic/:cnic", getHealthCardByCnic);
router.get("/requests", getHealthCardRequests);
router.get("/", getHealthCards);
router.get("/:id", getHealthCardById);

// ✅ ADD THIS LINE - Support both endpoints
router.patch("/:id/approve", verifyHealthCardRequest);
router.patch("/verify/:id", verifyHealthCardRequest);
router.patch("/:id/status", updateHealthCardStatus);
router.delete("/:id", deleteHealthCard);

export default router;