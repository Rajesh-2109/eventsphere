import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "./Auth.css";
export default function Register() {
  const [f, setF] = useState({
      name: "",
      email: "",
      password: "",
      role: "attendee",
    }),
    [busy, setBusy] = useState(false),
    { register } = useAuth(),
    nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const u = await register(f);
      toast.success("Account created");
      nav(u.role === "organizer" ? "/organizer/dashboard" : "/");
    } catch (e) {
      toast.error(e.message || "Could not create account");
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="brand auth-brand">
          event<span>sphere</span>
        </Link>
        <span className="eyebrow">JOIN THE EXPERIENCE</span>
        <h1>
          Make room for
          <br />
          <em>something great.</em>
        </h1>
        <p className="auth-intro">
          Create your account and discover what’s happening.
        </p>
        <form onSubmit={submit}>
          <label>
            Full name
            <input
              required
              minLength="2"
              maxLength="50"
              value={f.name}
              onChange={(e) => setF({ ...f, name: e.target.value })}
            />
          </label>
          <label>
            Email address
            <input
              required
              type="email"
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
            />
          </label>
          <label>
            Password
            <input
              required
              type="password"
              minLength="8"
              value={f.password}
              onChange={(e) => setF({ ...f, password: e.target.value })}
              placeholder="At least 8 characters"
            />
          </label>
          <label>
            I’m joining as
            <select
              value={f.role}
              onChange={(e) => setF({ ...f, role: e.target.value })}
            >
              <option value="attendee">Attendee — discover and book</option>
              <option value="organizer">Organizer — host events</option>
            </select>
          </label>
          <button disabled={busy} className="btn btn-primary btn-wide">
            {busy ? "Creating…" : "Create account"} <ArrowRight size={17} />
          </button>
        </form>
        <div className="auth-foot">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
        <small className="auth-security">
          Admin accounts are seeded by platform administrator.
        </small>
      </section>
    </main>
  );
}
