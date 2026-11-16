import jwt from "jsonwebtoken";
import User from "../models/User.js";
export async function protect(req, res, next) {
  try {
    const h = req.headers.authorization || "",
      token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    const p = jwt.verify(token, process.env.JWT_SECRET);
    const u = await User.findById(p.id).select("-password");
    if (!u || u.isBlocked)
      return res
        .status(401)
        .json({ success: false, message: "Account unavailable" });
    req.user = u;
    next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
}
export const allowRoles =
  (...roles) =>
  (req, res, next) =>
    !req.user || !roles.includes(req.user.role)
      ? res
          .status(403)
          .json({ success: false, message: "Forbidden: insufficient role" })
      : next();
