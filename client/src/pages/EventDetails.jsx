import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  MapPin,
  Ticket,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Loader from "../components/Loader";
import "./EventDetails.css";
import { toast } from "react-toastify";
export default function EventDetails() {
  const { id } = useParams(),
    nav = useNavigate(),
    { user } = useAuth(),
    socket = useSocket(),
    [event, setEvent] = useState(null),
    [loading, setLoading] = useState(true),
    [qty, setQty] = useState({}),
    [busy, setBusy] = useState(false);
  const load = () =>
    api
      .get(`/events/${id}`)
      .then((r) => setEvent(r.data))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, [id]);
  useEffect(() => {
    if (!socket || !event) return;
    socket.emit("event:join", { eventId: id });
    const h = (p) => {
      if (p.eventId === id)
        setEvent((old) => ({
          ...old,
          tickets: old.tickets.map((t) =>
            String(t._id) === p.ticketTypeId
              ? { ...t, available: p.available }
              : t,
          ),
        }));
    };
    socket.on("seats:update", h);
    return () => {
      socket.emit("event:leave", { eventId: id });
      socket.off("seats:update", h);
    };
  }, [socket, event?._id]);
  const book = async (t) => {
    if (!user) {
      nav("/login");
      return;
    }
    setBusy(true);
    try {
      const r = await api.post("/bookings", {
        eventId: id,
        ticketTypeId: t._id,
        quantity: qty[t._id] || 1,
      });
      toast.success("Tickets confirmed!");
      nav("/my-tickets", { state: { newBooking: r.data } });
    } catch (e) {
      toast.error(e.message || "Booking failed");
      load();
    } finally {
      setBusy(false);
    }
  };
  if (loading) return <Loader full />;
  if (!event)
    return (
      <main className="container page-pad">
        <h2>Event unavailable</h2>
        <Link to="/">Back to events</Link>
      </main>
    );
  const banner = event.banner?.startsWith("http")
    ? event.banner
    : `${import.meta.env.VITE_SOCKET_URL || "http://localhost:5000"}${event.banner}`;
  return (
    <main className="container event-detail-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> All events
      </Link>
      <div className="detail-hero">
        {event.banner && <img src={banner} alt={event.title} />}
        <span className="detail-category">{event.category}</span>
      </div>
      <div className="detail-layout">
        <article className="detail-main">
          <span className="eyebrow">THE EXPERIENCE</span>
          <h1>{event.title}</h1>
          <div className="detail-facts">
            <span>
              <CalendarDays />
              {new Date(event.startDate).toLocaleDateString(undefined, {
                dateStyle: "long",
              })}
            </span>
            <span>
              <Clock />
              {new Date(event.startDate).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              –{" "}
              {new Date(event.endDate).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span>
              <MapPin />
              {event.venue}, {event.city}
            </span>
          </div>
          <div className="detail-description">{event.description}</div>
          <div className="organizer-note">
            <span className="avatar">{event.organizer?.name?.[0]}</span>
            <span>
              <small>HOSTED BY</small>
              <strong>{event.organizer?.name}</strong>
            </span>
          </div>
        </article>
        <aside className="booking-panel">
          <div className="booking-panel-head">
            <span className="eyebrow">SAVE YOUR SPOT</span>
            <h2>
              Choose your
              <br />
              <em>ticket.</em>
            </h2>
            <p>Availability updates live as people book.</p>
          </div>
          <div className="ticket-options">
            {event.tickets.map((t) => (
              <div className="ticket-option" key={t._id}>
                <div>
                  <strong>{t.name}</strong>
                  <b>
                    {t.price === 0
                      ? "Free"
                      : `₹${t.price.toLocaleString("en-IN")}`}
                  </b>
                  <small>
                    {t.available > 0 ? `${t.available} available` : "Sold out"}
                  </small>
                </div>
                <div className="ticket-buy">
                  {t.available > 0 ? (
                    <>
                      <select
                        value={qty[t._id] || 1}
                        onChange={(e) =>
                          setQty((p) => ({
                            ...p,
                            [t._id]: Number(e.target.value),
                          }))
                        }
                      >
                        {Array.from(
                          { length: Math.min(10, t.available) },
                          (_, i) => (
                            <option key={i + 1}>{i + 1}</option>
                          ),
                        )}
                      </select>
                      <button
                        disabled={busy}
                        onClick={() => book(t)}
                        className="btn btn-primary btn-small"
                      >
                        Book
                      </button>
                    </>
                  ) : (
                    <span className="sold-label">Sold out</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="secure-note">
            <ShieldCheck size={16} /> Secure booking · QR ticket included
          </div>
        </aside>
      </div>
    </main>
  );
}
