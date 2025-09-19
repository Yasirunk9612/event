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
    date: { type: Date, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    image: { type: String },
    packages: [packageSchema], // Event packages
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
