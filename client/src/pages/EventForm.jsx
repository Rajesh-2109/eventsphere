import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import "./EventForm.css";
const blank = {
  title: "",
  description: "",
  category: "Music",
  startDate: "",
  endDate: "",
  venue: "",
  city: "",
  tickets: [{ name: "General", price: 0, total: 100 }],
};
export default function EventForm() {
  const { id } = useParams(),
    nav = useNavigate(),
    [f, setF] = useState(blank),
    [banner, setBanner] = useState(null),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (id)
      api
        .get(`/events/${id}/manage`)
        .then((r) => {
          const e = r.data;
          setF({
            ...e,
            startDate: new Date(e.startDate).toISOString().slice(0, 16),
            endDate: new Date(e.endDate).toISOString().slice(0, 16),
          });
        })
        .catch((e) => toast.error(e.message));
  }, [id]);
  const change = (k, v) => setF((p) => ({ ...p, [k]: v })),
    ticket = (i, k, v) =>
      change(
        "tickets",
        f.tickets.map((t, n) => (n === i ? { ...t, [k]: v } : t)),
      );
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(f).forEach(([k, v]) =>
        fd.append(k, k === "tickets" ? JSON.stringify(v) : v),
      );
      if (banner) fd.append("banner", banner);
      if (id) await api.put(`/events/${id}`, fd);
      else await api.post("/events", fd);
      toast.success(id ? "Event updated" : "Submitted for approval");
      nav("/organizer/dashboard");
    } catch (e) {
      toast.error(e.message || "Could not save event");
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="container page-pad event-form-page">
      <Link to="/organizer/dashboard" className="back-link">
        <ArrowLeft size={16} /> Workspace
      </Link>
      <div className="page-heading">
        <div>
          <span className="eyebrow">EVENT BUILDER</span>
          <h1>
            {id ? "Edit your" : "Create an"} <em>experience.</em>
          </h1>
          <p>Give people a reason to put this date on their calendar.</p>
        </div>
      </div>
      <form className="event-form surface-card" onSubmit={submit}>
        <div className="form-section">
          <h2>Event essentials</h2>
          <div className="form-grid">
            <label className="span-2">
              Event title
              <input
                required
                minLength="3"
                maxLength="100"
                value={f.title}
                onChange={(e) => change("title", e.target.value)}
                placeholder="The Future of Design"
              />
            </label>
            <label>
              Category
              <select
                value={f.category}
                onChange={(e) => change("category", e.target.value)}
              >
                {[
                  "Music",
                  "Tech",
                  "Sports",
                  "Education",
                  "Business",
                  "Arts",
                  "Food",
                  "Other",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              City
              <input
                required
                value={f.city}
                onChange={(e) => change("city", e.target.value)}
                placeholder="Chennai"
              />
            </label>
            <label className="span-2">
              Description
              <textarea
                required
                maxLength="3000"
                rows="5"
                value={f.description}
                onChange={(e) => change("description", e.target.value)}
              />
            </label>
            <label>
              Venue
              <input
                required
                value={f.venue}
                onChange={(e) => change("venue", e.target.value)}
              />
            </label>
            <label>
              Banner image (JPG/PNG/WEBP · 2MB)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setBanner(e.target.files[0])}
              />
            </label>
            <label>
              Starts
              <input
                type="datetime-local"
                required
                value={f.startDate}
                onChange={(e) => change("startDate", e.target.value)}
              />
            </label>
            <label>
              Ends
              <input
                type="datetime-local"
                required
                value={f.endDate}
                onChange={(e) => change("endDate", e.target.value)}
              />
            </label>
          </div>
        </div>
        <div className="form-section">
          <div className="ticket-section-head">
            <div>
              <h2>Ticket types</h2>
              <p className="muted">Offer 1–5 ways to experience your event.</p>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-small"
              disabled={f.tickets.length >= 5}
              onClick={() =>
                change("tickets", [
                  ...f.tickets,
                  { name: "VIP", price: 0, total: 50 },
                ])
              }
            >
              <Plus size={15} /> Add type
            </button>
          </div>
          {f.tickets.map((t, i) => (
            <div className="ticket-type-row" key={t._id || i}>
              <label>
                Ticket name
                <input
                  required
                  value={t.name}
                  onChange={(e) => ticket(i, "name", e.target.value)}
                />
              </label>
              <label>
                Price (₹)
                <input
                  required
                  type="number"
                  min="0"
                  value={t.price}
                  onChange={(e) => ticket(i, "price", e.target.value)}
                />
              </label>
              <label>
                Total quantity
                <input
                  required
                  type="number"
                  min="1"
                  value={t.total}
                  onChange={(e) => ticket(i, "total", e.target.value)}
                />
              </label>
              <button
                type="button"
                className="icon-btn danger-icon"
                disabled={f.tickets.length === 1}
                onClick={() =>
                  change(
                    "tickets",
                    f.tickets.filter((_, n) => n !== i),
                  )
                }
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => nav(-1)}
          >
            Cancel
          </button>
          <button disabled={busy} className="btn btn-primary">
            {busy ? "Saving…" : id ? "Save changes" : "Submit for approval"}
          </button>
        </div>
      </form>
    </main>
  );
}
