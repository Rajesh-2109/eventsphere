import multer from "multer";
import path from "path";
import fs from "fs";
const dir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "uploads");
fs.mkdirSync(dir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_r, _f, cb) => cb(null, dir),
  filename: (_r, f, cb) =>
    cb(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(f.originalname).toLowerCase()}`,
    ),
});
export const bannerUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_r, f, cb) =>
    ["image/jpeg", "image/png", "image/webp"].includes(f.mimetype)
      ? cb(null, true)
      : cb(new Error("Only JPG, PNG and WEBP images are allowed")),
});
