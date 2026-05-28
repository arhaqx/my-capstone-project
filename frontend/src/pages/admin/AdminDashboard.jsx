import { useState, useEffect } from "react";
import API from "../../services/api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/admin/dashboard/");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!stats) return <div>Gagal memuat data.</div>;

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const pieData = Object.keys(stats.categories).map(key => ({
    name: key,
    value: stats.categories[key]
  }));

  return (
    <div>
      <h2 style={{ marginBottom: "2rem" }}>Dashboard Overview</h2>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--text-muted)" }}>Total Users</h4>
          <h2 style={{ margin: 0, fontSize: "2rem", color: "var(--primary)" }}>{stats.total_users}</h2>
        </div>
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--text-muted)" }}>Total Assessments</h4>
          <h2 style={{ margin: 0, fontSize: "2rem", color: "var(--primary)" }}>{stats.total_assessments}</h2>
        </div>
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--text-muted)" }}>Severe Cases</h4>
          <h2 style={{ margin: 0, fontSize: "2rem", color: "#EF4444" }}>{stats.severe_cases}</h2>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2rem" }}>
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h4 style={{ marginBottom: "1rem" }}>Mental Category Distribution</h4>
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h4 style={{ marginBottom: "1rem" }}>Recent Activity (Last 7 Days)</h4>
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.recent_activity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }} />
                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
