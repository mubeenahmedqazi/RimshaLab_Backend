import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  bloodGroup: {
    type: String,
    default: ""
  },
  testName: {
    type: String,
    required: true
  },
  otherTest: {
    type: String,
    default: ""
  },
  paymentMode: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "pending"
  }
}, { 
  timestamps: true 
});

export default mongoose.model("Booking", bookingSchema);