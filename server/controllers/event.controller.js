import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import { ok } from "../utils/asyncHandler.js";
import { notify, notifyMany } from "../utils/notify.js";
const cats = [
  "Music",
  "Tech",
  "Sports",
  "Education",
  "Business",
  "Arts",
  "Food",
  "Other",
];
function bad(message) {
  const e = new Error(message);
  e.statusCode = 400;
  throw e;
}
function check(b) {
  if (!b.title || b.title.trim().length < 3 || b.title.length > 100)
    bad("Title must be 3–100 characters");
  if (!b.description || b.description.length > 3000)
    bad("Description is required (max 3000 characters)");
  if (!cats.includes(b.category)) bad("Invalid category");
  const s = new Date(b.startDate),
    e = new Date(b.endDate);
  if (!Number.isFinite(+s) || s <= new Date())
    bad("Event start must be in the future");
  if (!Number.isFinite(+e) || e <= s) bad("End date must be after start");
  if (!b.venue || !b.city) bad("Venue and city are required");
  if (!Array.isArray(b.tickets) || b.tickets.length < 1 || b.tickets.length > 5)
    bad("Add 1–5 ticket types");
  for (const t of b.tickets)
    if (
      !t.name ||
      Number(t.price) < 0 ||
      !Number.isInteger(Number(t.total)) ||
      Number(t.total) < 1
    )
      bad("Ticket name, price >= 0 and quantity >= 1 are required");
}
const parse = (req) => {
  const b = { ...req.body };
  if (typeof b.tickets === "string") b.tickets = JSON.parse(b.tickets);
  return b;
};
export async function listEvents(req, res) {
  const {
    q,
    category,
    city,
    from,
    to,
    price,
    sort = "date",
    page = 1,
    limit = 9,
  } = req.query;
  const f = { status: "approved", startDate: { $gte: new Date() } };
  if (q) f.$text = { $search: String(q) };
  if (category && category !== "All") f.category = category;
  if (city) f.city = { $regex: String(city), $options: "i" };
  if (from || to) {
    const requestedFrom = from ? new Date(from) : new Date(0);
    f.startDate = {
      $gte: new Date(Math.max(Date.now(), +requestedFrom)),
      ...(to ? { $lte: new Date(to) } : {}),
    };
  }
  if (price === "free") f["tickets.price"] = 0;
  if (price === "paid") f["tickets.price"] = { $gt: 0 };
  const p = Math.max(1, +page || 1),
    l = Math.min(30, Math.max(1, +limit || 9)),
    total = await Event.countDocuments(f);
  let events;
  if (sort === "popular") {
    events = await Event.aggregate([
      { $match: f },
      {
        $addFields: {
          popularity: {
            $sum: {
              $map: {
                input: "$tickets",
                as: "t",
                in: { $subtract: ["$$t.total", "$$t.available"] },
              },
            },
          },
        },
      },
      { $sort: { popularity: -1, startDate: 1 } },
      { $skip: (p - 1) * l },
      { $limit: l },
    ]);
    await Event.populate(events, { path: "organizer", select: "name" });
  } else {
    const sm = {
      date: { startDate: 1 },
      price: { "tickets.price": 1 },
      recent: { createdAt: -1 },
    };
    events = await Event.find(f)
      .populate("organizer", "name")
      .sort(sm[sort] || sm.date)
      .skip((p - 1) * l)
      .limit(l);
  }
  return ok(res, {
    events,
    pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) },
  });
}
export async function getEvent(req, res) {
  const e = await Event.findById(req.params.id).populate(
    "organizer",
    "name avatar",
  );
  if (!e || e.status !== "approved")
    return res.status(404).json({ success: false, message: "Event not found" });
  return ok(res, e);
}
export async function getManagedEvent(req, res) {
  const e = await Event.findById(req.params.id);
  if (!e)
    return res.status(404).json({ success: false, message: "Event not found" });
  if (String(e.organizer) !== String(req.user._id))
    return res.status(403).json({ success: false, message: "Not your event" });
  return ok(res, e);
}
export async function createEvent(req, res) {
  const b = parse(req);
  check(b);
  const tickets = b.tickets.map((t) => ({
    name: t.name,
    price: +t.price,
    total: +t.total,
    available: +t.total,
  }));
  const e = await Event.create({
    ...b,
    tickets,
    banner: req.file ? `/uploads/${req.file.filename}` : b.banner || "",
    organizer: req.user._id,
    status: "pending",
  });
  return ok(res, e, "Submitted for admin approval", 201);
}
export async function updateEvent(req, res) {
  const e = await Event.findById(req.params.id);
  if (!e)
    return res.status(404).json({ success: false, message: "Event not found" });
  if (String(e.organizer) !== String(req.user._id))
    return res.status(403).json({ success: false, message: "Not your event" });
  if (e.status === "cancelled")
    return res
      .status(400)
      .json({ success: false, message: "Cancelled event cannot be edited" });
  const b = parse(req);
  check(b);
  const sold = e.tickets.map((t) => ({
    id: String(t._id),
    n: t.total - t.available,
  }));
  const tickets = b.tickets.map((t) => {
    const old = sold.find((x) => x.id === String(t._id)),
      n = old?.n || 0;
    if (+t.total < n)
      throw Error("Ticket total cannot be below tickets already sold");
    return {
      _id: t._id,
      name: t.name,
      price: +t.price,
      total: +t.total,
      available: +t.total - n,
    };
  });
  const approved = e.status === "approved";
  Object.assign(e, {
    ...b,
    tickets,
    banner: req.file ? `/uploads/${req.file.filename}` : (b.banner ?? e.banner),
  });
  await e.save();
  const users = await Booking.find({
    event: e._id,
    status: "confirmed",
  }).distinct("user");
  if (approved)
    await notifyMany(req.app.get("io"), users, {
      type: "event_update",
      message: `"${e.title}" has been updated by the organizer.`,
      link: `/events/${e._id}`,
    });
  if (approved)
    req.app
      .get("io")
      .to(`event:${e._id}`)
      .emit("event:updated", { eventId: String(e._id) });
  return ok(res, e, "Event updated");
}
export async function cancelEvent(req, res) {
  const e = await Event.findById(req.params.id);
  if (!e)
    return res.status(404).json({ success: false, message: "Event not found" });
  if (String(e.organizer) !== String(req.user._id))
    return res.status(403).json({ success: false, message: "Not your event" });
  if (e.status === "cancelled")
    return res
      .status(400)
      .json({ success: false, message: "Already cancelled" });
  const bs = await Booking.find({ event: e._id, status: "confirmed" });
  e.status = "cancelled";
  for (const t of e.tickets) {
    const sold = bs
      .filter((b) => String(b.ticketTypeId) === String(t._id))
      .reduce((n, b) => n + b.quantity, 0);
    t.available = Math.min(t.total, t.available + sold);
  }
  await e.save();
  await Booking.updateMany(
    { event: e._id, status: "confirmed" },
    { $set: { status: "cancelled" } },
  );
  await notifyMany(
    req.app.get("io"),
    bs.map((b) => b.user),
    {
      type: "event_cancel",
      message: `"${e.title}" was cancelled; your booking is cancelled.`,
      link: "/my-tickets",
    },
  );
  req.app
    .get("io")
    .to(`event:${e._id}`)
    .emit("event:status", { eventId: String(e._id), status: "cancelled" });
  return ok(res, e, "Event and bookings cancelled");
}
export async function deleteEvent(req, res) {
  const e = await Event.findById(req.params.id);
  if (!e)
    return res.status(404).json({ success: false, message: "Event not found" });
  if (String(e.organizer) !== String(req.user._id))
    return res.status(403).json({ success: false, message: "Not your event" });
  if (await Booking.exists({ event: e._id }))
    return res
      .status(409)
      .json({
        success: false,
        message: "Cannot delete an event with bookings",
      });
  await e.deleteOne();
  return ok(res, null, "Event deleted");
}
export async function myEvents(req, res) {
  const es = await Event.find({ organizer: req.user._id }).sort({
      createdAt: -1,
    }),
    ids = es.map((e) => e._id),
    agg = await Booking.aggregate([
      { $match: { event: { $in: ids }, status: "confirmed" } },
      {
        $group: {
          _id: "$event",
          sold: { $sum: "$quantity" },
          revenue: { $sum: "$amount" },
        },
      },
    ]),
    m = new Map(agg.map((x) => [String(x._id), x]));
  return ok(
    res,
    es.map((e) => ({
      ...e.toObject(),
      sold: m.get(String(e._id))?.sold || 0,
      revenue: m.get(String(e._id))?.revenue || 0,
    })),
  );
}
export async function adminPending(req, res) {
  return ok(
    res,
    await Event.find({ status: "pending" })
      .populate("organizer", "name email")
      .sort({ createdAt: 1 }),
  );
}
export async function adminAllEvents(req, res) {
  return ok(
    res,
    await Event.find()
      .populate("organizer", "name email")
      .sort({ createdAt: -1 }),
  );
}
export async function approveEvent(req, res) {
  const e = await Event.findById(req.params.id);
  if (!e)
    return res.status(404).json({ success: false, message: "Event not found" });
  if (e.status !== "pending")
    return res
      .status(400)
      .json({ success: false, message: "Only pending events can be approved" });
  e.status = "approved";
  e.rejectionReason = "";
  await e.save();
  await notify(req.app.get("io"), e.organizer, {
    type: "approval",
    message: `Your event "${e.title}" has been approved.`,
    link: `/events/${e._id}`,
  });
  req.app
    .get("io")
    .to("public:events")
    .emit("event:published", { eventId: String(e._id) });
  return ok(res, e, "Event approved");
}
export async function rejectEvent(req, res) {
  const e = await Event.findById(req.params.id);
  if (!e)
    return res.status(404).json({ success: false, message: "Event not found" });
  const reason = String(req.body.reason || "").trim();
  if (reason.length < 3)
    return res
      .status(400)
      .json({ success: false, message: "Rejection reason required" });
  e.status = "rejected";
  e.rejectionReason = reason;
  await e.save();
  await notify(req.app.get("io"), e.organizer, {
    type: "approval",
    message: `"${e.title}" was rejected: ${reason}`,
    link: "/organizer/dashboard",
  });
  return ok(res, e, "Event rejected");
}
