import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../pages/css/AdminDashboard.css";
import { useNavigate, Link } from 'react-router-dom';

const API_BASE = "http://localhost:5002/api/events";
const AUTH_BASE = "http://localhost:5002/api/auth";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  // date removed per new requirements
    price: "",
    originalPrice: "",
    location: "",
    image: null,
    shortDescription: "",
    packages: [],
    addOns: []
  });
  const [packageInput, setPackageInput] = useState({ name: "", price: "", description: "" });
  const [addOnInput, setAddOnInput] = useState({ name: "", price: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  // Quick admin login helper requested
  const quickAdminLogin = async () => {
    try {
      const res = await axios.post(`${AUTH_BASE}/login`, { email: 'admin@event.com', password: 'Admin1234' });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      navigate('/admin');
    } catch (err) {
      console.error('Admin login failed', err);
      alert('Admin login failed');
    }
  };

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

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  useEffect(() => {
    if (!user) return;
    // nothing extra for now
  }, [user]);

  // Quick stats derived from events
  const totalEvents = events.length;
  // upcomingCount removed due to date removal

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

  const handleAddOnChange = (e) => {
    const { name, value } = e.target;
    setAddOnInput({ ...addOnInput, [name]: value });
  };

  const addPackage = () => {
    if (!packageInput.name || !packageInput.price) return;
    setFormData({ ...formData, packages: [...formData.packages, { ...packageInput, price: Number(packageInput.price) }] });
    setPackageInput({ name: "", price: "", description: "" });
  };

  const addAddOn = () => {
    if (!addOnInput.name || !addOnInput.price) return;
    setFormData({ ...formData, addOns: [...formData.addOns, { ...addOnInput, price: Number(addOnInput.price) }] });
    setAddOnInput({ name: "", price: "", description: "" });
  };

  const removePackage = (index) => {
    const newPackages = [...formData.packages];
    newPackages.splice(index, 1);
    setFormData({ ...formData, packages: newPackages });
  };

  const removeAddOn = (index) => {
    const newAddOns = [...formData.addOns];
    newAddOns.splice(index, 1);
    setFormData({ ...formData, addOns: newAddOns });
  };

  // Submit event (create/update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      const payload = { ...formData };
      // fallback originalPrice if blank
      if (!payload.originalPrice) payload.originalPrice = payload.price;
      
      console.log("Submitting packages:", payload.packages);
      console.log("Number of packages:", payload.packages.length);
      
      Object.keys(payload).forEach((key) => {
        if (key === "packages" || key === "addOns") data.append(key, JSON.stringify(payload[key]));
        else if (key === "image") { if (payload.image) data.append(key, payload.image); }
        else data.append(key, payload[key]);
      });

      const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;
      const method = editingId ? "put" : "post";

      const response = await axios({ url, method, data });
      console.log("Event saved:", response.data);
      console.log("Saved packages:", response.data.packages);
      
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
  // date removed
      price: "",
      originalPrice: "",
      location: "",
      image: null,
      shortDescription: "",
      packages: [],
      addOns: []
    });
    setPackageInput({ name: "", price: "", description: "" });
    setAddOnInput({ name: "", price: "", description: "" });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`${API_BASE}/${id}`); setEvents(events.filter((e) => e._id !== id)); } catch (err) { console.error("Error deleting event", err); }
  };

  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      description: event.description,
  // date removed
      price: event.price,
      originalPrice: event.originalPrice || event.price,
      location: event.location,
      image: null,
      shortDescription: event.shortDescription || "",
      packages: event.packages || [],
      addOns: event.addOns || []
    });
    setEditingId(event._id);
    setShowModal(true);
  };

  const discountPercent = formData.originalPrice && formData.price && Number(formData.originalPrice) > Number(formData.price)
    ? Math.round(((Number(formData.originalPrice) - Number(formData.price)) / Number(formData.originalPrice)) * 100)
    : 0;

  // Render
  return (
    <div className="admin-dashboard">
      <h1>Admin Event Management</h1>
      {!user ? (
        <div className="admin-auth-cta">
          <p>You must be an admin to manage events.</p>
          <div className="auth-buttons">
            <button onClick={quickAdminLogin}>Quick Admin Login</button>
            <Link to="/admin/login"><button>Login</button></Link>
            <Link to="/admin/register"><button>Register</button></Link>
          </div>
        </div>
      ) : (
        <>
          <button className="open-modal-btn" onClick={() => setShowModal(true)}>{editingId ? "Edit Event" : "Add Event"}</button>
        </>
      )}

      {/* Overview moved from Event List */}
      {!loading && user && (
        <section className="admin-overview">
          <h2 className="overview-title">Overview</h2>
          <div className="overview-grid">
            <div className="overview-card"><div className="ov-value">{totalEvents}</div><div className="ov-label">Total events</div></div>
          </div>
        </section>
      )}

      {showModal && user && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingId ? "Edit Event" : "Add Event"}</h2>
            <form onSubmit={handleSubmit} className="event-form">
              <input type="text" name="title" placeholder="Event Title" value={formData.title} onChange={handleChange} required />
              <textarea name="description" placeholder="Full Description" value={formData.description} onChange={handleChange} required />
              <textarea name="shortDescription" placeholder="Short Card Description" value={formData.shortDescription} onChange={handleChange} />


              {/* date input removed */}
              <input type="number" name="price" placeholder="Active Price" value={formData.price} onChange={handleChange} required />
              <input type="number" name="originalPrice" placeholder="Original Price (optional)" value={formData.originalPrice} onChange={handleChange} />
              <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} required />
              <input type="file" name="image" accept="image/*" onChange={handleChange} />

              {discountPercent > 0 && (
                <div className="discount-preview">Discount: {discountPercent}% off</div>
              )}

              <div className="package-section">
                <h3>Packages</h3>
                <div className="row-flex">
                  <input type="text" name="name" placeholder="Package Name" value={packageInput.name} onChange={handlePackageChange} />
                  <input type="number" name="price" placeholder="Price" value={packageInput.price} onChange={handlePackageChange} />
                  <input type="text" name="description" placeholder="Description" value={packageInput.description} onChange={handlePackageChange} />
                  <button type="button" className="add-package-btn" onClick={addPackage}>Add</button>
                </div>
                <ul className="package-list">
                  {formData.packages.map((pkg, i) => (
                    <li key={i} className="package-item">
                      <strong>{pkg.name}</strong> - Rs.{pkg.price}
                      {pkg.description && <span className="pkg-desc"> - {pkg.description}</span>}
                      <button type="button" className="remove-btn" onClick={() => removePackage(i)}>Remove</button>
                    </li>
                  ))}
                  {formData.packages.length === 0 && <li className="no-packages">No packages added yet</li>}
                </ul>
              </div>

              <div className="package-section">
                <h3>Add-Ons</h3>
                <div className="row-flex">
                  <input type="text" name="name" placeholder="Add-On Name" value={addOnInput.name} onChange={handleAddOnChange} />
                  <input type="number" name="price" placeholder="Price" value={addOnInput.price} onChange={handleAddOnChange} />
                  <input type="text" name="description" placeholder="Description" value={addOnInput.description} onChange={handleAddOnChange} />
                  <button type="button" className="add-package-btn" onClick={addAddOn}>Add</button>
                </div>
                <ul className="package-list">
                  {formData.addOns.map((addon, i) => (
                    <li key={i}>{addon.name} - Rs.{addon.price} <button type="button" onClick={() => removeAddOn(i)}>Remove</button></li>
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
                <p>{event.shortDescription || event.description?.slice(0,100)}</p>
                <p>Base Price: Rs.{event.price}</p>
                {event.originalPrice && event.originalPrice > event.price && (
                  <p className="card-discount-line"><span className="old">${event.originalPrice}</span> <span className="save">Save {Math.round(((event.originalPrice - event.price)/event.originalPrice)*100)}%</span></p>
                )}
                {/* Date removed */}
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
