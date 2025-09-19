import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../pages/css/EventDetail.css";

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:5002/api/events/${id}`)
      .then((res) => setEvent(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!event) return <p>Loading...</p>;

  const handleBooking = () => {
    if (!selectedPackage) {
      alert("Please select a package to continue booking.");
      return;
    }

    // Navigate to Booking page with event and package info
    navigate("/booking", { state: { event, package: selectedPackage } });
  };

  return (
    <div className="event-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">← Back</button>
      <h1>{event.title}</h1>
      {event.image && <img src={`http://localhost:5002${event.image}`} alt={event.title} />}
      <p><strong>Date:</strong> {new Date(event.date).toDateString()}</p>
      <p><strong>Location:</strong> {event.location}</p>
      <p><strong>Type:</strong> {event.type}</p>
      <p>{event.description}</p>

      <div className="packages-section">
        <h2>Packages</h2>
        {event.packages && event.packages.length > 0 ? (
          <ul>
            {event.packages.map((pkg, idx) => (
              <li key={idx}>
                <input
                  type="radio"
                  name="package"
                  value={pkg.name}
                  onChange={() => setSelectedPackage(pkg)}
                  id={`pkg-${idx}`}
                />
                <label htmlFor={`pkg-${idx}`}>
                  <strong>{pkg.name}</strong> - Rs.{pkg.price} <br />
                  {pkg.description}
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p>No packages available.</p>
        )}
      </div>

      <button className="book-btn" onClick={handleBooking}>
        Book Selected Package
      </button>
    </div>
  );
};

export default EventDetail;
