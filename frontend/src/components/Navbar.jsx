import { Link, useNavigate } from "react-router-dom";
import { useSettings } from "../contexts/SettingsContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme, language, toggleLanguage, t } = useSettings();

  const token = localStorage.getItem("token");
  let isAdmin = false;
  if (token) {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      isAdmin = decoded.role === 'admin' || decoded.role === 'superadmin';
    } catch(e) {}
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="header">
      <Link to="/dashboard" style={{ textDecoration: "none" }}>
        <div className="header-brand">HealSpace</div>
      </Link>

      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <button
          onClick={() => navigate("/dashboard")}
          className="btn"
          style={{ background: "transparent", color: "var(--text-main)", padding: "0.5rem 1rem" }}
        >
          {t("navDashboard")}
        </button>

        <button
          onClick={() => navigate("/history")}
          className="btn"
          style={{ background: "transparent", color: "var(--text-main)", padding: "0.5rem 1rem" }}
        >
          {t("navHistory")}
        </button>

        <button
          onClick={() => navigate("/chat")}
          className="btn"
          style={{ background: "transparent", color: "var(--text-main)", padding: "0.5rem 1rem" }}
        >
          {t("navChat")}
        </button>

        <button
          onClick={() => navigate("/breathing")}
          className="btn"
          style={{ background: "transparent", color: "var(--text-main)", padding: "0.5rem 1rem" }}
        >
          {t("navBreathing")}
        </button>

        {isAdmin && (
          <button
            onClick={() => navigate("/admin")}
            className="btn"
            style={{ background: "var(--primary)", color: "white", padding: "0.5rem 1rem", borderRadius: "var(--radius-md)", fontWeight: "600" }}
          >
            Admin Panel
          </button>
        )}
        
        {/* Toggle Theme & Language */}
        <div style={{ display: "flex", gap: "0.5rem", borderLeft: "1px solid var(--border)", paddingLeft: "1rem", marginLeft: "0.5rem" }}>
          <button 
            onClick={toggleTheme}
            className="btn"
            style={{ background: "transparent", color: "var(--text-main)", padding: "0.5rem", fontSize: "1.2rem", border: "1px solid var(--border)", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          
          <button 
            onClick={toggleLanguage}
            className="btn"
            style={{ background: "transparent", color: "var(--text-main)", padding: "0.5rem", fontSize: "1rem", border: "1px solid var(--border)", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}
            title="Switch Language"
          >
            {language.toUpperCase()}
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-primary"
          style={{ padding: "0.5rem 1.5rem", marginLeft: "1rem" }}
        >
          {t("navLogout")}
        </button>
      </div>
    </nav>
  );
}