import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    package: {
      name: { type: String, required: true },
      price: { type: Number, required: true },
    },
    user: { type: String, required: true }, // Can be user ID or email
    attendees: { type: Number, default: 1 },
    totalPrice: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
