import { useEffect, useState } from "react";
import { Search, Shield, UserX, UserCheck } from "lucide-react";
import api from "../api/axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import "./Admin.css";
export default function AdminUsers() {
  const [users, setUsers] = useState(null),
    [q, setQ] = useState("");
  const load = () =>
    api
      .get("/admin/users", { params: { q } })
      .then((r) => setUsers(r.data))
      .catch((e) => toast.error(e.message));
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [q]);
  const toggle = async (u) => {
    try {
      await api.patch(`/admin/users/${u._id}/block`, { blocked: !u.isBlocked });
      toast.success(u.isBlocked ? "User unblocked" : "User blocked");
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };
  if (!users) return <Loader full />;
  return (
    <main className="container page-pad">
      <div className="page-heading">
        <div>
          <span className="eyebrow">COMMUNITY MANAGEMENT</span>
          <h1>
            People of <em>EventSphere.</em>
          </h1>
          <p>Review accounts and protect the community.</p>
        </div>
      </div>
      <label className="admin-search">
        <Search />
        <input
          placeholder="Search name or email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </label>
      <div className="surface-card table-card">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <strong>{u.name}</strong>
                    <small>{u.email}</small>
                  </td>
                  <td>
                    <span className="role-label">
                      <Shield size={13} />
                      {u.role}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={`status-pill ${u.isBlocked ? "rejected" : "approved"}`}
                    >
                      {u.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-small ${u.isBlocked ? "btn-primary" : "btn-outline"}`}
                      onClick={() => toggle(u)}
                    >
                      {u.isBlocked ? (
                        <>
                          <UserCheck size={14} /> Unblock
                        </>
                      ) : (
                        <>
                          <UserX size={14} /> Block
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
