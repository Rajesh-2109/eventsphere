import crypto from "crypto";
import mongoose from "mongoose";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import { makeQr, signBooking } from "../utils/qr.js";
import { ok } from "../utils/asyncHandler.js";
import { notify } from "../utils/notify.js";
const code = () => `ES-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
export async function createBooking(req, res) {
  const { eventId, ticketTypeId } = req.body,
    qty = Number(req.body.quantity);
  if (
    !mongoose.isValidObjectId(eventId) ||
    !mongoose.isValidObjectId(ticketTypeId)
  )
    return res
      .status(400)
      .json({ success: false, message: "Invalid event or ticket" });
  if (!Number.isInteger(qty) || qty < 1 || qty > 10)
    return res
      .status(400)
      .json({ success: false, message: "Quantity must be 1–10" });
  const initial = await Event.findOne({
    _id: eventId,
    status: "approved",
    startDate: { $gt: new Date() },
  });
  if (!initial)
    return res
      .status(404)
      .json({ success: false, message: "Approved upcoming event not found" });
  if (String(initial.organizer) === String(req.user._id))
    return res
      .status(403)
      .json({ success: false, message: "You cannot book your own event" });
  if (!initial.tickets.id(ticketTypeId))
    return res
      .status(404)
      .json({ success: false, message: "Ticket type not found" });
  const e = await Event.findOneAndUpdate(
    {
      _id: eventId,
      status: "approved",
      startDate: { $gt: new Date() },
      tickets: { $elemMatch: { _id: ticketTypeId, available: { $gte: qty } } },
    },
    { $inc: { "tickets.$.available": -qty } },
    { new: true },
  );
  if (!e)
    return res
      .status(409)
      .json({
        success: false,
        message: "Not enough tickets available; refresh and retry",
      });
  let createdBooking = null;
  try {
    const t = e.tickets.id(ticketTypeId);
    const b = (createdBooking = await Booking.create({
      bookingCode: code(),
      user: req.user._id,
      event: eventId,
      ticketTypeId,
      ticketTypeName: t.name,
      unitPrice: t.price,
      quantity: qty,
      amount: t.price * qty,
      paymentStatus: "paid",
      status: "confirmed",
    }));
    const token = signBooking(String(b._id), String(eventId));
    b.qrToken = token;
    b.qrCode = await makeQr(token);
    await b.save();
    const io = req.app.get("io");
    io.to(`event:${eventId}`).emit("seats:update", {
      eventId: String(eventId),
      ticketTypeId: String(ticketTypeId),
      available: t.available,
    });
    await notify(io, e.organizer, {
      type: "booking",
      message: `New booking: ${qty} ${t.name} ticket(s) for "${e.title}".`,
      link: `/organizer/events/${eventId}/attendees`,
    });
    return ok(res, b, "Booking confirmed", 201);
  } catch (err) {
    if (createdBooking) await Booking.deleteOne({ _id: createdBooking._id });
    await Event.updateOne(
      { _id: eventId, "tickets._id": ticketTypeId },
      { $inc: { "tickets.$.available": qty } },
    );
    throw err;
  }
}
export async function myBookings(req, res) {
  return ok(
    res,
    await Booking.find({ user: req.user._id })
      .populate({
        path: "event",
        populate: { path: "organizer", select: "name" },
      })
      .sort({ createdAt: -1 }),
  );
}
export async function getBooking(req, res) {
  const b = await Booking.findById(req.params.id).populate("event");
  if (!b)
    return res
      .status(404)
      .json({ success: false, message: "Booking not found" });
  if (String(b.user) !== String(req.user._id) && req.user.role !== "admin")
    return res
      .status(403)
      .json({ success: false, message: "Not your booking" });
  return ok(res, b);
}
export async function cancelBooking(req, res) {
  const b = await Booking.findById(req.params.id);
  if (!b)
    return res
      .status(404)
      .json({ success: false, message: "Booking not found" });
  if (String(b.user) !== String(req.user._id))
    return res
      .status(403)
      .json({ success: false, message: "Not your booking" });
  if (b.status !== "confirmed" || b.checkedIn)
    return res
      .status(400)
      .json({
        success: false,
        message: "Booking is inactive or already checked in",
      });
  const e = await Event.findById(b.event);
  if (!e || +e.startDate - Date.now() <= 86400000)
    return res
      .status(400)
      .json({
        success: false,
        message: "Cancellation is allowed only more than 24 hours before event",
      });
  const changed = await Booking.findOneAndUpdate(
    { _id: b._id, status: "confirmed", checkedIn: false },
    { $set: { status: "cancelled" } },
    { new: true },
  );
  if (!changed)
    return res
      .status(409)
      .json({ success: false, message: "Booking already changed" });
  await Event.updateOne(
    { _id: e._id, "tickets._id": b.ticketTypeId },
    { $inc: { "tickets.$.available": b.quantity } },
  );
  const updated = await Event.findById(e._id),
    t = updated.tickets.id(b.ticketTypeId);
  req.app
    .get("io")
    .to(`event:${e._id}`)
    .emit("seats:update", {
      eventId: String(e._id),
      ticketTypeId: String(b.ticketTypeId),
      available: t.available,
    });
  await notify(req.app.get("io"), e.organizer, {
    type: "booking",
    message: `A booking for "${e.title}" was cancelled.`,
    link: `/organizer/events/${e._id}/attendees`,
  });
  return ok(res, changed, "Booking cancelled; seats restored");
}
export async function eventBookings(req, res) {
  const e = await Event.findById(req.params.id);
  if (!e)
    return res.status(404).json({ success: false, message: "Event not found" });
  if (String(e.organizer) !== String(req.user._id) && req.user.role !== "admin")
    return res.status(403).json({ success: false, message: "Not your event" });
  return ok(
    res,
    await Booking.find({ event: e._id, status: "confirmed" })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 }),
  );
}
export async function exportBookings(req, res) {
  const e = await Event.findById(req.params.id);
  if (!e)
    return res.status(404).json({ success: false, message: "Event not found" });
  if (String(e.organizer) !== String(req.user._id) && req.user.role !== "admin")
    return res.status(403).json({ success: false, message: "Not your event" });
  const rows = await Booking.find({
      event: e._id,
      status: "confirmed",
    }).populate("user", "name email"),
    q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`,
    csv = [
      "Booking Code,Attendee,Email,Ticket Type,Quantity,Amount,Checked In,Created At",
      ...rows.map((b) =>
        [
          b.bookingCode,
          b.user?.name,
          b.user?.email,
          b.ticketTypeName,
          b.quantity,
          b.amount,
          b.checkedIn,
          b.createdAt,
        ]
          .map(q)
          .join(","),
      ),
    ].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="attendees-${e._id}.csv"`,
  );
  res.send(csv);
}
