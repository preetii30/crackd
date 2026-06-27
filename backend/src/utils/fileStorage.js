import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDirectory = path.resolve(__dirname, "../../uploads");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDirectory),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }

    cb(null, true);
  },
});

export const uploadResumeMiddleware = (req, res, next) => {
  if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
  }

  upload.single("resume")(req, res, (error) => {
    if (error?.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "File size must be less than 5MB." });
    }

    if (error) {
      return res.status(400).json({ message: error.message || "Unable to upload file." });
    }

    next();
  });
};

export const deleteUploadedFile = async (filePath) => {
  if (!filePath) {
    return;
  }

  try {
    await fs.promises.access(filePath);
    await fs.promises.unlink(filePath);
  } catch (_error) {
    // Ignore missing file errors.
  }
};

export default uploadDirectory;
