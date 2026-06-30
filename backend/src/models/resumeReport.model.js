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
      analysisSource: { type: String, default: "" },
    },
    failureReason: {
      type: String,
      default: "",
    },
    aiSuggestions: {
      sections: [
        {
          title: String,
          suggestions: [String],
          priority: { type: String, enum: ["high", "medium", "low"] },
        },
      ],
      quickWins: [String],
      longTermStrategy: String,
      estimatedImpact: String,
      generatedAt: Date,
    },
    coverLetters: [
      {
        letterContent: String,
        sections: {
          opening: String,
          bodyHighlights: [String],
          closing: String,
        },
        tone: String,
        jobDescription: String,
        generatedAt: Date,
      },
    ],
    interviewQuestions: {
      technicalQuestions: [
        {
          question: String,
          difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"] },
          topic: String,
        },
      ],
      projectQuestions: [
        {
          question: String,
          expectedAnswer: String,
        },
      ],
      systemDesignQuestions: [
        {
          question: String,
          complexity: { type: String, enum: ["easy", "medium", "hard"] },
        },
      ],
      behavioralQuestions: [
        {
          question: String,
          relatedTo: String,
        },
      ],
      generatedAt: Date,
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
