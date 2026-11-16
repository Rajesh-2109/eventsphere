import { Router } from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { organizerStats } from "../controllers/admin.controller.js";
const r = Router();
r.get(
  "/organizer/stats",
  protect,
  allowRoles("organizer"),
  asyncHandler(organizerStats),
);
export default r;
