import express from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  addPackageToEvent,
  addAddOnToEvent,
} from "../controllers/eventController.js";

const eventRoutes = (upload) => {
  const router = express.Router();

  router.post("/", upload.single("image"), createEvent);
  router.get("/", getEvents);
  router.get("/:id", getEventById);
  router.put("/:id", upload.single("image"), updateEvent);
  router.delete("/:id", deleteEvent);
  router.post("/:eventId/packages", addPackageToEvent);
  router.post("/:eventId/addons", addAddOnToEvent);

  return router;
};

export default eventRoutes;
