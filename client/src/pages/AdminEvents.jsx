import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import { Check, X, Trash2 } from "lucide-react";
import "./Admin.css";
export default function AdminEvents() {
  const [events, setEvents] = useState(null),
    [tab, setTab] = useState("pending");
  const load = () =>
    api
      .get(tab === "pending" ? "/admin/events/pending" : "/admin/events")
      .then((r) => setEvents(r.data))
      .catch((e) => toast.error(e.message));
  useEffect(() => {
    setEvents(null);
    load();
  }, [tab]);
  const act = async (e, k) => {
    try {
      if (k === "approve") await api.patch(`/admin/events/${e._id}/approve`);
      else if (k === "reject") {
        const reason = prompt("Reason for rejection?");
        if (!reason) return;
        await api.patch(`/admin/events/${e._id}/reject`, { reason });
      } else {
        if (!confirm("Remove event?")) return;
        await api.delete(`/admin/events/${e._id}`);
      }
      toast.success("Action completed");
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };
  if (!events) return <Loader full />;
  return (
    <main className="container page-pad">
      <div className="page-heading">
        <div>
          <span className="eyebrow">CONTENT MODERATION</span>
          <h1>
            Event <em>reviews.</em>
          </h1>
          <p>Approve experiences ready to meet their audience.</p>
        </div>
      </div>
      <div className="admin-tabs">
        <button
          className={tab === "pending" ? "selected" : ""}
          onClick={() => setTab("pending")}
        >
          Pending approval
        </button>
        <button
          className={tab === "all" ? "selected" : ""}
          onClick={() => setTab("all")}
        >
          All events
        </button>
      </div>
      <div className="admin-event-list">
        {events.map((e) => (
          <article className="surface-card admin-event" key={e._id}>
            <div>
              <span className={`status-pill ${e.status}`}>{e.status}</span>
              <h3>{e.title}</h3>
              <p>
                {e.category} · {e.city} ·{" "}
                {new Date(e.startDate).toLocaleString()}
              </p>
              <small>
                Organizer: {e.organizer?.name} ({e.organizer?.email})
              </small>
              {e.rejectionReason && (
                <p className="reject-reason">Reason: {e.rejectionReason}</p>
              )}
            </div>
            <div className="admin-event-actions">
              {e.status === "pending" && (
                <>
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => act(e, "approve")}
                  >
                    <Check size={15} /> Approve
                  </button>
                  <button
                    className="btn btn-outline btn-small"
                    onClick={() => act(e, "reject")}
                  >
                    <X size={15} /> Reject
                  </button>
                </>
              )}
              <button
                className="icon-btn danger-icon"
                onClick={() => act(e, "remove")}
              >
                <Trash2 size={17} />
              </button>
            </div>
          </article>
        ))}
        {!events.length && (
          <div className="surface-card empty-state">
            <h3>No events in this view</h3>
            <p>Nothing needs your attention.</p>
          </div>
        )}
      </div>
    </main>
  );
}
