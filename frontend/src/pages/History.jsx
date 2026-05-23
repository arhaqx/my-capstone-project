import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/history/")
      .then((res) => {
        setHistory(res.data);
      })
      .catch((err) => {
        console.error(err.response);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getColor = (category) => {
    const catLower = (category || "").toLowerCase();
    if (catLower.includes("minimal") || catLower.includes("normal")) return "#10B981"; 
    if (catLower.includes("mild") || catLower.includes("ringan")) return "#F59E0B";
    if (catLower.includes("moderate") || catLower.includes("sedang")) return "#F97316"; 
    if (catLower.includes("severe") || catLower.includes("berat")) return "#EF4444"; 
    return "var(--primary)";
  };

  return (
    <>
      <Navbar />
      <div className="container animate-fade-in" style={{ paddingBottom: "4rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ color: "var(--text-main)", marginBottom: "0.5rem" }}>Riwayat Asesmen</h1>
            <p style={{ color: "var(--text-muted)" }}>Lacak perkembangan kesehatan mental Anda dari waktu ke waktu.</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ color: "var(--text-muted)" }}>Memuat riwayat Anda...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
            <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", marginBottom: "1.5rem" }}>Belum ada data tes yang ditemukan.</p>
            <button onClick={() => window.location.href = "/test"} className="btn btn-primary">
              Mulai Tes Pertama Anda
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {history.map((item, i) => (
              <div
                key={i}
                className="glass-card"
                style={{
                  padding: "1.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderLeft: `6px solid ${getColor(item.category)}`
                }}
              >
                <div>
                  <h3 style={{ textTransform: "capitalize", color: getColor(item.category), marginBottom: "0.25rem" }}>
                    {item.category}
                  </h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    Tanggal: {new Date(item.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Skor Total</p>
                  <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--text-main)" }}>{item.score}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}