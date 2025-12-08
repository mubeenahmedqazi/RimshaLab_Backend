"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bookingController_1 = require("../controllers/bookingController");
const router = express_1.default.Router();
router.post("/", bookingController_1.createBooking);
router.get("/", bookingController_1.getBookings);
router.get("/:id", bookingController_1.getBookingById);
// ✅ NEW ROUTE — update booking status
router.patch("/:id/complete", bookingController_1.markBookingAsCompleted);
exports.default = router;
