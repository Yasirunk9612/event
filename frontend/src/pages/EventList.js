import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../pages/css/EventList.css";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all"); // retained only for search results logic
  const [activeTab, setActiveTab] = useState("Normal"); // Active luxury tab
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

  // Luxury categories
  const luxuryCategories = ['Normal', 'Luxury', 'Full Luxury'];
  
  // Group events by luxury category
  const eventsByLuxuryCategory = useMemo(() => {
    const grouped = {};
    luxuryCategories.forEach(category => {
      grouped[category] = (events || [])
        .filter(event => (event.luxuryCategory || 'Normal') === category)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    });
    return grouped;
  }, [events]);

  // Current tab events
  const currentTabEvents = eventsByLuxuryCategory[activeTab] || [];

  // Remove dynamic type categories (simplified per requirement)
  const categories = []; // no longer used for separate sections

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
      <div className="price-row">
        {event.originalPrice && event.originalPrice > event.price && (
          <span className="original-price">Rs.{event.originalPrice}</span>
        )}
        <span className="current-price">Rs.{event.price}</span>
        {event.originalPrice && event.originalPrice > event.price && (
          <span className="discount-badge">-
            {Math.round(((event.originalPrice - event.price) / event.originalPrice) * 100)}%
          </span>
        )}
      </div>
      <p className="event-description">{event.shortDescription || event.description}</p>
      
      <div className="event-badges">
        <span className="event-type">{event.type}</span>
        <span className={`luxury-badge luxury-${event.luxuryCategory?.toLowerCase().replace(' ', '-') || 'normal'}`}>
          {event.luxuryCategory || 'Normal'}
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Page Header */}
      <header className="page-header">
        <div className="brand">Event Explorer</div>
        <nav className="nav-links" aria-label="Section navigation">
          <button onClick={() => scrollToId("trending")} className="nav-link">Trending</button>
          <button onClick={() => scrollToId("luxury-categories")} className="nav-link">Categories</button>
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
        {/* Category chips removed */}
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

      {/* Luxury Categories with Tabs */}
      <section className="section luxury-categories-section" id="luxury-categories">
        <div className="section-header">
          <h2 className="section-title">Browse by Luxury Level</h2>
          <span className="section-sub">Find your perfect experience</span>
        </div>
        
        {/* Modern Tab Navigation */}
        <div className="luxury-tabs">
          {luxuryCategories.map(category => {
            const categoryEvents = eventsByLuxuryCategory[category] || [];
            const isActive = activeTab === category;
            
            const categoryIcon = {
              'Normal': '🎯',
              'Luxury': '⭐',
              'Full Luxury': '💎'
            }[category] || '🎯';
            
            const categoryGradient = {
              'Normal': 'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
              'Luxury': 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)',
              'Full Luxury': 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)'
            }[category];

            return (
              <button
                key={category}
                className={`luxury-tab ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(category)}
                style={{ '--tab-gradient': categoryGradient }}
              >
                <div className="tab-content">
                  <span className="tab-icon">{categoryIcon}</span>
                  <div className="tab-text">
                    <span className="tab-title">{category}</span>
                    <span className="tab-count">{categoryEvents.length} events</span>
                  </div>
                </div>
                <div className="tab-glow"></div>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="luxury-tab-content">
          {loading ? (
            <div className="event-grid luxury-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div className="event-card skeleton-card" key={`sk-lux-${i}`} />
              ))}
            </div>
          ) : currentTabEvents.length === 0 ? (
            <div className="empty-tab-state">
              <div className="empty-illustration">
                {activeTab === 'Normal' ? '🎯' : activeTab === 'Luxury' ? '⭐' : '💎'}
              </div>
              <h3>No {activeTab} events yet</h3>
              <p>Check back soon for new {activeTab.toLowerCase()} events!</p>
            </div>
          ) : (
            <>
              <div className="luxury-category-info">
                <p className="luxury-category-desc">
                  {activeTab === 'Normal' && 'Quality events at affordable prices with great value'}
                  {activeTab === 'Luxury' && 'Premium experiences with enhanced features and comfort'}
                  {activeTab === 'Full Luxury' && 'Ultimate luxury with exclusive amenities and VIP treatment'}
                </p>
              </div>
              <div className="event-grid luxury-grid">
                {currentTabEvents.slice(0, 12).map(event => renderCard(event))}
              </div>
              {currentTabEvents.length > 12 && (
                <div className="see-more-row">
                  <button 
                    className="see-more-btn luxury-see-more"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearch(activeTab);
                    }}
                  >
                    View All {activeTab} Events ({currentTabEvents.length})
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Filtered results if user is searching or selected a category */}
      {search.trim() && (
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
      {/* Type category sections removed */}

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
