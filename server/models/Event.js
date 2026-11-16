import mongoose from "mongoose";
const t = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 40 },
  price: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 1 },
  available: { type: Number, required: true, min: 0 },
});
const s = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
      trim: true,
    },
    description: { type: String, required: true, maxlength: 3000 },
    category: {
      type: String,
      enum: [
        "Music",
        "Tech",
        "Sports",
        "Education",
        "Business",
        "Arts",
        "Food",
        "Other",
      ],
      required: true,
      index: true,
    },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true },
    venue: { type: String, required: true },
    city: { type: String, required: true, index: true },
    banner: { type: String, default: "" },
    tickets: { type: [t], validate: (v) => v.length >= 1 && v.length <= 5 },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },
    rejectionReason: { type: String, default: "" },
  },
  { timestamps: true },
);
s.index({ title: "text", description: "text" });
s.index({ status: 1, startDate: 1, city: 1, category: 1 });
export default mongoose.model("Event", s);
