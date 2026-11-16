import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { updateMe, changePassword } from "../controllers/auth.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const r = Router();
r.put("/me", protect, asyncHandler(updateMe));
r.put("/me/password", protect, asyncHandler(changePassword));
export default r;
