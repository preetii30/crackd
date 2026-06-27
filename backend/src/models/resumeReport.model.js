import mongoose from "mongoose";

const resumeReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      default: "",
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: "application/pdf",
    },
    status: {
      type: String,
      enum: ["uploaded", "analyzing", "analyzed", "failed"],
      default: "uploaded",
    },
    extractedText: {
      type: String,
      default: "",
    },
    analysis: {
      overallScore: { type: Number, default: 0 },
      atsScore: { type: Number, default: 0 },
      grammarScore: { type: Number, default: 0 },
      formattingScore: { type: Number, default: 0 },
      technicalSkillsScore: { type: Number, default: 0 },
      projectsScore: { type: Number, default: 0 },
      experienceScore: { type: Number, default: 0 },
      educationScore: { type: Number, default: 0 },
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      missingKeywords: [{ type: String }],
      missingTechnicalSkills: [{ type: String }],
      suggestedCertifications: [{ type: String }],
      suggestedProjects: [{ type: String }],
      suggestedImprovements: [{ type: String }],
      topPriorityImprovements: [{ type: String }],
      finalSummary: { type: String, default: "" },
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    analyzedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const ResumeReport = mongoose.model("ResumeReport", resumeReportSchema);

export default ResumeReport;
