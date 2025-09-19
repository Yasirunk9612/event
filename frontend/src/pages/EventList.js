import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../pages/css/EventList.css";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch events and bookings in parallel
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [eventsRes, bookingsRes] = await Promise.all([
          axios.get("http://localhost:5002/api/events"),
          axios.get("http://localhost:5002/api/bookings"),
        ]);
        setEvents(eventsRes.data || []);
        setBookings(bookingsRes.data || []);
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

  // Helpers
  const slugify = (s = "") => s.toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const now = useMemo(() => new Date(), []);

  // Category list from events
  const categories = useMemo(() => {
    const set = new Set(
      (events || [])
        .map((e) => (e.type || "").toString().trim())
        .filter(Boolean)
        .map((t) => t[0].toUpperCase() + t.slice(1))
    );
    return Array.from(set).sort();
  }, [events]);

  // Booking counts per eventId
  const bookingCount = useMemo(() => {
    const map = {};
    (bookings || []).forEach((b) => {
      const id = b?.event?._id || b?.event; // populated or ref id
      if (!id) return;
      map[id] = (map[id] || 0) + 1;
    });
    return map;
  }, [bookings]);

  // Filtered list for search/category
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (events || [])
      .filter((e) => {
        const matchCategory = selectedCategory === "all" || (e.type || "").toLowerCase() === selectedCategory.toLowerCase();
        if (!matchCategory) return false;
        if (!term) return true;
        const hay = `${e.title || ""} ${e.location || ""} ${e.description || ""}`.toLowerCase();
        return hay.includes(term);
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // upcoming first
  }, [events, search, selectedCategory]);

  // Trending by bookings (upcoming only), fallback to upcoming
  const trending = useMemo(() => {
    const upcoming = (events || []).filter((e) => new Date(e.date) >= now);
    const sorted = [...upcoming].sort((a, b) => (bookingCount[b._id] || 0) - (bookingCount[a._id] || 0));
    return sorted.slice(0, 6);
  }, [events, bookingCount, now]);

  const onChipClick = (cat) => {
    setSelectedCategory(cat);
    if (cat !== "all") {
      const el = document.getElementById(`cat-${slugify(cat)}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };


  // Helpers for smooth scroll
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
      <p className="event-date">📅 {new Date(event.date).toDateString()}</p>
      <p className="event-location">📍 {event.location}</p>
      <p>{event.description}</p>
      
      <span className="event-type">{event.type}</span>
    </div>
  );

  return (
    <>
      {/* Page Header */}
      <header className="page-header">
        <div className="brand">Event Explorer</div>
        <nav className="nav-links" aria-label="Section navigation">
          <button onClick={() => scrollToId("trending")} className="nav-link">Trending</button>
          <button onClick={() => scrollToId("results")} className="nav-link">Results</button>
          <button onClick={() => scrollToId("all-events")} className="nav-link">All Events</button>
        </nav>
      </header>
      {/* Hero & Search */}
      <section className="hero">
        <h1 className="title">Discover Amazing Events</h1>
        <p className="subtitle">Find workshops, conferences, webinars, and more. Book your spot today.</p>
        <div className="search-row">
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, location, or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {!!categories.length && (
          <div className="chip-row">
            <button className={`chip ${selectedCategory === "all" ? "active" : ""}`} onClick={() => onChipClick("all")}>
              All
            </button>
            {categories.map((c) => (
              <button className={`chip ${selectedCategory.toLowerCase() === c.toLowerCase() ? "active" : ""}`} key={c} onClick={() => onChipClick(c)}>
                {c}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Trending */}
      {loading ? (
        <section className="section" id="trending">
          <div className="section-header">
            <h2 className="section-title">Trending now</h2>
            <span className="section-sub">Loading…</span>
          </div>
          <div className="event-grid trending-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="event-card skeleton-card" key={`sk-tr-${i}`} />
            ))}
          </div>
        </section>
      ) : trending.length > 0 && (
        <section className="section" id="trending">
          <div className="section-header">
            <h2 className="section-title">Trending now</h2>
            <span className="section-sub">By recent bookings</span>
          </div>
          <div className="event-grid trending-grid">
            {trending.map((ev) => renderCard(ev))}
          </div>
        </section>
      )}

      {/* Filtered results if user is searching or selected a category */}
      {(search.trim() || selectedCategory !== "all") && (
        <section className="section" id="results">
          <div className="section-header">
            <h2 className="section-title">Results</h2>
            <span className="section-sub">{loading ? "Loading…" : `${filtered.length} matches`}</span>
          </div>
          {loading ? (
            <div className="event-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div className="event-card skeleton-card" key={`sk-r-${i}`} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state" role="status" aria-live="polite">
              <div className="empty-illustration">🔎</div>
              <h3>No events found</h3>
              <p>Try adjusting your search or pick a different category.</p>
            </div>
          ) : (
            <div className="event-grid">
              {filtered.map((ev) => renderCard(ev))}
            </div>
          )}
        </section>
      )}

      {/* Overview removed as requested */}

      {/* Category sections — 6 items each */}
      {categories.map((cat) => {
        const catEvents = (events || []).filter((e) => (e.type || "").toLowerCase() === cat.toLowerCase());
        if (catEvents.length === 0) return null;
        const topSix = catEvents
          .slice()
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 6);
        return (
          <section className="section" id={`cat-${slugify(cat)}`} key={cat}>
            <div className="section-header">
              <h2 className="section-title">{cat}</h2>
              <button className="see-all-link" onClick={() => setSelectedCategory(cat)}>See all</button>
            </div>
            <div className="event-grid category-grid">{topSix.map((ev) => renderCard(ev))}</div>
          </section>
        );
      })}

      {/* All events */}
      <section className="section" id="all-events">
        <div className="section-header">
          <h2 className="section-title">All Events</h2>
          <span className="section-sub">Explore everything</span>
        </div>
        {loading ? (
          <div className="event-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div className="event-card skeleton-card" key={`sk-a-${i}`} />
            ))}
          </div>
        ) : (
          <>
            <div className="event-grid">
              {events
                .slice()
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, visibleCount)
                .map((ev) => renderCard(ev))}
            </div>
            {visibleCount < events.length && (
              <div className="load-more-row">
                <button className="load-more-btn" onClick={() => setVisibleCount((v) => v + 12)}>
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Footer note */}
      <footer className="page-footer">
        <span>Discover, book, and enjoy great events.</span>
      </footer>
    </>
  );
};

export default EventList;
