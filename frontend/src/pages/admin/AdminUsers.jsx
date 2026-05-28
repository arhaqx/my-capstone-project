import { useState, useEffect } from "react";
import API from "../../services/api";
import { parseJwt } from "../../components/AdminRoute";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const currentUser = token ? parseJwt(token) : null;

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users/");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await API.put(`/admin/users/${userId}/`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || "Gagal mengubah role");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Yakin ingin menghapus user ini?")) return;
    try {
      await API.delete(`/admin/users/${userId}/`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || "Gagal menghapus user");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="glass-card animate-fade-in" style={{ padding: "2rem" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>User Management</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)" }}>
              <th style={{ padding: "1rem" }}>Username</th>
              <th style={{ padding: "1rem" }}>Email</th>
              <th style={{ padding: "1rem" }}>Role</th>
              <th style={{ padding: "1rem" }}>Joined Date</th>
              <th style={{ padding: "1rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "1rem" }}>{u.username}</td>
                <td style={{ padding: "1rem" }}>{u.email}</td>
                <td style={{ padding: "1rem" }}>
                  <select 
                    value={u.role} 
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    disabled={currentUser.role !== 'superadmin' && (u.role === 'superadmin' || u.id === currentUser.id)}
                    style={{ padding: "0.25rem 0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface)" }}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    {currentUser.role === 'superadmin' && <option value="superadmin">Superadmin</option>}
                  </select>
                </td>
                <td style={{ padding: "1rem" }}>{new Date(u.date_joined).toLocaleDateString()}</td>
                <td style={{ padding: "1rem", textAlign: "right" }}>
                  <button 
                    onClick={() => handleDelete(u.id)}
                    className="btn" 
                    style={{ background: "#EF4444", color: "white", padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                    disabled={currentUser.role !== 'superadmin' && u.role === 'superadmin'}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
