"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const healthCard_controller_1 = require("../controllers/healthCard.controller");
const router = express_1.default.Router();
// Memory storage for Vercel (no local files)
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
// Routes - FIXED ORDER
router.post("/apply", upload.single("image"), healthCard_controller_1.applyHealthCard); // This should come first
router.get("/by-cnic/:cnic", healthCard_controller_1.getHealthCardByCnic); // Specific routes first
router.get("/requests", healthCard_controller_1.getHealthCardRequests); // Specific routes first
router.get("/", healthCard_controller_1.getHealthCards); // This is fine here
router.get("/:id", healthCard_controller_1.getHealthCardById); // Generic param route LAST
router.patch("/verify/:id", healthCard_controller_1.verifyHealthCardRequest);
router.patch("/:id/status", healthCard_controller_1.updateHealthCardStatus);
router.delete("/:id", healthCard_controller_1.deleteHealthCard);
exports.default = router;
