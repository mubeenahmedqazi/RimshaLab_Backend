import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
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

export default mongoose.model("ContactMessage", contactSchema); // Fixed: contactSchema instead of contactMessage