import { Router } from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as e from "../controllers/event.controller.js";
import * as a from "../controllers/admin.controller.js";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
const r = Router(),
  admin = [protect, allowRoles("admin")];
r.get("/admin/users", ...admin, asyncHandler(a.users));
r.patch("/admin/users/:id/block", ...admin, asyncHandler(a.blockUser));
r.get("/admin/events/pending", ...admin, asyncHandler(e.adminPending));
r.get("/admin/events", ...admin, asyncHandler(e.adminAllEvents));
r.patch("/admin/events/:id/approve", ...admin, asyncHandler(e.approveEvent));
r.patch("/admin/events/:id/reject", ...admin, asyncHandler(e.rejectEvent));
r.get("/admin/stats", ...admin, asyncHandler(a.stats));
r.delete(
  "/admin/events/:id",
  ...admin,
  asyncHandler(async (req, res) => {
    const ev = await Event.findById(req.params.id);
    if (!ev)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    if (await Booking.exists({ event: ev._id }))
      return res
        .status(409)
        .json({ success: false, message: "Cannot remove event with bookings" });
    await ev.deleteOne();
    res.json({ success: true, data: null, message: "Event removed" });
  }),
);
export default r;
