import { useState, useEffect, useCallback } from "react";
import API from "../../services/api";

export default function AdminHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchHistory = useCallback(async () => {
    try {
      const url = filter ? `/admin/history/?category=${filter}` : `/admin/history/`;
      const res = await API.get(url);
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="glass-card animate-fade-in" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0 }}>History Monitoring</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: "0.5rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--surface)" }}
        >
          <option value="">All Categories</option>
          <option value="Minimal">Minimal</option>
          <option value="Mild">Mild</option>
          <option value="Moderate">Moderate</option>
          <option value="Severe">Severe</option>
        </select>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)" }}>
              <th style={{ padding: "1rem" }}>Date</th>
              <th style={{ padding: "1rem" }}>User</th>
              <th style={{ padding: "1rem" }}>Score</th>
              <th style={{ padding: "1rem" }}>Category</th>
              <th style={{ padding: "1rem" }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "1rem" }}>{new Date(h.created_at).toLocaleString()}</td>
                <td style={{ padding: "1rem" }}>{h.username}</td>
                <td style={{ padding: "1rem" }}>{h.total_score}</td>
                <td style={{ padding: "1rem" }}>
                  <span
                    style={{
                      padding: "0.25rem 0.5rem",
                      borderRadius: "1rem",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      backgroundColor:
                        h.category === "Severe"
                          ? "#FEE2E2"
                          : h.category === "Moderate"
                          ? "#FEF3C7"
                          : h.category === "Mild"
                          ? "#DBEAFE"
                          : "#D1FAE5",
                      color:
                        h.category === "Severe"
                          ? "#991B1B"
                          : h.category === "Moderate"
                          ? "#92400E"
                          : h.category === "Mild"
                          ? "#1E40AF"
                          : "#065F46",
                    }}
                  >
                    {h.category}
                  </span>
                </td>
                <td style={{ padding: "1rem" }}>
                  <details>
                    <summary style={{ cursor: "pointer", color: "var(--primary)" }}>View</summary>
                    <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", background: "var(--bg-main)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
                      {h.answers && h.answers.map((ans, idx) => (
                        <p key={idx} style={{ margin: "0 0 0.5rem 0" }}>
                          <strong>Q:</strong> {ans.text} <br />
                          <strong>Score:</strong> {ans.score}
                        </p>
                      ))}
                    </div>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
