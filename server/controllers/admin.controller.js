import User from "../models/User.js";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import { ok } from "../utils/asyncHandler.js";
export async function users(req, res) {
  const q = String(req.query.q || ""),
    f = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
          ],
        }
      : {};
  return ok(
    res,
    await User.find(f).select("-password").sort({ createdAt: -1 }).limit(200),
  );
}
export async function blockUser(req, res) {
  if (String(req.user._id) === String(req.params.id))
    return res
      .status(400)
      .json({ success: false, message: "Cannot block your own admin account" });
  const u = await User.findById(req.params.id);
  if (!u)
    return res.status(404).json({ success: false, message: "User not found" });
  if (u.role === "admin")
    return res
      .status(400)
      .json({ success: false, message: "Admin cannot be blocked here" });
  u.isBlocked = Boolean(req.body.blocked);
  await u.save();
  return ok(
    res,
    { _id: u._id, isBlocked: u.isBlocked },
    u.isBlocked ? "User blocked" : "User unblocked",
  );
}
export async function stats(req, res) {
  const [users, events, bookings, eventStatuses, revenue, monthly] =
    await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Booking.countDocuments({ status: "confirmed" }),
      Event.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Booking.aggregate([
        { $match: { status: "confirmed", paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Booking.aggregate([
        { $match: { status: "confirmed" } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            bookings: { $sum: 1 },
            revenue: { $sum: "$amount" },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ]),
    ]);
  return ok(res, {
    users,
    events,
    bookings,
    revenue: revenue[0]?.total || 0,
    eventStatuses,
    monthly,
  });
}
export async function organizerStats(req, res) {
  const es = await Event.find({ organizer: req.user._id }).select(
      "_id title status startDate",
    ),
    ids = es.map((e) => e._id);
  const [a, monthly, c] = await Promise.all([
    Booking.aggregate([
      { $match: { event: { $in: ids }, status: "confirmed" } },
      {
        $group: {
          _id: null,
          tickets: { $sum: "$quantity" },
          revenue: { $sum: "$amount" },
          bookings: { $sum: 1 },
        },
      },
    ]),
    Booking.aggregate([
      { $match: { event: { $in: ids }, status: "confirmed" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          bookings: { $sum: 1 },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]),
    Booking.aggregate([
      { $match: { event: { $in: ids }, status: "confirmed" } },
      {
        $group: {
          _id: null,
          sold: { $sum: "$quantity" },
          checked: { $sum: { $cond: ["$checkedIn", "$quantity", 0] } },
        },
      },
    ]),
  ]);
  return ok(res, {
    totalEvents: es.length,
    ...(a[0] || { tickets: 0, revenue: 0, bookings: 0 }),
    events: es,
    monthly,
    checkin: c[0] || { sold: 0, checked: 0 },
  });
}
