import { useState } from "react";
import { useSettings } from "../contexts/SettingsContext";

export default function EmergencyButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useSettings();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "#EF4444",
          color: "white",
          border: "none",
          boxShadow: "0 4px 14px 0 rgba(239, 68, 68, 0.39)",
          cursor: "pointer",
          zIndex: 999,
          fontSize: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "pulse-slow 2s infinite"
        }}
        title={t("sosTitle")}
      >
        🆘
      </button>

      {isOpen && (
        <div 
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem"
          }}
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="glass-card animate-fade-in"
            style={{ 
              maxWidth: "500px", 
              width: "100%", 
              padding: "2rem",
              position: "relative",
              borderTop: "6px solid #EF4444"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "transparent",
                border: "none",
                fontSize: "1.2rem",
                cursor: "pointer",
                color: "var(--text-muted)"
              }}
            >
              ✕
            </button>
            
            <h2 style={{ color: "#EF4444", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {t("sosHeader")}
            </h2>
            
            <p style={{ color: "var(--text-main)", marginBottom: "1.5rem", lineHeight: 1.5 }}>
              {t("sosDesc")}
            </p>

            <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "1rem" }}>
              <li style={{ background: "rgba(239, 68, 68, 0.1)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                <h4 style={{ color: "#EF4444", marginBottom: "0.25rem" }}>Layanan Sejiwa (Kemenkes RI)</h4>
                <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: "bold", color: "#EF4444" }}>Call: 119 (Ekstensi 8)</p>
              </li>
              <li style={{ background: "var(--surface)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                <h4 style={{ color: "var(--text-main)", marginBottom: "0.25rem" }}>LISA (Layanan Dukungan Psikososial)</h4>
                <p style={{ margin: 0, fontWeight: "500", color: "var(--text-main)" }}>WA/Call: 08113855472</p>
              </li>
              <li style={{ background: "var(--surface)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                <h4 style={{ color: "var(--text-main)", marginBottom: "0.25rem" }}>Yayasan Pulih</h4>
                <p style={{ margin: 0, fontWeight: "500", color: "var(--text-main)" }}>Call: (021) 78842580</p>
              </li>
            </ul>

            <button 
              className="btn"
              onClick={() => setIsOpen(false)}
              style={{ width: "100%", marginTop: "1.5rem", background: "var(--border)", color: "var(--text-main)" }}
            >
              {t("sosClose")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
