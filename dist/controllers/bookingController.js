"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markBookingAsCompleted = exports.getBookingById = exports.getBookings = exports.createBooking = void 0;
const Booking_1 = __importDefault(require("../models/Booking"));
const createBooking = async (req, res) => {
    try {
        const booking = new Booking_1.default(req.body);
        await booking.save();
        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            booking: booking
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};
exports.createBooking = createBooking;
const getBookings = async (req, res) => {
    try {
        const bookings = await Booking_1.default.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            bookings: bookings
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};
exports.getBookings = getBookings;
const getBookingById = async (req, res) => {
    try {
        const booking = await Booking_1.default.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }
        res.status(200).json({
            success: true,
            booking: booking
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};
exports.getBookingById = getBookingById;
// ✅ NEW CONTROLLER — mark as completed
const markBookingAsCompleted = async (req, res) => {
    try {
        const booking = await Booking_1.default.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }
        booking.status = "completed";
        await booking.save();
        res.status(200).json({
            success: true,
            message: "Booking marked as completed",
            booking
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};
exports.markBookingAsCompleted = markBookingAsCompleted;
