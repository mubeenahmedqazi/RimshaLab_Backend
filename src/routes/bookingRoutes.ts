import express from "express";
import {
  createBooking,
  getBookings,
  getBookingById,
  markBookingAsCompleted
} from "../controllers/bookingController";

const router = express.Router();

router.post("/", createBooking);
router.get("/", getBookings);
router.get("/:id", getBookingById);

// ✅ NEW ROUTE — update booking status
router.patch("/:id/complete", markBookingAsCompleted);

export default router;
