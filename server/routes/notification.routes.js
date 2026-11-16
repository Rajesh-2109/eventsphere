import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as c from "../controllers/notification.controller.js";
const r = Router();
r.get("/notifications", protect, asyncHandler(c.list));
r.patch("/notifications/read-all", protect, asyncHandler(c.readAll));
export default r;
