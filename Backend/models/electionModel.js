import mongoose from "mongoose";

const electionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
        },

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            required: true,
        },

        status: {
            type: String,
            enum: ["upcoming", "active", "stopped", "completed"],
            default: "upcoming",
        },

        candidates: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Candidate",
            },
        ],

        // 🔗 Eligibility & Targeting
        type: {
            type: String,
            enum: ["General", "CR"], // General = for Secretary/Joint Secretary, etc.
            default: "General",
        },

        targetYear: {
            type: String, // "1st Year", "2nd Year", "3rd Year", or "All"
            default: "All",
        },

        targetDepartment: {
            type: String, // "BCA", "BBA", etc., or "All"
            default: "All",
        },
    },
    { timestamps: true }
);

const Election = mongoose.model("Election", electionSchema);
export default Election;
