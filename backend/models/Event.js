/*import mongoose from "mongoose";

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },        // Package name, e.g., Basic, VIP
  price: { type: Number, required: true },
  description: { type: String },
});

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
  type: String,
  enum: [
    "workshop",
    "conference",
    "seminar",
    "webinar",
    "music",
    "dance",
    "theatre",
    "concert",
    "festival",
    "comedy",
    "entertainment"
  ],
  required: true,
},

    date: { type: Date, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    image: { type: String },
    packages: [packageSchema], // Event packages
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
*/


import mongoose from "mongoose";

// Minimal add-on schema (only what user requested: name, price, description)
const addOnSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
});

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Package name, e.g., Basic, VIP
  price: { type: Number, required: true },
  description: { type: String },
});

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      required: true, // now admin can set any category
    },
    luxuryCategory: {
      type: String,
      enum: ["Normal", "Luxury", "Full Luxury"],
      required: true,
      default: "Normal"
    },
    date: { type: Date, required: true },
    price: { type: Number, required: true }, // Current / active price
    originalPrice: { type: Number }, // Shown as struck through if > price
    location: { type: String, required: true },
    image: { type: String },
    packages: [packageSchema], // Event packages
    addOns: [addOnSchema], // Available add-on options (simple list)
    shortDescription: { type: String }, // For card display
  },
  { timestamps: true }
);

// Ensure originalPrice defaults to price if not set
eventSchema.pre("save", function(next) {
  if (!this.originalPrice) {
    this.originalPrice = this.price;
  }
  next();
});

export default mongoose.model("Event", eventSchema);
