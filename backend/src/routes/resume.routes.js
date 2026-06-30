import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
  uploadResume, 
  getAnalysisHistory, 
  getSingleReport, 
  downloadReport,
  deleteReport,
  generateAISuggestionsController,
  getCoverLetterController,
  getInterviewQuestionsController
} from "../controllers/resume.controllers.js";
import { uploadResumeMiddleware } from "../utils/fileStorage.js";
import { validateUploadResume, validateResumeId } from "../validators/resume.validators.js";

const router = express.Router();

router.post("/upload", protectRoute, uploadResumeMiddleware, validateUploadResume, uploadResume);
router.get("/history", protectRoute, getAnalysisHistory);
router.get("/:id/download", protectRoute, validateResumeId, downloadReport);
router.get("/:id", protectRoute, validateResumeId, getSingleReport);
router.delete("/:id", protectRoute, validateResumeId, deleteReport);

// New endpoints
router.post("/:id/ai-suggestions", protectRoute, validateResumeId, generateAISuggestionsController);
router.post("/:id/cover-letter", protectRoute, validateResumeId, getCoverLetterController);
router.post("/:id/interview-questions", protectRoute, validateResumeId, getInterviewQuestionsController);

export default router;
