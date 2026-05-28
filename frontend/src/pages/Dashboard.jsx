import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useSettings } from "../contexts/SettingsContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useSettings();

  return (
    <>
      <Navbar />
      <div className="container animate-fade-in" style={{ marginTop: "2rem" }}>
        
        {/* Welcome Section */}
        <div className="glass-card" style={{ padding: "3rem", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ color: "var(--primary)", marginBottom: "1rem", fontSize: "2.5rem" }}>
              {t("dashWelcome")}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", maxWidth: "600px", lineHeight: "1.6" }}>
              {t("dashDesc")}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <button 
              onClick={() => navigate("/test")} 
              className="btn btn-primary" 
              style={{ fontSize: "1.2rem", padding: "1rem 2rem", borderRadius: "var(--radius-xl)" }}
            >
              {t("dashStartTest")}
            </button>
          </div>
        </div>

        {/* Feature Cards Section */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
          <div 
            className="glass-card" 
            style={{ padding: "2rem", cursor: "pointer", transition: "transform 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            onClick={() => navigate("/history")}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📈</div>
            <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem" }}>{t("dashHistoryTitle")}</h3>
            <p style={{ color: "var(--text-muted)", lineHeight: "1.5" }}>{t("dashHistoryDesc")}</p>
          </div>

          <div 
            className="glass-card" 
            style={{ padding: "2rem", cursor: "pointer", transition: "transform 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            onClick={() => navigate("/test")}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🧠</div>
            <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem" }}>{t("dashAITitle")}</h3>
            <p style={{ color: "var(--text-muted)", lineHeight: "1.5" }}>{t("dashAIDesc")}</p>
          </div>

          <div 
            className="glass-card" 
            style={{ padding: "2rem", cursor: "pointer", transition: "transform 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            onClick={() => navigate("/breathing")}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🌬️</div>
            <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem" }}>{t("dashBreatheTitle")}</h3>
            <p style={{ color: "var(--text-muted)", lineHeight: "1.5" }}>{t("dashBreatheDesc")}</p>
          </div>
        </div>

      </div>
    </>
  );
}