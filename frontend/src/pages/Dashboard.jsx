import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="container animate-fade-in" style={{ marginTop: "2rem" }}>
        
        {/* Welcome Section */}
        <div className="glass-card" style={{ padding: "3rem", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ color: "var(--primary)", marginBottom: "1rem", fontSize: "2.5rem" }}>
              Selamat Datang di HealSpace
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", maxWidth: "600px", lineHeight: "1.6" }}>
              Kami menyediakan alat bantu asesmen mandiri berbasis AI untuk memantau kesehatan mental Anda. Mulai evaluasi Anda sekarang untuk mendapatkan analisis dan rekomendasi yang dipersonalisasi.
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <button 
              onClick={() => navigate("/test")} 
              className="btn btn-primary" 
              style={{ fontSize: "1.2rem", padding: "1rem 2rem", borderRadius: "var(--radius-xl)" }}
            >
              Mulai Asesmen
            </button>
          </div>
        </div>

        {/* Feature Cards Section */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          <div 
            className="glass-card" 
            style={{ padding: "2rem", cursor: "pointer", transition: "transform 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            onClick={() => navigate("/history")}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📈</div>
            <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem" }}>Riwayat Asesmen</h3>
            <p style={{ color: "var(--text-muted)", lineHeight: "1.5" }}>Pantau perkembangan kesehatan mental Anda dari waktu ke waktu melalui grafik dan histori tes sebelumnya.</p>
          </div>

          <div 
            className="glass-card" 
            style={{ padding: "2rem", cursor: "pointer", transition: "transform 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            onClick={() => navigate("/test")}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🧠</div>
            <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem" }}>Analisis AI</h3>
            <p style={{ color: "var(--text-muted)", lineHeight: "1.5" }}>Dapatkan wawasan mendalam (Natural Language Processing) dan rekomendasi bacaan berdasarkan kondisi Anda saat ini.</p>
          </div>
        </div>

      </div>
    </>
  );
}