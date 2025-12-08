"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyHealthCardRequest = exports.getHealthCardRequests = exports.deleteHealthCard = exports.updateHealthCardStatus = exports.getHealthCardByCnic = exports.getHealthCardById = exports.getHealthCards = exports.applyHealthCard = void 0;
const cloudinary = require("../utils/cloudinary");
const HealthCard_1 = __importDefault(require("../models/HealthCard"));
// Format CNIC -> 35201-7329319-9
function formatCNIC(cnic) {
    const digits = cnic.replace(/\D/g, "");
    if (digits.length !== 13)
        return null;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}
// Apply new health card
const applyHealthCard = async (req, res) => {
    var _a;
    try {
        const { name, email, address, phone, cnic, gender, bloodGroup } = req.body;
        if (!name || !email || !address || !phone || !cnic || !gender || !bloodGroup) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const formattedCNIC = cnic.replace(/\D/g, "");
        if (formattedCNIC.length !== 13) {
            return res.status(400).json({ success: false, message: "Invalid CNIC" });
        }
        const existing = await HealthCard_1.default.findOne({ cnic: formattedCNIC });
        if (existing) {
            return res.status(409).json({ success: false, message: "A health card with this CNIC already exists" });
        }
        let imageUrl = "";
        if (req.file && req.file.path) {
            try {
                const uploadedImage = await cloudinary.uploader.upload(req.file.path, {
                    folder: "healthCards",
                });
                imageUrl = uploadedImage.secure_url;
            }
            catch (cloudinaryError) {
                return res.status(500).json({
                    success: false,
                    message: "Image upload failed: " + cloudinaryError.message
                });
            }
        }
        const newCard = new HealthCard_1.default({
            name,
            email,
            address,
            phone,
            cnic: formattedCNIC,
            gender,
            bloodGroup,
            imageUrl,
            status: "new",
        });
        await newCard.save();
        res.status(201).json({ success: true, message: "Health card applied successfully", healthCard: newCard });
    }
    catch (err) {
        if (err.code === 11000 && ((_a = err.keyPattern) === null || _a === void 0 ? void 0 : _a.cnic)) {
            return res.status(409).json({ success: false, message: "A health card with this CNIC already exists" });
        }
        res.status(500).json({ success: false, message: err.message || "Server error" });
    }
};
exports.applyHealthCard = applyHealthCard;
// Get all health cards (with optional status filter)
const getHealthCards = async (req, res) => {
    try {
        const status = req.query.status;
        const filter = status ? { status } : {};
        const cards = await HealthCard_1.default.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, healthCards: cards });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getHealthCards = getHealthCards;
// Get one health card by ID
const getHealthCardById = async (req, res) => {
    try {
        const { id } = req.params;
        const card = await HealthCard_1.default.findById(id);
        if (!card)
            return res.status(404).json({ success: false, message: "Health card not found" });
        res.status(200).json({ success: true, healthCard: card });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getHealthCardById = getHealthCardById;
// ✅ Get health card by CNIC
const getHealthCardByCnic = async (req, res) => {
    try {
        const { cnic } = req.params;
        const digitsOnly = cnic.replace(/\D/g, "");
        const card = await HealthCard_1.default.findOne({ cnic: digitsOnly });
        if (!card) {
            return res.status(404).json({ success: false, message: "Card not found" });
        }
        res.json({ success: true, healthCard: card });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getHealthCardByCnic = getHealthCardByCnic;
// Update health card status
const updateHealthCardStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const card = await HealthCard_1.default.findById(id);
        if (!card)
            return res.status(404).json({ success: false, message: "Health card not found" });
        card.status = status;
        await card.save();
        res.status(200).json({ success: true, message: "Status updated", card });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateHealthCardStatus = updateHealthCardStatus;
// Delete health card
const deleteHealthCard = async (req, res) => {
    try {
        const { id } = req.params;
        const card = await HealthCard_1.default.findByIdAndDelete(id);
        if (!card)
            return res.status(404).json({ success: false, message: "Health card not found" });
        res.status(200).json({ success: true, message: "Health card deleted" });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.deleteHealthCard = deleteHealthCard;
// Get approved health card requests
const getHealthCardRequests = async (req, res) => {
    try {
        const healthCards = await HealthCard_1.default.find({ status: "approved" }).sort({ createdAt: -1 });
        res.json({ success: true, healthCards });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getHealthCardRequests = getHealthCardRequests;
// Verify health card request
const verifyHealthCardRequest = async (req, res) => {
    const { id } = req.params;
    const healthCard = await HealthCard_1.default.findByIdAndUpdate(id, { status: "approved" }, { new: true });
    if (!healthCard)
        return res.status(404).json({ success: false, message: "Health card not found" });
    res.json({ success: true, message: "Health card verified successfully", healthCard });
};
exports.verifyHealthCardRequest = verifyHealthCardRequest;
