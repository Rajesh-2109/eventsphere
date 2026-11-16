import Notification from "../models/Notification.js";
import { ok } from "../utils/asyncHandler.js";
export async function list(req, res) {
  return ok(
    res,
    await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50),
  );
}
export async function readAll(req, res) {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { $set: { isRead: true } },
  );
  return ok(res, null, "Notifications marked read");
}
