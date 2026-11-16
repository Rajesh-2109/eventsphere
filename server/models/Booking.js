import mongoose from "mongoose";
const s = new mongoose.Schema(
  {
    bookingCode: { type: String, unique: true, index: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    ticketTypeId: { type: mongoose.Schema.Types.ObjectId, required: true },
    ticketTypeName: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, max: 10 },
    amount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "paid",
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
    qrCode: { type: String, default: "" },
    qrToken: { type: String, select: false },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date, default: null },
  },
  { timestamps: true },
);
s.index({ user: 1, createdAt: -1 });
s.index({ event: 1, status: 1 });
export default mongoose.model("Booking", s);
