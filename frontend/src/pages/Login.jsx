import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    
    try {
      const res = await API.post("/auth/login/", form);
      localStorage.setItem("token", res.data.access);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        setErrorMsg("Kredensial tidak valid. Silakan coba lagi.");
      } else {
        setErrorMsg("Terjadi kesalahan. Pastikan server berjalan.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div className="glass-card animate-fade-in" style={{ width: "100%", maxWidth: "420px", padding: "3rem 2.5rem" }}>
        
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ color: "var(--primary)", fontSize: "2rem", marginBottom: "0.5rem" }}>MindCare</h1>
          <p style={{ color: "var(--text-muted)" }}>Selamat datang kembali! Silakan login untuk melanjutkan.</p>
        </div>

        {errorMsg && (
          <div style={{ padding: "0.75rem", marginBottom: "1.5rem", background: "#FEE2E2", color: "#B91C1C", borderRadius: "var(--radius-md)", fontSize: "0.9rem", textAlign: "center" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "500", color: "var(--text-main)" }}>Username</label>
            <input
              style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", outline: "none", fontSize: "1rem", fontFamily: "inherit" }}
              placeholder="Masukkan username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "500", color: "var(--text-main)" }}>Password</label>
            <input
              style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", outline: "none", fontSize: "1rem", fontFamily: "inherit" }}
              type="password"
              placeholder="Masukkan password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", fontSize: "1rem" }} disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "2rem", color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Belum punya akun? <Link to="/register" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>Daftar sekarang</Link>
        </p>

      </div>
    </div>
  );
}