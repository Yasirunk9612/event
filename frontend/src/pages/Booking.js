import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../pages/css/Booking.css";

const Booking = () => {
  const location = useLocation();
  const { event, package: selectedPackage } = location.state || {};
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  if (!event || !selectedPackage) return <p>Invalid booking. Go back to events.</p>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can call your booking API
    console.log("Booking submitted:", { event, selectedPackage, userData });
    alert(`Booked ${selectedPackage.name} package for ${event.title}!`);
  };

  return (
    <div className="booking-container">
      <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">← Back</button>
      <h1>Booking for {event.title}</h1>
      <h2>Package: {selectedPackage.name} - Rs.{selectedPackage.price}</h2>
      <p>{selectedPackage.description}</p>

      <form onSubmit={handleSubmit} className="booking-form">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={userData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={userData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={userData.phone}
          onChange={handleChange}
          required
        />
        <button type="submit">Confirm Booking</button>
      </form>
    </div>
  );
};

export default Booking;
