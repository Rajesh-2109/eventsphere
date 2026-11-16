import mongoose from "mongoose";
const s = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["booking", "event_update", "event_cancel", "approval", "system"],
      default: "system",
    },
    message: { type: String, required: true },
    link: { type: String, default: "" },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);
export default mongoose.model("Notification", s);
