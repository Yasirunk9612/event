import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../pages/css/EventList.css";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const eventsRes = await axios.get("http://localhost:5002/api/events");
        setEvents(eventsRes.data || []);
      } catch (e) {
        console.error("Failed to fetch events/bookings", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleCardClick = (id) => {
    navigate(`/events/${id}`);
  };

  const filtered = events.filter(ev => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return `${ev.title} ${ev.shortDescription || ev.description || ''}`.toLowerCase().includes(term);
  });

  const renderCard = (event) => (
    <div
      key={event._id}
      className="event-card"
      onClick={() => handleCardClick(event._id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleCardClick(event._id)}
    >
      {event.image && (
        <img src={`http://localhost:5002${event.image}`} alt={event.title} className="event-image" />
      )}
      <h2>{event.title}</h2>
      <div className="price-row">
        <span className="current-price">Rs.{event.price}</span>
      </div>
      <p className="event-description">{event.shortDescription || event.description?.slice(0, 120)}</p>
    </div>
  );

  return (
    <>
      <header className="page-header">
        <div className="brand">Events</div>
      </header>
      <section className="hero">
        <h1 className="title">Discover Events</h1>
        <p className="subtitle">Browse our latest experiences and pick your package.</p>
        <div className="search-row">
          <input
            type="text"
            className="search-input"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Events</h2>
          <span className="section-sub">{loading ? 'Loading…' : `${filtered.length} events`}</span>
        </div>
        {loading ? (
          <div className="event-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div className="event-card skeleton-card" key={`sk-${i}`} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration">�</div>
            <h3>No events found</h3>
            <p>Try another search term.</p>
          </div>
        ) : (
          <div className="event-grid">
            {filtered.map(ev => renderCard(ev))}
          </div>
        )}
      </section>

      {/* Footer note */}
      <footer className="page-footer">
        <span>Browse and book your perfect event.</span>
      </footer>
    </>
  );
};

export default EventList;
