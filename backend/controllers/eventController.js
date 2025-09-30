import Event from "../models/Event.js";

// Create new event (with packages and add-ons)
export const createEvent = async (req, res) => {
  try {
    const { title, description, type, price, originalPrice, location, packages, addOns, shortDescription } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const event = new Event({
      title,
      description,
      type,
      price,
      originalPrice: originalPrice || price,
      location,
      image,
      packages: packages ? JSON.parse(packages) : [],
      addOns: addOns ? JSON.parse(addOns) : [],
      shortDescription,
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

// Update event (with packages and add-ons)
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const { title, description, type, price, originalPrice, location, packages, addOns, shortDescription } = req.body;

    if (title) event.title = title;
    if (description) event.description = description;
    if (type) event.type = type;
    if (price) event.price = price;
    if (originalPrice) event.originalPrice = originalPrice;
    if (location) event.location = location;
    if (shortDescription) event.shortDescription = shortDescription;
    if (req.file) event.image = `/uploads/${req.file.filename}`;

    if (packages) {
      event.packages = JSON.parse(packages);
    }
    if (addOns) event.addOns = JSON.parse(addOns);

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

// Add an add-on to an existing event
export const addAddOnToEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, price, description } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.addOns.push({ name, price, description });
    await event.save();

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


