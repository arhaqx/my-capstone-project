import { useState, useRef, useEffect } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { useSettings } from "../contexts/SettingsContext";

export default function Chat() {
  const { t, language } = useSettings();
  const [messages, setMessages] = useState([
    { role: "model", text: t("chatGreeting") }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messages.length === 1 && messages[0].role === "model") {
      setMessages([{ role: "model", text: t("chatGreeting") }]);
    }
  }, [language, t, messages.length]);

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
      const res = await API.post("/chat/", { messages: newMessages, language });
      setMessages([...newMessages, res.data]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: "model", text: t("chatError") }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container animate-fade-in" style={{ paddingBottom: "4rem", height: "calc(100vh - 80px)", display: "flex", flexDirection: "column" }}>
        
        <div style={{ marginBottom: "1rem" }}>
          <h1 style={{ color: "var(--text-main)", marginBottom: "0.5rem" }}>{t("chatTitle")}</h1>
          <p style={{ color: "var(--text-muted)" }}>{t("chatDesc")}</p>
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
                    backgroundColor: msg.role === "user" ? "var(--primary)" : "var(--chat-bubble-bg)",
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
                <div style={{ padding: "1rem 1.5rem", borderRadius: "1.5rem", backgroundColor: "var(--chat-bubble-bg)", color: "var(--text-muted)", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <div className="dot-pulse"></div> {t("chatTyping")}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: "1rem", borderTop: "1px solid var(--border)", background: "var(--chat-input-bg)" }}>
            <form onSubmit={handleSend} style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("chatPlaceholder")}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: "1rem 1.5rem",
                  borderRadius: "2rem",
                  border: "1px solid var(--border)",
                  outline: "none",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                  backgroundColor: "var(--chat-input)",
                  color: "var(--text-main)"
                }}
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="btn btn-primary"
                style={{ borderRadius: "2rem", padding: "0 1.5rem" }}
              >
                {t("chatSend")}
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </>
  );
}
