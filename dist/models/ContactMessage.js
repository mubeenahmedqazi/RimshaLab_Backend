"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const contactSchema = new mongoose_1.default.Schema({
    name: String,
    email: String,
    subject: String,
    message: String,
    phone: String,
    status: {
        type: String,
        enum: ["unread", "read"],
        default: "unread"
    },
    readAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });
exports.default = mongoose_1.default.model("ContactMessage", contactSchema); // Fixed: contactSchema instead of contactMessage
