import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const phq9Questions = [
  "Kurang tertarik atau tidak bersemangat melakukan aktivitas sehari-hari?",
  "Merasa sedih, murung, atau putus asa?",
  "Mengalami kesulitan tidur atau tidur berlebihan?",
  "Merasa lelah atau kurang energi?",
  "Nafsu makan menurun atau meningkat berlebihan?",
  "Merasa tidak percaya diri atau merasa gagal?",
  "Sulit berkonsentrasi saat belajar, bekerja, atau melakukan aktivitas?",
  "Bergerak atau berbicara terlalu lambat, atau justru merasa gelisah dan sulit diam?",
  "Memiliki pikiran bahwa diri Anda lebih baik tidak ada atau menyakiti diri sendiri?"
];

const options = [
  { label: "Tidak Pernah", value: 0 },
  { label: "Beberapa Hari", value: 1 },
  { label: "Sering", value: 2 },
  { label: "Hampir Setiap Hari", value: 3 }
];

const Test = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState(Array(9).fill(""));
  const [loading, setLoading] = useState(false);

  const handleSelect = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = parseInt(value);
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (answers.includes("")) {
      alert("Harap isi semua pertanyaan sebelum mengirimkan asesmen.");
      return;
    }

    setLoading(true);

    const formattedAnswers = answers.map((score, index) => ({
      score: score,
      text: phq9Questions[index]
    }));

    try {
      const response = await API.post("/predict-multi/", {
        answers: formattedAnswers
      });
      // Pass the result to Result page
      navigate("/result", { state: { result: response.data } });
    } catch (error) {
      console.error("Error submitting test:", error);
      const backendError = error.response?.data?.error;
      alert(backendError ? `Terjadi kesalahan: ${backendError}` : "Terjadi kesalahan saat memproses tes. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in">
      <div className="glass-card" style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", color: "var(--primary)", marginBottom: "0.5rem" }}>Self-Check Kesehatan Mental</h2>
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "2rem" }}>
          Jawablah pertanyaan berikut sesuai dengan apa yang Anda rasakan selama 2 minggu terakhir.
        </p>

        <form onSubmit={handleSubmit}>
          {phq9Questions.map((q, index) => (
            <div key={index} style={{ marginBottom: "1.5rem", padding: "1.5rem", background: "var(--surface)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-sm)" }}>
              <p style={{ fontWeight: "600", marginBottom: "1rem", color: "var(--text-main)" }}>{index + 1}. {q}</p>
              <select
                style={{
                  width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)", outline: "none",
                  fontFamily: "inherit", fontSize: "1rem", cursor: "pointer",
                  backgroundColor: "var(--chat-input)", color: "var(--text-main)"
                }}
                value={answers[index]}
                onChange={(e) => handleSelect(index, e.target.value)}
              >
                <option value="" disabled>-- Pilih Jawaban --</option>
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          ))}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "1rem", fontSize: "1.1rem" }}
            disabled={loading}
          >
            {loading ? "Menganalisis dengan LLM..." : "Kirim Jawaban & Lihat Hasil"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Test;
