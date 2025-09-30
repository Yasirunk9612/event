import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../pages/css/EventDetail.css";

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:5002/api/events/${id}`)
      .then((res) => {
        console.log("Event data received:", res.data);
        console.log("Packages:", res.data.packages);
        console.log("Number of packages:", res.data.packages ? res.data.packages.length : 0);
        setEvent(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching event:", err);
        setLoading(false);
      });
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
    if (!selectedPackage) { 
      alert("Please select a package to continue."); 
      return; 
    }
    navigate("/booking", {
      state: {
        event,
        package: selectedPackage,
        addOns: selectedAddOns,
        totalPrice
      }
    });
  };

  if (loading) {
    return (
      <div className="event-detail-container">
        <div className="loading-skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-image"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-packages"></div>
        </div>
      </div>
    );
  }

  if (!event) return <div className="event-detail-container"><p>Event not found.</p></div>;

  const hasDiscount = event.originalPrice && event.originalPrice > event.price;
  const discountPercent = hasDiscount ? Math.round(((event.originalPrice - event.price) / event.originalPrice) * 100) : 0;

  return (
    <div className="event-detail-container">
      {/* Hero Section */}
      <div className="hero-section">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        
        <div className="hero-content">
          <div className="hero-text">
            <div className="event-type-badge">{event.type}</div>
            <h1 className="event-title">{event.title}</h1>
            <div className="event-location">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {event.location}
            </div>
            <div className="price-display">
              {hasDiscount && (
                <span className="original-price">Rs.{event.originalPrice}</span>
              )}
              <span className="current-price">Rs.{event.price}</span>
              {hasDiscount && (
                <span className="discount-badge">{discountPercent}% OFF</span>
              )}
            </div>
          </div>
          
          {event.image && (
            <div className="hero-image">
              <img src={`http://localhost:5002${event.image}`} alt={event.title} />
              <div className="image-overlay"></div>
            </div>
          )}
        </div>
      </div>

      {/* Description Section */}
      <div className="description-section">
        <h2>About This Event</h2>
        <p className="event-description">{event.description}</p>
      </div>

      {/* Packages Section */}
      <div className="packages-section">
        <div className="section-header">
          <h2>Choose Your Package</h2>
          <p className="section-subtitle">Select the perfect package for your experience</p>
        </div>
        
        {event.packages && event.packages.length > 0 ? (
          <div className="packages-grid">
            {event.packages.map((pkg, idx) => {
              console.log(`Rendering package ${idx}:`, pkg);
              const isSelected = selectedPackage && selectedPackage.name === pkg.name;
              return (
                <div 
                  key={idx} 
                  className={`package-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handlePackageSelect(pkg)}
                >
                  <div className="package-header">
                    <h3 className="package-name">{pkg.name}</h3>
                    <div className="package-price">Rs.{pkg.price}</div>
                  </div>
                  <p className="package-description">{pkg.description || "No description available"}</p>
                  <div className="package-select">
                    <div className={`radio-circle ${isSelected ? 'selected' : ''}`}>
                      {isSelected && <div className="radio-dot"></div>}
                    </div>
                    <span>Select Package</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-packages">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p>No packages available for this event.</p>
            <p className="debug-info">Debug: event.packages = {JSON.stringify(event.packages)}</p>
          </div>
        )}
      </div>

      {/* Add-ons Section */}
      {event.addOns && event.addOns.length > 0 && (
        <div className="addons-section">
          <div className="section-header">
            <h2>Enhance Your Experience</h2>
            <p className="section-subtitle">Add extra features to make your event even better</p>
          </div>
          
          <div className="addons-grid">
            {event.addOns.map((addOn, idx) => {
              const isSelected = selectedAddOns.some(item => item._id === addOn._id);
              return (
                <div 
                  key={addOn._id || idx} 
                  className={`addon-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleAddOnToggle(addOn)}
                >
                  <div className="addon-header">
                    <h4 className="addon-name">{addOn.name}</h4>
                    <div className="addon-price">+Rs.{addOn.price}</div>
                  </div>
                  {addOn.description && (
                    <p className="addon-description">{addOn.description}</p>
                  )}
                  <div className="addon-checkbox">
                    <div className={`checkbox-circle ${isSelected ? 'selected' : ''}`}>
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span>{isSelected ? 'Added' : 'Add to package'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Summary */}
      {selectedPackage && (
        <div className="price-summary">
          <h3>Order Summary</h3>
          <div className="summary-items">
            <div className="summary-item package-item">
              <span>{selectedPackage.name} Package</span>
              <span>Rs.{selectedPackage.price}</span>
            </div>
            {selectedAddOns.map((addOn, idx) => (
              <div key={addOn._id || idx} className="summary-item addon-item">
                <span>{addOn.name}</span>
                <span>+Rs.{addOn.price}</span>
              </div>
            ))}
            <div className="summary-total">
              <span>Total Amount</span>
              <span>Rs.{totalPrice}</span>
            </div>
          </div>
        </div>
      )}

      {/* Booking Button */}
      <div className="booking-section">
        <button
          className={`book-btn ${!selectedPackage ? 'disabled' : ''}`}
          onClick={handleBooking}
          disabled={!selectedPackage}
        >
          {selectedPackage ? (
            <>
              <span>Book Now</span>
              <span className="btn-price">Rs.{totalPrice}</span>
            </>
          ) : (
            'Select a package to continue'
          )}
        </button>
      </div>
    </div>
  );
};

export default EventDetail;
