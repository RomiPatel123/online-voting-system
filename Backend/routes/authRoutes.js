import express from "express";
import multer from "multer";
import path from "path";
import {
  registerUser,
  loginUser,
  getUserProfile,
  getVoters,
  verifyVoter,
  rejectVoter,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

import { storage } from "../config/cloudinary.js";

const upload = multer({ storage });

// Public
router.post(
  "/register",
  upload.fields([{ name: "idCardFront", maxCount: 1 }, { name: "idCardBack", maxCount: 1 }]),
  registerUser
);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resetToken", resetPassword);

// Protected
router.get("/profile", protect, getUserProfile);
router.put("/change-password", protect, changePassword);

// Admin — voter management
router.get("/voters", protect, adminOnly, getVoters);
router.put("/voters/:id/verify", protect, adminOnly, verifyVoter);
router.put("/voters/:id/reject", protect, adminOnly, rejectVoter);

export default router;
