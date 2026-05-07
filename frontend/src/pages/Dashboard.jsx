import QuestionCard from "../components/QuestionCard";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  return (
    <div>
      {/* 🔥 NAVBAR DI ATAS */}
      <Navbar />

      {/* CONTENT */}
      <div style={{ padding: "20px" }}>
        <h1>Dashboard</h1>

        <QuestionForm />
      </div>
    </div>
  );
}