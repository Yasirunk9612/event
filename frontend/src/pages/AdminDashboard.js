import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../pages/css/AdminDashboard.css";

const API_BASE = "http://localhost:5002/api/events";

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    date: "",
    price: "",
    location: "",
    image: null,
    packages: [],
  });
  const [packageInput, setPackageInput] = useState({ name: "", price: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch events from backend (optimized)
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE);
      setEvents(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching events", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Quick stats derived from events
  const totalEvents = events.length;
  const upcomingCount = events.filter((e) => new Date(e.date) >= new Date()).length;
  const categoryCount = new Set(events.map((e) => (e.type || "").trim()).filter(Boolean)).size;

  // Form handlers
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") setFormData({ ...formData, image: files[0] });
    else setFormData({ ...formData, [name]: value });
  };

  const handlePackageChange = (e) => {
    const { name, value } = e.target;
    setPackageInput({ ...packageInput, [name]: value });
  };

  const addPackage = () => {
    if (!packageInput.name || !packageInput.price) return;
    setFormData({
      ...formData,
      packages: [...formData.packages, { ...packageInput }],
    });
    setPackageInput({ name: "", price: "", description: "" });
  };

  const removePackage = (index) => {
    const newPackages = [...formData.packages];
    newPackages.splice(index, 1);
    setFormData({ ...formData, packages: newPackages });
  };

  // Submit event (create/update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "packages") data.append(key, JSON.stringify(formData[key]));
        else data.append(key, formData[key]);
      });

      const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;
      const method = editingId ? "put" : "post";

      await axios({ url, method, data });
      await fetchEvents();
      resetForm();
      setShowModal(false);
    } catch (err) {
      console.error("Error submitting event", err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "",
      date: "",
      price: "",
      location: "",
      image: null,
      packages: [],
    });
    setPackageInput({ name: "", price: "", description: "" });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/${id}`);
      setEvents(events.filter((e) => e._id !== id)); // Optimistic delete
    } catch (err) {
      console.error("Error deleting event", err);
    }
  };

  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      description: event.description,
      type: event.type,
      date: event.date.split("T")[0],
      price: event.price,
      location: event.location,
      image: null,
      packages: event.packages || [],
    });
    setEditingId(event._id);
    setShowModal(true);
  };

  // Render
  return (
    <div className="admin-dashboard">
      <h1>Admin Event Management</h1>
      <button className="open-modal-btn" onClick={() => setShowModal(true)}>
        {editingId ? "Edit Event" : "Add Event"}
      </button>

      {/* Overview moved from Event List */}
      {!loading && (
        <section className="admin-overview">
          <h2 className="overview-title">Overview</h2>
          <div className="overview-grid">
            <div className="overview-card"><div className="ov-value">{totalEvents}</div><div className="ov-label">Total events</div></div>
            <div className="overview-card"><div className="ov-value">{upcomingCount}</div><div className="ov-label">Upcoming</div></div>
            <div className="overview-card"><div className="ov-value">{categoryCount}</div><div className="ov-label">Categories</div></div>
          </div>
        </section>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingId ? "Edit Event" : "Add Event"}</h2>
            <form onSubmit={handleSubmit} className="event-form">
              <input type="text" name="title" placeholder="Event Title" value={formData.title} onChange={handleChange} required />
              <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />
              <input type="text" name="type" placeholder="Event Type" value={formData.type} onChange={handleChange} required />
              <input type="date" name="date" value={formData.date} onChange={handleChange} required />
              <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required />
              <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} required />
              <input type="file" name="image" accept="image/*" onChange={handleChange} />

              <div className="package-section">
                <h3>Packages</h3>
                <input type="text" name="name" placeholder="Package Name" value={packageInput.name} onChange={handlePackageChange} />
                <input type="number" name="price" placeholder="Package Price" value={packageInput.price} onChange={handlePackageChange} />
                <input type="text" name="description" placeholder="Package Description" value={packageInput.description} onChange={handlePackageChange} />
                <button type="button" className="add-package-btn" onClick={addPackage}>Add Package</button>
                <ul className="package-list">
                  {formData.packages.map((pkg, i) => (
                    <li key={i}>
                      {pkg.name} - ${pkg.price} <button type="button" onClick={() => removePackage(i)}>Remove</button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="form-actions">
                <button type="submit">{editingId ? "Update Event" : "Add Event"}</button>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="event-list">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="event-card skeleton">
                <div className="skeleton-img"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
              </div>
            ))
          : events.map((event) => (
              <div key={event._id} className="event-card">
                {event.image && <img loading="lazy" src={`http://localhost:5002${event.image}`} alt={event.title} />}
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <p>Type: {event.type}</p>
                <p>Date: {new Date(event.date).toLocaleDateString()}</p>
                <p>Location: {event.location}</p>
                <div className="card-actions">
                  <button onClick={() => handleEdit(event)}>Edit</button>
                  <button onClick={() => handleDelete(event._id)}>Delete</button>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
