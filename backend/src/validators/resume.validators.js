import mongoose from "mongoose";

export const validateUploadResume = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload a PDF resume file." });
  }

  if (req.file.mimetype !== "application/pdf") {
    return res.status(400).json({ message: "Only PDF files are allowed." });
  }

  next();
};

export const validateResumeId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid report identifier." });
  }

  next();
};
