import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Compass,
  Ticket,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import "./Navbar.css";
export default function Navbar() {
  const { user, logout } = useAuth(),
    [open, setOpen] = useState(false),
    nav = useNavigate();
  const links = user
    ? [
        ["/", "Explore", Compass],
        ["/my-tickets", "My tickets", Ticket],
        ...(user.role === "organizer"
          ? [["/organizer/dashboard", "Workspace", LayoutDashboard]]
          : []),
        ...(user.role === "admin"
          ? [["/admin/dashboard", "Admin", LayoutDashboard]]
          : []),
      ]
    : [["/", "Explore", Compass]];
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">e</span>
          <span>
            event<span>sphere</span>
          </span>
        </Link>
        <button
          className="mobile-menu"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? "nav-links nav-open" : "nav-links"}>
          {links.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-actions">
          {user ? (
            <>
              <NotificationBell />
              <Link to="/profile" className="avatar-link">
                <span className="avatar">{user.name?.[0]?.toUpperCase()}</span>
                <span className="nav-user">{user.name.split(" ")[0]}</span>
              </Link>
              <button
                className="icon-btn"
                onClick={() => {
                  logout();
                  nav("/");
                }}
                title="Sign out"
              >
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-link">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary btn-small">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
