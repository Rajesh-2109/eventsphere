import { useEffect, useState } from "react";
import { MapPin, Ticket, QrCode, XCircle } from "lucide-react";
import api from "../api/axios";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import QRModal from "../components/QRModal";
import { toast } from "react-toastify";
import "./MyTickets.css";
export default function MyTickets() {
  const [items, setItems] = useState([]),
    [loading, setLoading] = useState(true),
    [selected, setSelected] = useState(null);
  const load = () =>
    api
      .get("/bookings/mine")
      .then((r) => setItems(r.data))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);
  const cancel = async (b) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      await api.patch(`/bookings/${b._id}/cancel`);
      toast.success("Booking cancelled; seats restored");
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };
  if (loading) return <Loader full />;
  return (
    <main className="container page-pad">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR EVENT PASSES</span>
          <h1>
            My <em>tickets.</em>
          </h1>
          <p>Every plan worth looking forward to, all in one place.</p>
        </div>
        <span className="count-bubble">{items.length} bookings</span>
      </div>
      {items.length ? (
        <div className="ticket-list">
          {items.map((b) => (
            <article className="my-ticket" key={b._id}>
              <div className="my-ticket-date">
                <strong>
                  {b.event
                    ? new Date(b.event.startDate).toLocaleDateString(
                        undefined,
                        { day: "2-digit" },
                      )
                    : "--"}
                </strong>
                <span>
                  {b.event
                    ? new Date(b.event.startDate).toLocaleDateString(
                        undefined,
                        { month: "short" },
                      )
                    : "DATE"}
                </span>
              </div>
              <div className="my-ticket-info">
                <span className="eyebrow">{b.event?.category || "EVENT"}</span>
                <h3>{b.event?.title || "Event removed"}</h3>
                <p>
                  <MapPin size={14} />
                  {b.event?.venue}, {b.event?.city}
                </p>
                <p>
                  <Ticket size={14} />
                  {b.ticketTypeName} · {b.quantity} ·{" "}
                  {b.amount === 0 ? "Free" : `₹${b.amount}`}
                </p>
                <span className={`status-pill ${b.status}`}>{b.status}</span>
                {b.checkedIn && (
                  <span className="status-pill checked">Checked in</span>
                )}
              </div>
              <div className="my-ticket-actions">
                {b.status === "confirmed" && (
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => setSelected(b)}
                  >
                    <QrCode size={15} /> View QR
                  </button>
                )}
                {b.status === "confirmed" &&
                  !b.checkedIn &&
                  b.event &&
                  +new Date(b.event.startDate) - Date.now() > 86400000 && (
                    <button
                      className="text-btn danger"
                      onClick={() => cancel(b)}
                    >
                      <XCircle size={15} /> Cancel
                    </button>
                  )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Your ticket wallet is empty"
          text="Find an event that excites you and your tickets will appear here."
        />
      )}
      <QRModal booking={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
