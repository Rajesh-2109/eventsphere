import { Router } from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as c from "../controllers/booking.controller.js";
const r = Router();
r.post("/bookings", protect, asyncHandler(c.createBooking));
r.get("/bookings/mine", protect, asyncHandler(c.myBookings));
r.get("/bookings/:id", protect, asyncHandler(c.getBooking));
r.patch("/bookings/:id/cancel", protect, asyncHandler(c.cancelBooking));
r.get(
  "/events/:id/bookings",
  protect,
  allowRoles("organizer", "admin"),
  asyncHandler(c.eventBookings),
);
r.get(
  "/events/:id/bookings/export",
  protect,
  allowRoles("organizer", "admin"),
  asyncHandler(c.exportBookings),
);
export default r;
