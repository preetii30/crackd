import ResumeReport from "../models/resumeReport.model.js";
import { uploadResumeMiddleware, deleteUploadedFile } from "../utils/fileStorage.js";
import {
  extractResumeText,
  analyzeResumeText,
  generateAISuggestions,
  generateCoverLetter,
  generateInterviewQuestions,
} from "../services/gemini.service.js";

const hasValidAnalysis = (analysis) => {
  return (
    analysis &&
    typeof analysis.finalSummary === "string" &&
    analysis.finalSummary.trim().length > 0
  );
};

const ensureReportAnalysis = async (report) => {
  if (hasValidAnalysis(report.analysis)) {
    return report.analysis;
  }

  if (!report.extractedText) {
    throw new Error("Resume analysis is not available yet. Please wait for the analysis to finish.");
  }

  const analysis = await analyzeResumeText(report.extractedText);
  await ResumeReport.findByIdAndUpdate(
    report._id,
    {
      analysis,
      status: "analyzed",
      analyzedAt: new Date(),
      failureReason: "",
    },
    { returnDocument: "after" }
  );

  return analysis;
};

export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a PDF resume file." });
    }

    let report;
    try {
      // Create database entry
      report = await ResumeReport.create({
        userId: req.user._id,
        originalName: req.file.originalname,
        fileName: req.file.filename,
        filePath: req.file.path,
        fileUrl: "",
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        status: "uploaded",
      });
    } catch (dbError) {
      // FIX 1: Agar DB save fail ho jaye, to storage se file delete karo taaki server par trash na badhe
      await deleteUploadedFile(req.file.path).catch((err) => 
        console.error("Failed to delete orphaned file:", err.message)
      );
      return next(dbError);
    }

    // Client ko output turant send karo bina response block kiye
    res.status(201).json({
      message: "Resume uploaded successfully. Analysis is starting.",
      report,
    });

    // Background task ko call karein aur handle karein
    analyzeResumeReport(report._id).catch((err) => {
      console.error(`[Background Task Error] Failed to initiate analysis for ${report._id}:`, err.message);
    });

  } catch (error) {
    next(error);
  }
};

const analyzeResumeReport = async (reportId) => {
  try {
    // FIX 2: { new: true } ko { returnDocument: 'after' } se badla deprecation warning hatane ke liye
    const report = await ResumeReport.findByIdAndUpdate(
      reportId,
      { status: "analyzing" },
      { returnDocument: 'after' } 
    );

    if (!report) {
      console.warn(`[ResumeAnalyzer] Resume report ${reportId} no longer exists. Skipping analysis.`);
      return;
    }

    // Gemini Integration call
    const extractedText = await extractResumeText(report.filePath);
    const analysis = await analyzeResumeText(extractedText);

    // Final entry data update karo
    const updatedReport = await ResumeReport.findByIdAndUpdate(
      reportId,
      {
        extractedText,
        analysis,
        status: "analyzed",
        analyzedAt: new Date(),
        failureReason: "",
      },
      { returnDocument: 'after' }
    );

    if (!updatedReport) {
      console.warn(`[ResumeAnalyzer] Resume report ${reportId} was deleted before final save.`);
    }
  } catch (error) {
    console.error(`[ResumeAnalyzer] Analysis failed for report ${reportId}:`, error);
    
    await ResumeReport.findByIdAndUpdate(
      reportId,
      {
        status: "failed",
        failureReason: error.message,
        analyzedAt: new Date(),
      }
    ).catch((dbErr) =>
      console.error(`[ResumeAnalyzer] Failed to mark report ${reportId} as failed:`, dbErr.message)
    );
  }
};

export const getAnalysisHistory = async (req, res, next) => {
  try {
    const { search = "", sort = "desc" } = req.query;
    const query = { userId: req.user._id };

    if (search) {
      query.originalName = { $regex: search, $options: "i" };
    }

    const reports = await ResumeReport.find(query)
      .sort({ uploadedAt: sort === "asc" ? 1 : -1 })
      .lean();

    res.status(200).json({ reports });
  } catch (error) {
    next(error);
  }
};

