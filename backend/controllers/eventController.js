import Event from "../models/Event.js";

// Create new event (with packages)
export const createEvent = async (req, res) => {
  try {
    const { title, description, type, date, price, location, packages } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const event = new Event({
      title,
      description,
      type,
      date,
      price,
      location,
      image,
      packages: packages ? JSON.parse(packages) : [], // parse packages JSON
    });

    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get event by ID
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update event (with packages)
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const { title, description, type, date, price, location, packages } = req.body;

    if (title) event.title = title;
    if (description) event.description = description;
    if (type) event.type = type;
    if (date) event.date = date;
    if (price) event.price = price;
    if (location) event.location = location;
    if (req.file) event.image = `/uploads/${req.file.filename}`;

    if (packages) {
      event.packages = JSON.parse(packages); // replace packages array
    }

    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a package to an existing event
export const addPackageToEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, price, description } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.packages.push({ name, price, description });
    await event.save();

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
