import Booking from "../models/Booking.js";
import Event from "../models/Event.js";

// Create booking
export const createBooking = async (req, res) => {
  try {
    const { eventId, packageName, user, attendees } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const selectedPackage = event.packages.find(p => p.name === packageName);
    if (!selectedPackage)
      return res.status(400).json({ message: "Package not found for this event" });

    const totalPrice = selectedPackage.price * (attendees || 1);

    const booking = new Booking({
      event: event._id,
      package: selectedPackage,
      user,
      attendees: attendees || 1,
      totalPrice,
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all bookings
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("event");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
