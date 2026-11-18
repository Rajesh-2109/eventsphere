import multer from "multer";

// Vercel's filesystem is read-only, so keep the file in memory
// and store it as a data URL (see utils/bannerUrl.js).
export const bannerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_r, f, cb) =>
    ["image/jpeg", "image/png", "image/webp"].includes(f.mimetype)
      ? cb(null, true)
      : cb(new Error("Only JPG, PNG and WEBP images are allowed")),
});
