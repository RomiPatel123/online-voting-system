import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: true,
        },

        photo: {
            type: String, // URL / path to candidate photo
            default: "",
        },

        bio: {
            type: String,
            default: "",
        },

        election: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Election",
            required: true,
        },

        role: {
            type: String,
            enum: ["Secretary", "Joint Secretary", "Additional Joint Secretary", "CR"],
            default: "CR",
        },

        targetYear: { type: String, default: "All" },
        targetDepartment: { type: String, default: "All" },
        targetSection: { type: String, default: "All" },

        voteCount: {
            type: Number,
            default: 0,
        },

        isVerified: {
            type: Boolean,
            default: true, // Admin adds candidates directly, they are verified
        },
    },
    { timestamps: true }
);

const Candidate = mongoose.model("Candidate", candidateSchema);
export default Candidate;
