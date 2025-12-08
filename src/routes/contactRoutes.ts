import express from "express";
import { createMessage, getMessages, markAsRead } from "../controllers/contactController";

const router = express.Router();

router.post("/", createMessage);
router.get("/", getMessages);
router.patch("/:id/read", markAsRead); // New route for marking as read

export default router;