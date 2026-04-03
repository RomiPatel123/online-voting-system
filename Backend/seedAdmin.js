import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/userModel.js";

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected for seeding admin...");

        // Check if an admin already exists
        const adminExists = await User.findOne({ email: "admin@vote.com" });

        if (adminExists) {
            console.log("Admin account already exists with email: admin@vote.com. Deleting to recreate...");
            await User.deleteOne({ email: "admin@vote.com" });
        }

        // Create the admin user
        const adminUser = new User({
            name: "Super Admin",
            email: "admin@vote.com",
            password: "Test@123", // userModel.js has a pre-save hook that will hash this
            role: "admin",
            isVerified: true, // admin is automatically verified
        });

        await adminUser.save();
        console.log("✅ Admin account created successfully!");
        console.log("Login Credentials:");
        console.log("Email: admin@vote.com");
        console.log("Password: Test@123");
        process.exit(0);
    } catch (error) {
        console.error("Error creating admin:", error.message);
        process.exit(1);
    }
};

createAdmin();
