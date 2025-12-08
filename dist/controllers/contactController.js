"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessage = exports.markAsRead = exports.getMessages = void 0;
const ContactMessage_1 = __importDefault(require("../models/ContactMessage"));
// Get all messages (with filter for read/unread)
const getMessages = async (req, res) => {
    try {
        const { status } = req.query; // 'read' or 'unread'
        let filter = {};
        if (status === 'read' || status === 'unread') {
            filter = { status };
        }
        const messages = await ContactMessage_1.default.find(filter).sort({ createdAt: -1 });
        res.json({
            success: true,
            messages: messages
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
exports.getMessages = getMessages;
// Mark message as read
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await ContactMessage_1.default.findByIdAndUpdate(id, {
            status: "read",
            readAt: new Date()
        }, { new: true });
        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }
        res.json({
            success: true,
            message: "Message marked as read",
            data: message
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
exports.markAsRead = markAsRead;
// Create new message (default: unread)
const createMessage = async (req, res) => {
    try {
        const message = new ContactMessage_1.default(Object.assign(Object.assign({}, req.body), { status: "unread" // Always set as unread when created
         }));
        await message.save();
        res.status(201).json({
            success: true,
            message: "Message created successfully",
            data: message
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
exports.createMessage = createMessage;
