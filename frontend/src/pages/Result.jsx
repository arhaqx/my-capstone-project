import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  // Get data from location state or fallback to local storage if available
  const resultData = location.state?.result || JSON.parse(localStorage.getItem("result"));
  
  const [articles, setArticles] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    if (resultData) {
      localStorage.setItem("result", JSON.stringify(resultData));
    }
  }, [resultData]);

  useEffect(() => {
    if (!resultData?.category) {
      setLoadingNews(false);
      return;
    }

    setLoadingNews(true);
    API.get(`/news/?category=${resultData.category}`)
      .then((res) => {
        setArticles(res.data.articles || []);
      })
      .catch((err) => {
        console.error("Error fetching news:", err);
      })
      .finally(() => {
        setLoadingNews(false);
      });
  }, [resultData?.category]);

  if (!resultData) {
    return (
      <div className="container animate-fade-in" style={{ textAlign: "center", marginTop: "4rem" }}>
        <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>Tidak ada data hasil tes yang ditemukan.</p>
        <button onClick={() => navigate("/dashboard")} className="btn btn-primary">
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  const getColor = (category) => {
    const catLower = (category || "").toLowerCase();
    if (catLower.includes("minimal") || catLower.includes("normal")) return "#10B981"; // Emerald
    if (catLower.includes("mild") || catLower.includes("ringan")) return "#F59E0B"; // Amber
    if (catLower.includes("moderate") || catLower.includes("sedang")) return "#F97316"; // Orange
    if (catLower.includes("severe") || catLower.includes("berat")) return "#EF4444"; // Red
    return "var(--primary)";
  };

  const scoreColor = getColor(resultData.category);

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: "4rem" }}>
      <div className="glass-card" style={{ padding: "3rem", maxWidth: "800px", margin: "0 auto" }}>
        
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ color: "var(--text-main)", marginBottom: "0.5rem" }}>Hasil Evaluasi Kesehatan Mental</h2>
          <p style={{ color: "var(--text-muted)" }}>Berdasarkan analisis LLM terhadap tes PHQ-9 Anda</p>
        </div>

        {/* Highlight Score & Category */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          padding: "2rem", 
          background: "var(--surface)", 
          borderRadius: "var(--radius-xl)", 
          boxShadow: "var(--shadow-md)",
          border: `2px solid ${scoreColor}40`,
          marginBottom: "2rem"
        }}>
          <h1 style={{ fontSize: "3rem", color: scoreColor, marginBottom: "0.5rem", textTransform: "capitalize" }}>
            {resultData.category}
          </h1>
          <div style={{ fontSize: "1.25rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Skor Total: <span style={{ fontWeight: "bold", color: "var(--text-main)" }}>{resultData.total_score}</span> / 27
          </div>
          <p style={{ textAlign: "center", fontSize: "1.1rem", lineHeight: "1.6", color: "var(--text-main)", maxWidth: "600px" }}>
            {resultData.interpretation}
          </p>
        </div>

        {/* Artikel Relevan */}
        <div style={{ marginBottom: "3rem" }}>
          <h3 style={{ marginBottom: "1.5rem", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.5rem" }}>📰</span> Rekomendasi Artikel
          </h3>
          
          {loadingNews ? (
            <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Memuat artikel yang relevan...</p>
          ) : articles.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Tidak ada artikel relevan yang ditemukan saat ini.</p>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {articles.map((article, idx) => (
                <a 
                  key={idx} 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    display: "block", 
                    textDecoration: "none", 
                    background: "var(--surface)", 
                    padding: "1.5rem", 
                    borderRadius: "var(--radius-lg)", 
                    boxShadow: "var(--shadow-sm)",
                    border: "1px solid var(--border)",
                    transition: "transform 0.2s, box-shadow 0.2s"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
                >
                  <h4 style={{ color: "var(--primary)", marginBottom: "0.5rem" }}>{article.title}</h4>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.5" }}>{article.description}</p>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button onClick={() => navigate("/dashboard")} className="btn btn-primary" style={{ flex: 1, maxWidth: "250px" }}>
            Ke Dashboard
          </button>
          <button onClick={() => navigate("/history")} className="btn" style={{ flex: 1, maxWidth: "250px", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-main)" }}>
            Lihat Riwayat
          </button>
        </div>

        {/* Disclaimer */}
        <div style={{ marginTop: "2rem", padding: "1rem", background: "rgba(239, 68, 68, 0.1)", borderRadius: "var(--radius-md)", borderLeft: "4px solid #EF4444" }}>
          <p style={{ fontSize: "0.9rem", color: "var(--text-main)", margin: 0 }}>
            <strong>Disclaimer:</strong> Hasil analisis ini dihasilkan oleh AI (Large Language Model) dan metode asesmen mandiri. Ini <strong>bukanlah diagnosis medis atau psikologis resmi</strong>. Jika Anda merasa sangat tertekan atau memiliki pikiran untuk menyakiti diri sendiri, segera hubungi profesional kesehatan mental atau layanan darurat.
          </p>
        </div>

      </div>
    </div>
  );
}