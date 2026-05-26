import { useState, useRef, useEffect } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "model", text: "Halo! Saya MindCare AI. Ada yang ingin kamu ceritakan atau keluhkan hari ini? Saya di sini siap mendengarkan." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input.trim() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await API.post("/chat/", { messages: newMessages });
      setMessages([...newMessages, res.data]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: "model", text: "Maaf, terjadi kesalahan saat menghubungi server. Mohon coba beberapa saat lagi." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container animate-fade-in" style={{ paddingBottom: "4rem", height: "calc(100vh - 80px)", display: "flex", flexDirection: "column" }}>
        
        <div style={{ marginBottom: "1rem" }}>
          <h1 style={{ color: "var(--text-main)", marginBottom: "0.5rem" }}>Konseling AI</h1>
          <p style={{ color: "var(--text-muted)" }}>Teman curhat virtual yang siap mendengarkan 24/7 tanpa menghakimi.</p>
        </div>

        <div className="glass-card" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          
          <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: "flex", 
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start" 
                }}
              >
                <div 
                  style={{
                    maxWidth: "75%",
                    padding: "1rem 1.5rem",
                    borderRadius: "1.5rem",
                    borderBottomRightRadius: msg.role === "user" ? "0.25rem" : "1.5rem",
                    borderBottomLeftRadius: msg.role === "model" ? "0.25rem" : "1.5rem",
                    backgroundColor: msg.role === "user" ? "var(--primary)" : "#F1F5F9",
                    color: msg.role === "user" ? "white" : "var(--text-main)",
                    boxShadow: "var(--shadow-sm)",
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap"
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ padding: "1rem 1.5rem", borderRadius: "1.5rem", backgroundColor: "#F1F5F9", color: "var(--text-muted)", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <div className="dot-pulse"></div> MindCare AI sedang mengetik...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: "1rem", borderTop: "1px solid var(--border)", background: "rgba(255,255,255,0.5)" }}>
            <form onSubmit={handleSend} style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ketik pesan Anda di sini..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: "1rem 1.5rem",
                  borderRadius: "2rem",
                  border: "1px solid var(--border)",
                  outline: "none",
                  fontSize: "1rem",
                  fontFamily: "inherit"
                }}
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="btn btn-primary"
                style={{ borderRadius: "2rem", padding: "0 1.5rem" }}
              >
                Kirim
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </>
  );
}
