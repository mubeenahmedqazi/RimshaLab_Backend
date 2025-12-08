import mongoose, { Schema } from "mongoose";

const HealthCardSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    cnic: { type: String, required: true, unique: true, index: true },
    bloodGroup: { type: String, required: true },       // NEW
    gender: { type: String, enum: ["Male", "Female"], required: true }, // NEW
    imageUrl: { type: String },
    status: {
      type: String,
      enum: ["new", "approved", "verify", "verified"],
      default: "new",
    },
  },
  { timestamps: true }
);


export default mongoose.models.HealthCard ||
  mongoose.model("HealthCard", HealthCardSchema);
