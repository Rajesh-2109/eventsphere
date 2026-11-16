import { Router } from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import { bannerUpload } from "../middleware/upload.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as c from "../controllers/event.controller.js";
const r = Router();
r.get("/events", asyncHandler(c.listEvents));
r.get(
  "/events/mine",
  protect,
  allowRoles("organizer"),
  asyncHandler(c.myEvents),
);
r.get(
  "/events/:id/manage",
  protect,
  allowRoles("organizer"),
  asyncHandler(c.getManagedEvent),
);
r.get("/events/:id", asyncHandler(c.getEvent));
r.post(
  "/events",
  protect,
  allowRoles("organizer"),
  bannerUpload.single("banner"),
  asyncHandler(c.createEvent),
);
r.put(
  "/events/:id",
  protect,
  allowRoles("organizer"),
  bannerUpload.single("banner"),
  asyncHandler(c.updateEvent),
);
r.patch(
  "/events/:id/cancel",
  protect,
  allowRoles("organizer"),
  asyncHandler(c.cancelEvent),
);
r.delete(
  "/events/:id",
  protect,
  allowRoles("organizer"),
  asyncHandler(c.deleteEvent),
);
export default r;
