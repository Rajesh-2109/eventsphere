import Booking from "../models/Booking.js";
import Event from "../models/Event.js";
import { verifyBookingToken } from "../utils/qr.js";
import { ok } from "../utils/asyncHandler.js";
export async function scan(req, res) {
  const d = verifyBookingToken(req.body.token);
  if (!d)
    return res
      .status(400)
      .json({ success: false, message: "Invalid or forged QR code" });
  return perform(req, res, d.bookingId, d.eventId);
}
export async function manual(req, res) {
  const b = await Booking.findOne({
    bookingCode: String(req.body.bookingCode || "")
      .trim()
      .toUpperCase(),
  });
  if (!b)
    return res
      .status(404)
      .json({ success: false, message: "Booking code not found" });
  return perform(req, res, String(b._id), String(req.body.eventId || ""));
}
async function perform(req, res, bid, eid) {
  const e = await Event.findById(eid);
  if (!e)
    return res.status(404).json({ success: false, message: "Event not found" });
  if (String(e.organizer) !== String(req.user._id) && req.user.role !== "admin")
    return res.status(403).json({ success: false, message: "Not your event" });
  const b = await Booking.findOneAndUpdate(
    { _id: bid, event: eid, status: "confirmed", checkedIn: false },
    { $set: { checkedIn: true, checkedInAt: new Date() } },
    { new: true },
  );
  if (!b) {
    const old = await Booking.findById(bid);
    if (!old)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    if (String(old.event) !== String(eid))
      return res
        .status(400)
        .json({ success: false, message: "Ticket belongs to another event" });
    if (old.status !== "confirmed")
      return res
        .status(400)
        .json({ success: false, message: "Booking cancelled or inactive" });
    if (old.checkedIn)
      return res
        .status(409)
        .json({ success: false, message: "Already checked in" });
    return res.status(409).json({ success: false, message: "Check-in failed" });
  }
  const [sold, checked] = await Promise.all([
    Booking.aggregate([
      { $match: { event: e._id, status: "confirmed" } },
      { $group: { _id: null, n: { $sum: "$quantity" } } },
    ]),
    Booking.aggregate([
      { $match: { event: e._id, status: "confirmed", checkedIn: true } },
      { $group: { _id: null, n: { $sum: "$quantity" } } },
    ]),
  ]);
  const progress = {
    eventId: String(e._id),
    checkedIn: checked[0]?.n || 0,
    totalSold: sold[0]?.n || 0,
  };
  req.app.get("io").to(`event:${e._id}`).emit("checkin:update", progress);
  return ok(res, { booking: b, progress }, "Check-in successful");
}
