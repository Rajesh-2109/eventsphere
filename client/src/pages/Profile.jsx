import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { toast } from "react-toastify";
import "./Profile.css";
export default function Profile() {
  const { user, refresh } = useAuth(),
    [p, setP] = useState({
      name: user.name,
      phone: user.phone || "",
      avatar: user.avatar || "",
    }),
    [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const save = async (e) => {
      e.preventDefault();
      try {
        await api.put("/users/me", p);
        await refresh();
        toast.success("Profile updated");
      } catch (e) {
        toast.error(e.message);
      }
    },
    change = async (e) => {
      e.preventDefault();
      try {
        await api.put("/users/me/password", pw);
        setPw({ currentPassword: "", newPassword: "" });
        toast.success("Password changed");
      } catch (e) {
        toast.error(e.message);
      }
    };
  return (
    <main className="container page-pad profile-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ACCOUNT SETTINGS</span>
          <h1>
            Your <em>profile.</em>
          </h1>
          <p>Keep your details up to date.</p>
        </div>
      </div>
      <div className="profile-grid">
        <form className="surface-card form-card" onSubmit={save}>
          <h2>Personal information</h2>
          <p className="muted">
            Your details are used for bookings and updates.
          </p>
          <label>
            Full name
            <input
              required
              value={p.name}
              onChange={(e) => setP({ ...p, name: e.target.value })}
            />
          </label>
          <label>
            Email
            <input disabled value={user.email} />
          </label>
          <label>
            Phone
            <input
              value={p.phone}
              onChange={(e) => setP({ ...p, phone: e.target.value })}
            />
          </label>
          <label>
            Avatar URL
            <input
              value={p.avatar}
              onChange={(e) => setP({ ...p, avatar: e.target.value })}
            />
          </label>
          <button className="btn btn-primary">Save changes</button>
        </form>
        <form className="surface-card form-card" onSubmit={change}>
          <h2>Change password</h2>
          <p className="muted">Choose a strong password.</p>
          <label>
            Current password
            <input
              type="password"
              required
              value={pw.currentPassword}
              onChange={(e) =>
                setPw({ ...pw, currentPassword: e.target.value })
              }
            />
          </label>
          <label>
            New password
            <input
              type="password"
              required
              minLength="8"
              value={pw.newPassword}
              onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
            />
          </label>
          <button className="btn btn-primary">Update password</button>
        </form>
      </div>
    </main>
  );
}
