"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const healthCard_controller_1 = require("../controllers/healthCard.controller");
const router = express_1.default.Router();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
// Routes
router.get("/apply", (req, res) => {
    res.json({
        success: true,
        message: "Health card application form endpoint. Use POST to submit."
    });
});
router.post("/apply", upload.single("image"), healthCard_controller_1.applyHealthCard);
router.get("/by-cnic/:cnic", healthCard_controller_1.getHealthCardByCnic);
router.get("/requests", healthCard_controller_1.getHealthCardRequests);
router.get("/", healthCard_controller_1.getHealthCards);
router.get("/:id", healthCard_controller_1.getHealthCardById);
// ✅ ADD THIS LINE - Support both endpoints
router.patch("/:id/approve", healthCard_controller_1.verifyHealthCardRequest);
router.patch("/verify/:id", healthCard_controller_1.verifyHealthCardRequest);
router.patch("/:id/status", healthCard_controller_1.updateHealthCardStatus);
router.delete("/:id", healthCard_controller_1.deleteHealthCard);
exports.default = router;
