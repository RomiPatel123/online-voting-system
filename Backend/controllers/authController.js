import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import Candidate from "../models/candidateModel.js";
import Election from "../models/electionModel.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

// 🔐 Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// 📝 Register Voter (with ID Card upload)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, department, year, election } = req.body;

    if (!election || election === "" || election === "undefined") {
      return res.status(400).json({ message: "Please select a valid election to participate in." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      const match = await userExists.matchPassword(password);
      if (!match) {
        return res.status(401).json({ message: "Email already registered. Invalid password provided." });
      }

      if (userExists.registeredElections.includes(election)) {
        return res.status(400).json({ message: "You are already registered for this election." });
      }

      userExists.registeredElections.push(election);
      await userExists.save();

      return res.status(200).json({
        _id: userExists._id,
        name: userExists.name,
        email: userExists.email,
        role: userExists.role,
        isVerified: userExists.isVerified,
        registeredElections: userExists.registeredElections,
        token: generateToken(userExists._id),
      });
    }

    const idCardFront = req.files?.idCardFront
      ? req.files.idCardFront[0].path
      : "";
    const idCardBack = req.files?.idCardBack
      ? req.files.idCardBack[0].path
      : "";

    const user = await User.create({
      name,
      email,
      password,
      phone,
      department,
      year,
      registeredElections: [election],
      idCardFront,
      idCardBack,
      role: "voter",
      isVerified: false,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        registeredElections: user.registeredElections,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔑 Login User (Voter or Admin)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if candidate first
    const candidate = await Candidate.findOne({ email }).populate("election", "title status");
    if (candidate) {
      const bcrypt = await import("bcryptjs");
      const match = await bcrypt.default.compare(password, candidate.password);
      if (match) {
        return res.json({
          _id: candidate._id,
          name: candidate.name,
          email: candidate.email,
          role: "candidate",
          photo: candidate.photo,
          election: candidate.election,
          token: generateToken(candidate._id),
        });
      }
    }

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      // OVERRIDE: Prevent unverified voters from logging in as per user request
      if (user.role === "voter" && !user.isVerified) {
        return res.status(403).json({ message: "Your account is pending verification. Please check your email for updates before logging in." });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        registeredElections: user.registeredElections,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 👤 Get Logged In User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// 🔐  ADMIN – Voter Management
// ─────────────────────────────────────────────

/** GET /api/auth/voters  – list all voters */
export const getVoters = async (req, res) => {
  try {
    const voters = await User.find({ role: "voter" })
      .select("-password")
      .populate({ path: "registeredElections", model: "Election", select: "title" })
      .sort({ createdAt: -1 });
    res.json(voters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** PUT /api/auth/voters/:id/verify  – verify a voter */
export const verifyVoter = async (req, res) => {
  try {
    const voter = await User.findById(req.params.id);
    if (!voter) return res.status(404).json({ message: "Voter not found" });

    voter.isVerified = true;
    await voter.save();

    // Send Professional Approval Email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2563eb; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">VoteCentral Verification</h1>
        </div>
        <div style="padding: 30px; background-color: #f8fafc;">
          <h2 style="color: #1e293b; margin-top: 0;">Congratulations, ${voter.name}!</h2>
          <p style="color: #475569; line-height: 1.6;">
            Your Identification card and identity details have been successfully verified by our administrators.
          </p>
          <div style="background-color: #dcfce7; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
            <p style="color: #166534; margin: 0; font-weight: bold;">Status: Approved - Ready to Vote</p>
          </div>
          <p style="color: #475569; line-height: 1.6;">
            You can now log in to the portal and securely cast your vote in your registered election.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:5173/login" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Login to Vote</a>
          </div>
        </div>
        <div style="background-color: #1e293b; color: #94a3b8; text-align: center; padding: 15px; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} VoteCentral. All rights reserved.</p>
        </div>
      </div>
    `;

    await sendEmail({
      to: voter.email,
      subject: "Verification Successful - You can now vote!",
      html: emailHtml,
    });

    res.json({ message: "Voter verified successfully", voter });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** PUT /api/auth/voters/:id/reject  – reject/unverify a voter */
export const rejectVoter = async (req, res) => {
  try {
    const voter = await User.findById(req.params.id);
    if (!voter) return res.status(404).json({ message: "Voter not found" });

    voter.isVerified = false;
    await voter.save();

    // Send Professional Rejection Email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #dc2626; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">VoteCentral Verification</h1>
        </div>
        <div style="padding: 30px; background-color: #f8fafc;">
          <h2 style="color: #1e293b; margin-top: 0;">Action Required, ${voter.name}</h2>
          <p style="color: #475569; line-height: 1.6;">
            Your recent application to participate in the upcoming election was reviewed by our administrative team.
          </p>
          <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
            <p style="color: #991b1b; margin: 0; font-weight: bold;">Status: Verification Rejected</p>
          </div>
          <p style="color: #475569; line-height: 1.6;">
            Unfortunately, we could not verify your identity based on the provided documents. Please ensure clear images of your ID card were uploaded or contact the administration for further assistance.
          </p>
        </div>
        <div style="background-color: #1e293b; color: #94a3b8; text-align: center; padding: 15px; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} VoteCentral. All rights reserved.</p>
        </div>
      </div>
    `;

    await sendEmail({
      to: voter.email,
      subject: "Account Verification Rejected",
      html: emailHtml,
    });

    res.json({ message: "Voter rejected", voter });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔐 Forgot Password - Send Reset Link
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found with that email" });
    }

    // Generate and hash reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    
    // Set expiry to 1 hour
    user.resetPasswordExpire = Date.now() + 3600000;

    await user.save();

    // Create reset URL
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please go to this link to reset your password:</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Token",
        html: message,
      });

      res.status(200).json({ message: "Email sent" });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔐 Reset Password
export const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔐 Change Password (Logged-in)
export const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { oldPassword, newPassword } = req.body;

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid old password" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
