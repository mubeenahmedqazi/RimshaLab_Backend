import { Request, Response } from "express";
const cloudinary = require("../utils/cloudinary");
import HealthCard from "../models/HealthCard";

// Format CNIC -> 
function formatCNIC(cnic: string) {
  const digits = cnic.replace(/\D/g, "");
  if (digits.length !== 13) return null;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

// Apply new health card
export const applyHealthCard = async (req: Request, res: Response) => {
  try {
    const { name, email, address, phone, cnic, gender, bloodGroup } = req.body;

    if (!name || !email || !address || !phone || !cnic || !gender || !bloodGroup) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const formattedCNIC = cnic.replace(/\D/g, "");
    if (formattedCNIC.length !== 13) {
      return res.status(400).json({ success: false, message: "Invalid CNIC" });
    }

    const existing = await HealthCard.findOne({ cnic: formattedCNIC });
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
      } catch (cloudinaryError: any) {
        return res.status(500).json({ 
          success: false, 
          message: "Image upload failed: " + cloudinaryError.message 
        });
      }
    }

    const newCard = new HealthCard({
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
  } catch (err: any) {
    if (err.code === 11000 && err.keyPattern?.cnic) {
      return res.status(409).json({ success: false, message: "A health card with this CNIC already exists" });
    }
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

// Get all health cards (with optional status filter)
export const getHealthCards = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    const filter = status ? { status } : {};
    const cards = await HealthCard.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, healthCards: cards });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get one health card by ID
export const getHealthCardById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const card = await HealthCard.findById(id);
    if (!card) return res.status(404).json({ success: false, message: "Health card not found" });

    res.status(200).json({ success: true, healthCard: card });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get health card by CNIC
export const getHealthCardByCnic = async (req: Request, res: Response) => {
  try {
    const { cnic } = req.params;
    const digitsOnly = cnic.replace(/\D/g, "");

    // Fetch only if status is "approved"
    const card = await HealthCard.findOne({ cnic: digitsOnly, status: "approved" });

    if (!card) {
      return res.status(404).json({ success: false, message: "Card not found or not approved yet" });
    }

    res.json({ success: true, healthCard: card });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Update health card status
export const updateHealthCardStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const card = await HealthCard.findById(id);
    if (!card) return res.status(404).json({ success: false, message: "Health card not found" });

    card.status = status;
    await card.save();

    res.status(200).json({ success: true, message: "Status updated", card });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete health card
export const deleteHealthCard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const card = await HealthCard.findByIdAndDelete(id);
    if (!card) return res.status(404).json({ success: false, message: "Health card not found" });

    res.status(200).json({ success: true, message: "Health card deleted" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get approved health card requests
export const getHealthCardRequests = async (req: Request, res: Response) => {
  try {
    const healthCards = await HealthCard.find({ status: "approved" }).sort({ createdAt: -1 });
    res.json({ success: true, healthCards });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Verify health card request
export const verifyHealthCardRequest = async (req: Request, res: Response) => {
  const { id } = req.params;
  const healthCard = await HealthCard.findByIdAndUpdate(
    id,
    { status: "approved" },
    { new: true }
  );
  if (!healthCard) return res.status(404).json({ success: false, message: "Health card not found" });
  res.json({ success: true, message: "Health card verified successfully", healthCard });
};
