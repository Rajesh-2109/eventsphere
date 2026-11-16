import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ok } from "../utils/asyncHandler.js";
const view = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  phone: u.phone,
  avatar: u.avatar,
  isBlocked: u.isBlocked,
});
export async function register(req, res) {
  const { name, email, password, role = "attendee" } = req.body;
  if (!name || name.trim().length < 2 || !email || !password)
    return res.status(400).json({
      success: false,
      message: "Name, email and password are required",
    });
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password))
    return res.status(400).json({
      success: false,
      message: "Password must be 8+ characters with a letter and number",
    });
  if (!["attendee", "organizer"].includes(role))
    return res
      .status(400)
      .json({ success: false, message: "Choose Attendee or Organizer" });
  const em = email.toLowerCase().trim();
  if (await User.exists({ email: em }))
    return res
      .status(409)
      .json({ success: false, message: "Email already registered" });
  const u = await User.create({
    name: name.trim(),
    email: em,
    password: await bcrypt.hash(password, 10),
    role,
  });
  const token = jwt.sign({ id: u._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
  return ok(res, { token, user: view(u) }, "Account created", 201);
}
export async function login(req, res) {
  const u = await User.findOne({
    email: String(req.body.email || "")
      .toLowerCase()
      .trim(),
  }).select("+password");
  if (!u || !(await bcrypt.compare(req.body.password || "", u.password)))
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  if (u.isBlocked)
    return res
      .status(403)
      .json({ success: false, message: "Your account has been blocked" });
  const token = jwt.sign({ id: u._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
  return ok(res, { token, user: view(u) }, "Login successful");
}
export async function me(req, res) {
  return ok(res, req.user);
}
export async function updateMe(req, res) {
  for (const k of ["name", "phone", "avatar"])
    if (req.body[k] !== undefined) req.user[k] = req.body[k];
  if (req.user.name.trim().length < 2)
    return res
      .status(400)
      .json({ success: false, message: "Name must contain 2+ characters" });
  await req.user.save();
  return ok(res, view(req.user), "Profile updated");
}
export async function changePassword(req, res) {
  const u = await User.findById(req.user._id).select("+password");
  if (!(await bcrypt.compare(req.body.currentPassword || "", u.password)))
    return res
      .status(400)
      .json({ success: false, message: "Current password is incorrect" });
  const p = req.body.newPassword || "";
  if (p.length < 8 || !/[A-Za-z]/.test(p) || !/\d/.test(p))
    return res.status(400).json({
      success: false,
      message: "New password must be 8+ characters with a letter and number",
    });
  u.password = await bcrypt.hash(p, 10);
  await u.save();
  return ok(res, null, "Password changed");
}
