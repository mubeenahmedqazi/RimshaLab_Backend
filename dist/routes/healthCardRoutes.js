"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const healthCard_controller_1 = require("../controllers/healthCard.controller");
const router = express_1.default.Router();
// Ensure uploads folder exists
const uploadPath = path_1.default.join(__dirname, "../../uploads");
if (!fs_1.default.existsSync(uploadPath)) {
    fs_1.default.mkdirSync(uploadPath, { recursive: true });
}
// Multer disk storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});
const upload = (0, multer_1.default)({ storage });
// Apply health card
router.post("/apply", upload.single("image"), healthCard_controller_1.applyHealthCard);
// MUST BE FIRST — this fixes "Route not found"
router.get("/by-cnic/:cnic", healthCard_controller_1.getHealthCardByCnic);
// Get all health cards
router.get("/", healthCard_controller_1.getHealthCards);
// Get single health card by ID
router.get("/:id", healthCard_controller_1.getHealthCardById);
// Get health card requests
router.get("/requests", healthCard_controller_1.getHealthCardRequests);
// Verify health card
router.patch("/verify/:id", healthCard_controller_1.verifyHealthCardRequest);
// Approve
router.patch("/:id/approve", (req, res) => {
    req.body = { status: "approved" };
    (0, healthCard_controller_1.updateHealthCardStatus)(req, res);
});
// Verify status
router.patch("/:id/verify-status", (req, res) => {
    req.body = { status: "verified" };
    (0, healthCard_controller_1.updateHealthCardStatus)(req, res);
});
// Delete health card
router.delete("/:id", healthCard_controller_1.deleteHealthCard);
exports.default = router;
