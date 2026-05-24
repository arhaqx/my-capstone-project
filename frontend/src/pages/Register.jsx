import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      await API.post("/auth/register/", formData);
      alert("Pendaftaran berhasil! Silakan login.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      if (error.response?.data) {
        setErrorMsg(typeof error.response.data === 'object' ? JSON.stringify(error.response.data) : "Pendaftaran gagal. Periksa kembali data Anda.");
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
          <h1 style={{ color: "var(--primary)", fontSize: "2rem", marginBottom: "0.5rem" }}>Buat Akun</h1>
          <p style={{ color: "var(--text-muted)" }}>Bergabunglah dengan HealSpace hari ini.</p>
        </div>

        {errorMsg && (
          <div style={{ padding: "0.75rem", marginBottom: "1.5rem", background: "#FEE2E2", color: "#B91C1C", borderRadius: "var(--radius-md)", fontSize: "0.9rem", textAlign: "center" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "500", color: "var(--text-main)" }}>Username</label>
            <input
              style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", outline: "none", fontSize: "1rem", fontFamily: "inherit" }}
              type="text"
              name="username"
              placeholder="Pilih username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "500", color: "var(--text-main)" }}>Email</label>
            <input
              style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", outline: "none", fontSize: "1rem", fontFamily: "inherit" }}
              type="email"
              name="email"
              placeholder="Masukkan email Anda"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "500", color: "var(--text-main)" }}>Password</label>
            <input
              style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", outline: "none", fontSize: "1rem", fontFamily: "inherit" }}
              type="password"
              name="password"
              placeholder="Buat password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", fontSize: "1rem" }} disabled={loading}>
            {loading ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "2rem", color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Sudah punya akun? <Link to="/login" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>Masuk</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;