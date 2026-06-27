import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { uploadResume, getAnalysisHistory, getSingleReport, deleteReport } from "../controllers/resume.controllers.js";
import { uploadResumeMiddleware } from "../utils/fileStorage.js";
import { validateUploadResume, validateResumeId } from "../validators/resume.validators.js";

const router = express.Router();

router.post("/upload", protectRoute, uploadResumeMiddleware, validateUploadResume, uploadResume);
router.get("/history", protectRoute, getAnalysisHistory);
router.get("/:id", protectRoute, validateResumeId, getSingleReport);
router.delete("/:id", protectRoute, validateResumeId, deleteReport);

export default router;
