import { useState, useEffect } from "react";
import API from "../../services/api";

export default function AdminHighRisk() {
  const [highRiskCases, setHighRiskCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHighRisk = async () => {
      try {
        const res = await API.get("/admin/severe-detection/");
        setHighRiskCases(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHighRisk();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ marginBottom: "2rem", padding: "1.5rem", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "var(--radius-md)" }}>
        <h2 style={{ color: "#991B1B", margin: "0 0 0.5rem 0" }}>⚠ High Risk Monitoring Panel</h2>
        <p style={{ margin: 0, color: "#B91C1C" }}>Panel ini menampilkan pengguna dengan indikasi <strong>Severe</strong> dan <strong>Moderate</strong> untuk pemantauan intensif.</p>
      </div>

      <div className="glass-card animate-fade-in" style={{ padding: "2rem" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                <th style={{ padding: "1rem" }}>User</th>
                <th style={{ padding: "1rem" }}>Category</th>
                <th style={{ padding: "1rem" }}>Score</th>
                <th style={{ padding: "1rem" }}>Last Check</th>
                <th style={{ padding: "1rem", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {highRiskCases.map((h) => (
                <tr key={h.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "1rem", fontWeight: "600" }}>{h.username}</td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{ 
                      padding: "0.25rem 0.5rem", 
                      borderRadius: "1rem", 
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      backgroundColor: h.category === 'Severe' ? '#FEE2E2' : '#FEF3C7',
                      color: h.category === 'Severe' ? '#991B1B' : '#92400E'
                    }}>
                      {h.category}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", fontWeight: "bold", color: h.category === 'Severe' ? '#991B1B' : '#92400E' }}>{h.total_score}</td>
                  <td style={{ padding: "1rem" }}>{new Date(h.created_at).toLocaleString()}</td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    <button className="btn btn-primary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {highRiskCases.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                    Tidak ada data High Risk saat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
