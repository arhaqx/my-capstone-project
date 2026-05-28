import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { parseJwt } from "./AdminRoute";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = token ? parseJwt(token) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Users", path: "/admin/users" },
    { name: "History", path: "/admin/history" },
    { name: "High Risk", path: "/admin/severe" },
    { name: "Articles", path: "/admin/articles" }
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>
      {/* Sidebar */}
      <div style={{ width: "250px", backgroundColor: "var(--surface)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ color: "var(--primary)", margin: 0, fontSize: "1.5rem" }}>HealSpace Admin</h2>
        </div>
        <nav style={{ flex: 1, padding: "1rem 0" }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {navItems.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  style={{
                    display: "block",
                    padding: "1rem 1.5rem",
                    textDecoration: "none",
                    color: location.pathname === item.path ? "var(--primary)" : "var(--text-muted)",
                    backgroundColor: location.pathname === item.path ? "rgba(102, 126, 234, 0.1)" : "transparent",
                    borderLeft: location.pathname === item.path ? "4px solid var(--primary)" : "4px solid transparent",
                    fontWeight: location.pathname === item.path ? "600" : "normal"
                  }}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{ padding: "1.5rem", borderTop: "1px solid var(--border)" }}>
          <div style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
            Login sebagai: <br/>
            <strong>{user?.username || "Admin"}</strong> ({user?.role})
          </div>
          <button onClick={handleLogout} className="btn" style={{ width: "100%", backgroundColor: "var(--border)", color: "var(--text-main)" }}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header style={{ height: "60px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 2rem", backgroundColor: "var(--surface)" }}>
          <h3 style={{ margin: 0 }}>Admin Panel</h3>
        </header>
        <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
