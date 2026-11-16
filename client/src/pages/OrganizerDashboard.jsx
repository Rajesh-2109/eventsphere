import { useEffect, useState } from "react";
import {
  Plus,
  CalendarDays,
  Ticket,
  IndianRupee,
  ScanLine,
  ChartNoAxesCombined,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import api from "../api/axios";
import StatCard from "../components/StatCard";
import Loader from "../components/Loader";
import "./Dashboard.css";
export default function OrganizerDashboard() {
  const [d, setD] = useState(null),
    [events, setEvents] = useState([]);
  useEffect(() => {
    Promise.all([api.get("/organizer/stats"), api.get("/events/mine")])
      .then(([a, b]) => {
        setD(a.data);
        setEvents(b.data);
      })
      .catch(() => {});
  }, []);
  if (!d) return <Loader full />;
  return (
    <main className="container page-pad dashboard-page">
      <div className="dashboard-head">
        <div>
          <span className="eyebrow">ORGANIZER WORKSPACE</span>
          <h1>
            Make it <em>happen.</em>
          </h1>
          <p>Your events, audience and impact.</p>
        </div>
        <Link to="/organizer/events/new" className="btn btn-primary">
          <Plus size={17} /> Create event
        </Link>
      </div>
      <div className="stats-grid">
        <StatCard
          icon={CalendarDays}
          label="Total events"
          value={d.totalEvents}
        />
        <StatCard icon={Ticket} label="Tickets sold" value={d.tickets} />
        <StatCard
          icon={IndianRupee}
          label="Revenue"
          value={`₹${Number(d.revenue).toLocaleString("en-IN")}`}
        />
        <StatCard
          icon={ScanLine}
          label="Checked in"
          value={`${d.checkin.checked}/${d.checkin.sold}`}
        />
      </div>
      <div className="dashboard-two">
        <section className="surface-card chart-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">PERFORMANCE</span>
              <h2>Booking activity</h2>
            </div>
            <ChartNoAxesCombined />
          </div>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={d.monthly}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b78ff" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#8b78ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#252b43"
                />
                <XAxis dataKey="_id" stroke="#7d849c" />
                <YAxis stroke="#7d849c" />
                <Tooltip
                  contentStyle={{
                    background: "#171d35",
                    border: "1px solid #333b58",
                    borderRadius: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="#a99aff"
                  fill="url(#rev)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="surface-card quick-card">
          <span className="eyebrow">QUICK ACTIONS</span>
          <h2>Run your event.</h2>
          <Link to="/organizer/scanner">
            <ScanLine /> Open QR scanner <span>→</span>
          </Link>
          <Link to="/organizer/events/new">
            <Plus /> Create a new event <span>→</span>
          </Link>
        </section>
      </div>
      <section className="surface-card table-card">
        <div className="card-heading">
          <div>
            <span className="eyebrow">YOUR LINEUP</span>
            <h2>Events</h2>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Status</th>
                <th>Sold</th>
                <th>Revenue</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e._id}>
                  <td>
                    <strong>{e.title}</strong>
                    <small>{e.city}</small>
                  </td>
                  <td>{new Date(e.startDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-pill ${e.status}`}>
                      {e.status}
                    </span>
                  </td>
                  <td>{e.sold || 0}</td>
                  <td>₹{Number(e.revenue || 0).toLocaleString("en-IN")}</td>
                  <td>
                    <Link
                      className="table-link"
                      to={`/organizer/events/${e._id}/attendees`}
                    >
                      Attendees
                    </Link>{" "}
                    ·{" "}
                    <Link
                      className="table-link"
                      to={`/organizer/events/${e._id}/edit`}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!events.length && (
            <p className="muted pad-20">No events created yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}
