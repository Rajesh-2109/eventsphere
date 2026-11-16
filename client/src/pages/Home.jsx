import { useEffect, useState } from "react";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Ticket,
  CalendarDays,
} from "lucide-react";
import api from "../api/axios";
import EventCard from "../components/EventCard";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { useSocket } from "../context/SocketContext";
import "./Home.css";
export default function Home() {
  const [filters, setFilters] = useState({
      q: "",
      category: "All",
      city: "",
      price: "",
      sort: "date",
      page: 1,
    }),
    [data, setData] = useState({
      events: [],
      pagination: { page: 1, pages: 1, total: 0 },
    }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    socket = useSocket();
  const load = () => {
    setLoading(true);
    const p = { ...filters };
    Object.keys(p).forEach((k) => !p[k] && delete p[k]);
    api
      .get("/events", { params: p })
      .then((r) => {
        setData(r.data);
        setError("");
      })
      .catch((e) => setError(e.message || "Could not load events"))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [filters]);
  useEffect(() => {
    if (!socket) return;
    socket.on("event:published", load);
    return () => socket.off("event:published", load);
  }, [socket]);
  return (
    <main>
      <section className="hero">
        <div className="hero-inner container">
          <div className="hero-copy">
            <div className="hero-kicker">
              <Sparkles size={14} /> YOUR NEXT GREAT MEMORY STARTS HERE
            </div>
            <h1>
              Find your people.
              <br />
              <em>Feel the moment.</em>
            </h1>
            <p>
              Discover experiences worth showing up for. From live music to big
              ideas, your next favourite event is one click away.
            </p>
            <div className="hero-actions">
              <a href="#discover" className="btn btn-primary btn-large">
                Explore events <ArrowRight size={17} />
              </a>
              <span className="hero-note">
                <ShieldCheck size={15} /> Secure booking · Instant QR tickets
              </span>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-orbit orbit-a" />
            <div className="hero-orbit orbit-b" />
            <div className="hero-ticket">
              <span className="ticket-top">LIVE THE EXPERIENCE</span>
              <div className="ticket-symbol">
                <CalendarDays size={36} />
              </div>
              <strong>
                Make it
                <br />
                memorable.
              </strong>
              <span className="ticket-bottom">EVENTSPHERE · EST. NOW</span>
            </div>
            <div className="floating-chip chip-one">
              <span className="chip-dot" /> Discover something new
            </div>
            <div className="floating-chip chip-two">
              <Ticket size={15} /> Your pass. Your moment.
            </div>
          </div>
        </div>
        <div className="container hero-stats">
          <div>
            <strong>01</strong>
            <span>Find an experience</span>
          </div>
          <div>
            <strong>02</strong>
            <span>Book your tickets</span>
          </div>
          <div>
            <strong>03</strong>
            <span>Show up & enjoy</span>
          </div>
        </div>
      </section>
      <section className="section container" id="discover">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CURATED FOR YOUR CALENDAR</span>
            <h2>
              What's happening <em>near you</em>
            </h2>
            <p>Explore experiences that bring people together.</p>
          </div>
          <span className="result-count">
            {data.pagination.total} events found
          </span>
        </div>
        <FilterBar filters={filters} setFilters={setFilters} />
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="error-panel">
            {error}
            <button className="btn btn-outline" onClick={load}>
              Try again
            </button>
          </div>
        ) : data.events.length ? (
          <div className="event-grid">
            {data.events.map((e) => (
              <EventCard key={e._id} event={e} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No events found"
            text="Try changing your filters or check back soon."
          />
        )}
        <Pagination
          page={data.pagination.page}
          pages={data.pagination.pages}
          onChange={(page) => setFilters((p) => ({ ...p, page }))}
        />
      </section>
      <section className="closing-band">
        <div className="container closing-inner">
          <div>
            <span className="eyebrow">HAVE SOMETHING TO SHARE?</span>
            <h2>
              Bring your event
              <br />
              to <em>the world.</em>
            </h2>
          </div>
          <p>
            Build your audience, manage your guests and make every check-in
            effortless.
          </p>
          <a className="btn btn-light" href="/register">
            Become an organizer <ArrowRight size={16} />
          </a>
        </div>
      </section>
      <footer className="site-footer">
        <div className="container">
          <a className="brand" href="/">
            event<span>sphere</span>
          </a>
          <p>More than an event. A memory in the making.</p>
          <small>
            © {new Date().getFullYear()} EventSphere. Made for moments.
          </small>
        </div>
      </footer>
    </main>
  );
}
