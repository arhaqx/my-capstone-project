import { useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleLogin = async () => {
    try {
      const res = await API.post(
        "/auth/login/",
        form
      );

      localStorage.setItem(
        "token",
        res.data.access
      );

      alert("Login berhasil!");

      window.location.href = "/dashboard";

    } catch (err) {

      console.log(err);

      if (err.response?.data) {
        alert(JSON.stringify(err.response.data));
        } else {
        alert("Login gagal");
      }
    }
  };

  return (
    <div className="auth-container">

      <div className="auth-card">

        <h1>Heal Space</h1>

        <p className="subtitle">
          Monitor your mental wellness safely
        </p>

        <input
          className="auth-input"
          placeholder="Username"
          onChange={(e) =>
            setForm({
              ...form,
              username: e.target.value,
            })
          }
        />

        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />

        <button
          className="auth-button"
          onClick={handleLogin}
        >
          Login
        </button>

        <p className="auth-switch">
          Belum punya akun?
          <Link to="/register">
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}