export const getSingleReport = async (req, res, next) => {
  try {
    const report = await ResumeReport.findOne({ _id: req.params.id, userId: req.user._id }).lean();
    if (!report) {
      return res.status(404).json({ message: "Resume report not found." });
    }

    res.status(200).json({ report });
  } catch (error) {
    next(error);
  }
};

export const downloadReport = async (req, res, next) => {
  try {
    const report = await ResumeReport.findOne({ _id: req.params.id, userId: req.user._id });
    if (!report) {
      return res.status(404).json({ message: "Resume report not found." });
    }

    if (!report.filePath) {
      return res.status(404).json({ message: "Resume file is unavailable." });
    }

    return res.download(report.filePath, report.originalName, (err) => {
      if (err) {
        next(err);
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReport = async (req, res, next) => {
  try {
    const report = await ResumeReport.findOne({ _id: req.params.id, userId: req.user._id });
    if (!report) {
      return res.status(404).json({ message: "Resume report not found." });
    }

    // Pehle physical storage file delete karein fir database se document remove karein
    await deleteUploadedFile(report.filePath);
    await report.deleteOne();

    res.status(200).json({ message: "Resume report deleted successfully." });
  } catch (error) {
    next(error);
  }
};

export const generateAISuggestionsController = async (req, res, next) => {
  try {
    const report = await ResumeReport.findOne({ _id: req.params.id, userId: req.user._id });
    if (!report) {
      return res.status(404).json({ message: "Resume report not found." });
    }

    if (!report.extractedText) {
      return res.status(400).json({ message: "Resume extraction is not available yet. Please wait for the analysis to finish." });
    }

    const analysis = await ensureReportAnalysis(report);
    const aiSuggestions = await generateAISuggestions(report.extractedText, analysis);
    const updatedReport = await ResumeReport.findByIdAndUpdate(
      req.params.id,
      {
        aiSuggestions: {
          ...aiSuggestions,
          generatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    res.status(200).json({
      message: "AI suggestions generated successfully.",
      aiSuggestions: updatedReport?.aiSuggestions || aiSuggestions,
    });
  } catch (error) {
    next(error);
  }
};

export const getCoverLetterController = async (req, res, next) => {
  try {
    const report = await ResumeReport.findOne({ _id: req.params.id, userId: req.user._id });
    if (!report) {
      return res.status(404).json({ message: "Resume report not found." });
    }

    if (!report.extractedText) {
      return res.status(400).json({ message: "Resume extraction is not available yet. Please wait for the analysis to finish." });
    }

    const analysis = await ensureReportAnalysis(report);
    const coverLetter = await generateCoverLetter(report.extractedText, analysis, req.body?.jobDescription || "");
    const updatedReport = await ResumeReport.findByIdAndUpdate(
      req.params.id,
      {
        coverLetters: [
          {
            ...coverLetter,
            jobDescription: req.body?.jobDescription || "",
            generatedAt: new Date(),
          },
        ],
      },
      { returnDocument: "after" }
    );

    res.status(200).json({
      message: "Cover letter generated successfully.",
      coverLetter: updatedReport?.coverLetters?.[0] || coverLetter,
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewQuestionsController = async (req, res, next) => {
  try {
    const report = await ResumeReport.findOne({ _id: req.params.id, userId: req.user._id });
    if (!report) {
      return res.status(404).json({ message: "Resume report not found." });
    }

    if (!report.extractedText) {
      return res.status(400).json({ message: "Resume extraction is not available yet. Please wait for the analysis to finish." });
    }

    const analysis = await ensureReportAnalysis(report);
    const interviewQuestions = await generateInterviewQuestions(report.extractedText, analysis);
    const updatedReport = await ResumeReport.findByIdAndUpdate(
      req.params.id,
      {
        interviewQuestions: {
          ...interviewQuestions,
          generatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    res.status(200).json({
      message: "Interview questions generated successfully.",
      interviewQuestions: updatedReport?.interviewQuestions || interviewQuestions,
    });
  } catch (error) {
    next(error);
  }
};