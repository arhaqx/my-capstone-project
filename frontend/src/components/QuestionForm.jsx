import { useState } from "react";
import API from "../services/api";

export default function QuestionForm() {
  const questions = [
    "Seberapa sering Anda merasa tidak tertarik atau tidak bersemangat melakukan aktivitas?",
    "Seberapa sering Anda merasa sedih, murung, atau putus asa?",
    "Seberapa sering Anda mengalami kesulitan tidur atau tidur berlebihan?",
    "Seberapa sering Anda merasa lelah atau kurang energi?",
  ];

  const options = [
    { label: "Tidak pernah", value: 0 },
    { label: "Beberapa hari", value: 1 },
    { label: "Lebih dari setengah hari", value: 2 },
    { label: "Hampir setiap hari", value: 3 },
  ];

  const [answers, setAnswers] = useState(
    questions.map(() => ({ score: "", text: "" }))
  );

  const handleScoreChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index].score = value;
    setAnswers(newAnswers);
  };

  const handleTextChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index].text = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.some(a => a.score === "")) {
      alert("Semua pertanyaan harus dipilih");
      return;
    }

    try {
      const res = await API.post("/predict-multi/", {
        answers: answers,
      });

      localStorage.setItem("result", JSON.stringify(res.data));
      window.location.href = "/result";
    } catch (err) {
      console.log(err.response);
      alert("Gagal submit");
    }
  };

  return (
    <div>
      <h2>Self Check</h2>

      {questions.map((q, i) => (
        <div key={i} style={{ marginBottom: "20px" }}>
          <p><strong>{q}</strong></p>

          <select
            value={answers[i].score}
            onChange={(e) =>
              handleScoreChange(i, parseInt(e.target.value))
            }
          >
            <option value="">-- Pilih jawaban --</option>
            {options.map((opt, idx) => (
              <option key={idx} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <br />

          <input
            placeholder="Tambahkan penjelasan (opsional)"
            value={answers[i].text}
            onChange={(e) => handleTextChange(i, e.target.value)}
            style={{ marginTop: "8px", width: "100%" }}
          />
        </div>
      ))}

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}