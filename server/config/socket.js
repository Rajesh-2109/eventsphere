import jwt from "jsonwebtoken";
import User from "../models/User.js";
export function attachSocket(io) {
  io.use(async (s, next) => {
    try {
      const token = s.handshake.auth?.token;
      if (!token) {
        s.user = null;
        return next();
      }
      const p = jwt.verify(token, process.env.JWT_SECRET);
      const u = await User.findById(p.id).select("_id role isBlocked");
      if (!u || u.isBlocked) return next(new Error("Account unavailable"));
      s.user = u;
      next();
    } catch {
      next(new Error("Invalid socket token"));
    }
  });
  io.on("connection", (s) => {
    s.join("public:events");
    if (s.user) s.join(`user:${s.user._id}`);
    s.on("event:join", ({ eventId } = {}) => {
      if (typeof eventId === "string" && /^[a-f\d]{24}$/i.test(eventId))
        s.join(`event:${eventId}`);
    });
    s.on("event:leave", ({ eventId } = {}) => {
      if (typeof eventId === "string") s.leave(`event:${eventId}`);
    });
  });
}
