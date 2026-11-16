import mongoose from "mongoose";
const s = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: ["admin", "organizer", "attendee"],
      default: "attendee",
    },
    phone: { type: String, default: "" },
    avatar: { type: String, default: "" },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true },
);
s.index({ name: "text", email: "text" });
export default mongoose.model("User", s);
