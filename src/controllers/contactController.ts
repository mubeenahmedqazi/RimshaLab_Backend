import { Request, Response } from "express";
import ContactMessage from "../models/ContactMessage";

// Get all messages (with filter for read/unread)
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { status } = req.query; // 'read' or 'unread'
    
    let filter = {};
    if (status === 'read' || status === 'unread') {
      filter = { status };
    }

    const messages = await ContactMessage.find(filter).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      messages: messages
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

// Mark message as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const message = await ContactMessage.findByIdAndUpdate(
      id,
      { 
        status: "read",
        readAt: new Date()
      },
      { new: true }
    );

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
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

// Create new message (default: unread)
export const createMessage = async (req: Request, res: Response) => {
  try {
    const message = new ContactMessage({
      ...req.body,
      status: "unread" // Always set as unread when created
    });
    
    await message.save();
    
    res.status(201).json({
      success: true,
      message: "Message created successfully",
      data: message
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};