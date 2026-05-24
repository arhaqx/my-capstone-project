import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="header">
      <Link to="/dashboard" style={{ textDecoration: "none" }}>
        <div className="header-brand">HealSpace</div>
      </Link>

      <div style={{ display: "flex", gap: "1rem" }}>
        <button 
          onClick={() => navigate("/dashboard")} 
          className="btn" 
          style={{ background: "transparent", color: "var(--text-main)", padding: "0.5rem 1rem" }}
        >
          Dashboard
        </button>

        <button 
          onClick={() => navigate("/history")} 
          className="btn" 
          style={{ background: "transparent", color: "var(--text-main)", padding: "0.5rem 1rem" }}
        >
          Riwayat
        </button>

        <button 
          onClick={handleLogout} 
          className="btn btn-primary" 
          style={{ padding: "0.5rem 1.5rem" }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}