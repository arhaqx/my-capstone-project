import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus riwayat ini?")) {
      try {
        await API.delete(`/history/${id}/`);
        setHistory(history.filter((item) => item.id !== id));
      } catch (err) {
        console.error("Gagal menghapus", err);
        alert("Gagal menghapus riwayat.");
      }
    }
  };

  const getColor = (category) => {
    const catLower = (category || "").toLowerCase();
    if (catLower.includes("minimal") || catLower.includes("normal")) return "#10B981"; 
    if (catLower.includes("mild") || catLower.includes("ringan")) return "#F59E0B";
    if (catLower.includes("moderate") || catLower.includes("sedang")) return "#F97316"; 
    if (catLower.includes("severe") || catLower.includes("berat")) return "#EF4444"; 
    return "var(--primary)";
  };

  const chartData = [...history].reverse().map(item => {
    const d = new Date(item.created_at);
    return {
      uniqueLabel: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      score: item.score,
      category: item.category,
      fullDate: d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card" style={{ padding: "1rem", border: `2px solid ${getColor(data.category)}` }}>
          <p style={{ margin: 0, fontWeight: "bold", color: "var(--text-main)" }}>{data.fullDate}</p>
          <p style={{ margin: "0.5rem 0 0", color: getColor(data.category) }}>Kategori: <span style={{textTransform: "capitalize"}}>{data.category}</span></p>
          <p style={{ margin: 0, fontWeight: "bold", fontSize: "1.2rem", color: "var(--text-main)" }}>Skor: {data.score}</p>
        </div>
      );
    }
    return null;
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
          <>
            <div className="glass-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
              <h3 style={{ color: "var(--text-main)", marginBottom: "1.5rem" }}>Grafik Skor PHQ-9</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis 
                      dataKey="uniqueLabel" 
                      stroke="var(--text-muted)" 
                      tickFormatter={(val) => {
                        const parts = val.split(' ');
                        return parts.length >= 2 ? `${parts[0]} ${parts[1]}` : val;
                      }}
                      tick={{fill: 'var(--text-muted)'}} 
                    />
                    <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} domain={[0, 27]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

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
                  <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--text-main)", marginBottom: "0.5rem" }}>{item.score}</p>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    style={{ background: "transparent", border: "none", color: "#EF4444", fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline" }}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}