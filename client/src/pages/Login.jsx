import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "./Auth.css";
export default function Login() {
  const [f, setF] = useState({ email: "", password: "" }),
    [busy, setBusy] = useState(false),
    { login } = useAuth(),
    nav = useNavigate(),
    loc = useLocation();
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const u = await login(f);
      toast.success("Welcome back!");
      nav(
        loc.state?.from ||
          (u.role === "admin"
            ? "/admin/dashboard"
            : u.role === "organizer"
              ? "/organizer/dashboard"
              : "/"),
      );
    } catch (e) {
      toast.error(e.message || "Login failed");
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
        <span className="eyebrow">GOOD TO SEE YOU AGAIN</span>
        <h1>
          Welcome <em>back.</em>
        </h1>
        <p className="auth-intro">
          Sign in to pick up where your next great experience begins.
        </p>
        <form onSubmit={submit}>
          <label>
            Email address
            <input
              type="email"
              required
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              value={f.password}
              onChange={(e) => setF({ ...f, password: e.target.value })}
              placeholder="Enter your password"
            />
          </label>
          <button disabled={busy} className="btn btn-primary btn-wide">
            {busy ? "Signing in…" : "Sign in"} <ArrowRight size={17} />
          </button>
        </form>
        <div className="auth-foot">
          New to EventSphere? <Link to="/register">Create an account</Link>
        </div>
        <div className="auth-security">
          <LockKeyhole size={14} /> Secure authentication.
        </div>
      </section>
    </main>
  );
}
