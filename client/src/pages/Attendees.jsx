import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, ArrowLeft, ScanLine } from "lucide-react";
import api from "../api/axios";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import "./Dashboard.css";
export default function Attendees() {
  const { id } = useParams(),
    [rows, setRows] = useState(null),
    [event, setEvent] = useState(null);
  const load = () =>
    api
      .get(`/events/${id}/bookings`)
      .then((r) => setRows(r.data))
      .catch((e) => toast.error(e.message));
  useEffect(() => {
    load();
    api
      .get(`/events/${id}`)
      .then((r) => setEvent(r.data))
      .catch(() => {});
  }, [id]);
  const csv = async () => {
    try {
      const u = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"}/events/${id}/bookings/export`,
        r = await fetch(u, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("es_token")}`,
          },
        });
      if (!r.ok) throw Error("Export failed");
      const b = await r.blob(),
        url = URL.createObjectURL(b),
        a = document.createElement("a");
      a.href = url;
      a.download = "attendees.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e.message);
    }
  };
  if (!rows) return <Loader full />;
  return (
    <main className="container page-pad">
      <Link to="/organizer/dashboard" className="back-link">
        <ArrowLeft size={16} /> Workspace
      </Link>
      <div className="dashboard-head">
        <div>
          <span className="eyebrow">GUEST MANAGEMENT</span>
          <h1>
            Attendee <em>list.</em>
          </h1>
          <p>
            {event?.title || "Your event"} · {rows.length} active bookings
          </p>
        </div>
        <div className="head-actions">
          <Link to="/organizer/scanner" className="btn btn-outline">
            <ScanLine size={16} /> Scanner
          </Link>
          <button className="btn btn-primary" onClick={csv}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>
      <section className="surface-card table-card">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Booking</th>
                <th>Attendee</th>
                <th>Ticket</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Check-in</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b._id}>
                  <td>
                    <strong>{b.bookingCode}</strong>
                  </td>
                  <td>
                    {b.user?.name}
                    <small>{b.user?.email}</small>
                  </td>
                  <td>{b.ticketTypeName}</td>
                  <td>{b.quantity}</td>
                  <td>₹{b.amount}</td>
                  <td>
                    <span
                      className={`status-pill ${b.checkedIn ? "approved" : "pending"}`}
                    >
                      {b.checkedIn ? "Checked in" : "Not arrived"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <p className="muted pad-20">No bookings yet.</p>}
        </div>
      </section>
    </main>
  );
}
