import { useEffect, useState } from "react";
import {
  Users,
  CalendarDays,
  Ticket,
  IndianRupee,
  ShieldCheck,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import api from "../api/axios";
import Loader from "../components/Loader";
import StatCard from "../components/StatCard";
import { Link } from "react-router-dom";
import "./Dashboard.css";
export default function AdminDashboard() {
  const [d, setD] = useState(null);
  useEffect(() => {
    api
      .get("/admin/stats")
      .then((r) => setD(r.data))
      .catch(() => {});
  }, []);
  if (!d) return <Loader full />;
  const colors = ["#8b78ff", "#35c7a0", "#f2b45f", "#ed718c"];
  return (
    <main className="container page-pad dashboard-page">
      <div className="dashboard-head">
        <div>
          <span className="eyebrow">PLATFORM CONTROL</span>
          <h1>
            Admin <em>overview.</em>
          </h1>
          <p>A clear view of the EventSphere community.</p>
        </div>
        <Link to="/admin/events" className="btn btn-primary">
          <ShieldCheck size={16} /> Review events
        </Link>
      </div>
      <div className="stats-grid">
        <StatCard icon={Users} label="Total users" value={d.users} />
        <StatCard icon={CalendarDays} label="Total events" value={d.events} />
        <StatCard icon={Ticket} label="Confirmed bookings" value={d.bookings} />
        <StatCard
          icon={IndianRupee}
          label="Simulated revenue"
          value={`₹${Number(d.revenue).toLocaleString("en-IN")}`}
        />
      </div>
      <div className="dashboard-two">
        <section className="surface-card chart-card">
          <span className="eyebrow">EVENT MODERATION</span>
          <h2>Events by status</h2>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={d.eventStatuses.map((x) => ({
                    name: x._id,
                    value: x.count,
                  }))}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={94}
                  paddingAngle={4}
                >
                  {d.eventStatuses.map((x, i) => (
                    <Cell key={x._id} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="surface-card quick-card">
          <span className="eyebrow">ADMIN TOOLS</span>
          <h2>Keep things moving.</h2>
          <Link to="/admin/events">
            <ShieldCheck /> Pending event approvals <span>→</span>
          </Link>
          <Link to="/admin/users">
            <Users /> Manage users <span>→</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
