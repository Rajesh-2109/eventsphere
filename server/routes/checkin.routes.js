import { Router } from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as c from "../controllers/checkin.controller.js";
const r = Router();
r.post(
  "/checkin/scan",
  protect,
  allowRoles("organizer", "admin"),
  asyncHandler(c.scan),
);
r.post(
  "/checkin/manual",
  protect,
  allowRoles("organizer", "admin"),
  asyncHandler(c.manual),
);
export default r;
