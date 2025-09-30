import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../pages/css/EventDetail.css";

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null); // single select
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:5002/api/events/${id}`)
      .then((res) => setEvent(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  // Compute total: selected package price + add-ons
  useEffect(() => {
    if (!event) return;
    const pkgPrice = selectedPackage ? Number(selectedPackage.price) || 0 : 0;
    const addOnTotal = selectedAddOns.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
    setTotalPrice(pkgPrice + addOnTotal);
  }, [event, selectedPackage, selectedAddOns]);

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

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handleBooking = () => {
    if (!selectedPackage) { alert("Select a package to continue."); return; }
    navigate("/booking", {
      state: {
        event,
        package: selectedPackage,
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
        <h1>{event.title}</h1>
        {event.image && (
          <div className="event-image-container">
            <img src={`http://localhost:5002${event.image}`} alt={event.title} className="event-detail-image" />
          </div>
        )}
      </div>
      
      <p className="event-description">{event.description}</p>

      <div className="packages-section">
        <h2>Packages</h2>
        {event.packages && event.packages.length > 0 ? (
          <ul className="single-packages">
            {event.packages.map((pkg, idx) => {
              const checked = selectedPackage && selectedPackage.name === pkg.name;
              return (
                <li key={idx} className={checked ? 'pkg-selected' : ''}>
                  <label htmlFor={`pkg-${idx}`} className="pkg-radio">
                    <input
                      type="radio"
                      name="package"
                      id={`pkg-${idx}`}
                      checked={checked}
                      onChange={() => handlePackageSelect(pkg)}
                    />
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
      {selectedPackage && (
        <div className="price-summary">
          <h3>Price Breakdown</h3>
          <div className="price-item package-line">
            <span>Package: {selectedPackage.name}</span>
            <span>Rs.{selectedPackage.price}</span>
          </div>
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
        disabled={!selectedPackage}
        aria-disabled={!selectedPackage}
      >
        {selectedPackage ? `Book Now - Rs.${totalPrice}` : 'Select a package'}
      </button>
    </div>
  );
};

export default EventDetail;
