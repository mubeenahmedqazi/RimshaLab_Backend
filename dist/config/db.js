"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri)
        throw new Error("MongoDB URI missing");
    await mongoose_1.default.connect(uri, {
        serverSelectionTimeoutMS: 15000,
    });
    console.log("✅ MongoDB Connected:", mongoose_1.default.connection.name);
};
exports.default = connectDB;
