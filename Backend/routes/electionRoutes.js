import express from "express";
import multer from "multer";
import {
    getElections,
    getPublicElections,
    getElectionById,
    createElection,
    startElection,
    stopElection,
    getElectionResults,
    deleteElection,
    addCandidate,
    getCandidates,
    getCandidateById,
    deleteCandidate,
    updateCandidate,
    updateElection,
} from "../controllers/electionController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer config for candidate photo + party symbol uploads
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// Public / Voter
router.get("/public", getPublicElections);
router.get("/", protect, getElections);
router.get("/:id", protect, getElectionById);
router.get("/:id/candidates", protect, getCandidates);

// Admin only
router.post("/", protect, adminOnly, createElection);
router.put("/:id", protect, adminOnly, updateElection);
router.put("/:id/start", protect, adminOnly, startElection);
router.put("/:id/stop", protect, adminOnly, stopElection);
router.get("/:id/results", protect, adminOnly, getElectionResults);
router.delete("/:id", protect, adminOnly, deleteElection);

router.post(
    "/:id/candidates",
    protect,
    adminOnly,
    upload.fields([{ name: "photo", maxCount: 1 }, { name: "partySymbol", maxCount: 1 }]),
    addCandidate
);
router.get("/candidates/:id", protect, adminOnly, getCandidateById);
router.delete("/candidates/:id", protect, adminOnly, deleteCandidate);

router.put(
    "/candidates/:id",
    protect,
    adminOnly,
    upload.fields([{ name: "photo", maxCount: 1 }, { name: "partySymbol", maxCount: 1 }]),
    updateCandidate
);

export default router;
