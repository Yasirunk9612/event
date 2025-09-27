import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../pages/css/EventDetail.css";

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [selectedPackages, setSelectedPackages] = useState([]); // multi-select
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:5002/api/events/${id}`)
      .then((res) => setEvent(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  // Calculate total price when package or add-ons change
  useEffect(() => {
    if (!event) return;
    const base = Number(event.price) || 0; // event base price
    const packagesTotal = selectedPackages.reduce((sum, pkg) => sum + (Number(pkg.price) || 0), 0);
    const addOnTotal = selectedAddOns.reduce((sum, addOn) => sum + (Number(addOn.price) || 0), 0);
    setTotalPrice(base + packagesTotal + addOnTotal);
  }, [event, selectedPackages, selectedAddOns]);

  const handleAddOnToggle = (addOn) => {
    setSelectedAddOns(prev => {
      const exists = prev.find(item => item._id === addOn._id);
      if (exists) {
        return prev.filter(item => item._id !== addOn._id);
      } else {
        return [...prev, addOn];
      }
    });
  };

  const togglePackage = (pkg) => {
    setSelectedPackages(prev => {
      const exists = prev.find(p => p.name === pkg.name && p.price === pkg.price);
      if (exists) {
        return prev.filter(p => !(p.name === pkg.name && p.price === pkg.price));
      }
      return [...prev, pkg];
    });
  };

  const handleBooking = () => {
    if (!selectedPackages.length) {
      alert("Please select at least one package (or add one) to continue.");
      return;
    }
    navigate("/booking", {
      state: {
        event,
        packages: selectedPackages,
        addOns: selectedAddOns,
        totalPrice
      }
    });
  };

  if (!event) return <p>Loading...</p>;

  // Add-ons list (no categories grouping needed per simplified requirements)
  const addOnsList = event.addOns || [];

  return (
    <div className="event-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">← Back</button>
      
      <div className="event-header">
        <div className="event-info">
          <h1>{event.title}</h1>
          <div className="event-meta">
            <p><strong>📅 Date:</strong> {new Date(event.date).toDateString()}</p>
            <p><strong>📍 Location:</strong> {event.location}</p>
            <p><strong>🎯 Type:</strong> {event.type}</p>
            <div className="luxury-badge-container">
              <span className={`luxury-badge luxury-${event.luxuryCategory?.toLowerCase().replace(' ', '-') || 'normal'}`}>
                {event.luxuryCategory || 'Normal'}
              </span>
            </div>
          </div>
        </div>
        {event.image && (
          <div className="event-image-container">
            <img src={`http://localhost:5002${event.image}`} alt={event.title} className="event-detail-image" />
          </div>
        )}
      </div>
      
      <p className="event-description">{event.description}</p>

      <div className="packages-section">
        <h2>Packages (Select multiple)</h2>
        {event.packages && event.packages.length > 0 ? (
          <ul className="multi-packages">
            {event.packages.map((pkg, idx) => {
              const checked = selectedPackages.some(p => p.name === pkg.name && p.price === pkg.price);
              return (
                <li key={idx} className={checked ? 'pkg-selected' : ''}>
                  <input
                    type="checkbox"
                    value={pkg.name}
                    checked={checked}
                    onChange={() => togglePackage(pkg)}
                    id={`pkg-${idx}`}
                  />
                  <label htmlFor={`pkg-${idx}`}>
                    <span className="pkg-header">
                      <strong>{pkg.name}</strong>
                      <span className="pkg-price-badge">Rs.{pkg.price}</span>
                    </span>
                    <span className="pkg-desc">{pkg.description}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        ) : (<p>No packages available.</p>)}
        <div className="base-price-note">Event Base Price: <strong>Rs.{event.price}</strong></div>
      </div>

      {/* Add-ons Section */}
      {addOnsList.length > 0 && (
        <div className="addons-section">
          <h2>Add-ons</h2>
          <p className="addons-subtitle">Select extra options to increase value</p>
          <div className="addon-grid">
            {addOnsList.map((addOn, idx) => (
              <div key={addOn._id || idx} className="addon-item">
                <label className="addon-label">
                  <input
                    type="checkbox"
                    checked={selectedAddOns.some(item => item._id === addOn._id)}
                    onChange={() => handleAddOnToggle(addOn)}
                    className="addon-checkbox"
                  />
                  <div className="addon-content">
                    <div className="addon-header">
                      <span className="addon-name">{addOn.name}</span>
                      <span className="addon-price">+Rs.{addOn.price}</span>
                    </div>
                    {addOn.description && (
                      <p className="addon-description">{addOn.description}</p>
                    )}
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Summary */}
      {selectedPackages.length > 0 && (
        <div className="price-summary">
          <h3>Price Breakdown</h3>
          {event.originalPrice && event.originalPrice > event.price && (
            <div className="price-item">
              <span>Original Event Price</span>
              <span className="original-price">Rs.{event.originalPrice}</span>
            </div>
          )}
          {event.originalPrice && event.originalPrice > event.price && (
            <div className="price-item">
              <span>Discount</span>
              <span className="discount-value">-
                {Math.round(((event.originalPrice - event.price) / event.originalPrice) * 100)}%
              </span>
            </div>
          )}
          <div className="price-item">
            <span>Event Base Price</span>
            <span>Rs.{event.price}</span>
          </div>
          {selectedPackages.map((pkg, idx) => (
            <div key={idx} className="price-item package-line">
              <span>Package: {pkg.name}</span>
              <span>+Rs.{pkg.price}</span>
            </div>
          ))}
          {selectedAddOns.map((addOn, idx) => (
            <div key={addOn._id || idx} className="price-item addon-price-item">
              <span>{addOn.name}</span>
              <span>+Rs.{addOn.price}</span>
            </div>
          ))}
          <div className="price-item total-price">
            <span><strong>Total Price</strong></span>
            <span><strong>Rs.{totalPrice}</strong></span>
          </div>
        </div>
      )}

      <button
        className="book-btn"
        onClick={handleBooking}
        disabled={!selectedPackages.length}
        aria-disabled={!selectedPackages.length}
      >
        Book Now - Rs.{totalPrice || 0}
      </button>
    </div>
  );
};

export default EventDetail;
