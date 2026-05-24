import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function Breathing() {
  const [phase, setPhase] = useState('idle'); // idle, inhale, hold, exhale
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let timer;
    if (isActive) {
      if (timeLeft > 0) {
        timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      } else {
        // Switch phases
        if (phase === 'inhale') {
          setPhase('hold');
          setTimeLeft(4); // Hold for 4 seconds
        } else if (phase === 'hold') {
          setPhase('exhale');
          setTimeLeft(4); // Exhale for 4 seconds
        } else if (phase === 'exhale' || phase === 'idle') {
          setPhase('inhale');
          setTimeLeft(4); // Inhale for 4 seconds
        }
      }
    }
    return () => clearTimeout(timer);
  }, [isActive, phase, timeLeft]);

  const toggleBreathing = () => {
    if (isActive) {
      setIsActive(false);
      setPhase('idle');
      setTimeLeft(0);
    } else {
      setIsActive(true);
      setPhase('inhale');
      setTimeLeft(4);
    }
  };

  const getInstructionText = () => {
    if (!isActive) return "Mulai Relaksasi";
    if (phase === 'inhale') return "Tarik Napas...";
    if (phase === 'hold') return "Tahan...";
    if (phase === 'exhale') return "Hembuskan...";
    return "";
  };

  return (
    <>
      <Navbar />
      <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 100px)' }}>
        
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h1 style={{ color: "var(--text-main)", marginBottom: "0.5rem" }}>Latihan Relaksasi</h1>
          <p style={{ color: "var(--text-muted)", maxWidth: "500px", margin: "0 auto" }}>
            Ikuti ritme lingkaran di bawah ini untuk mengatur napas. Metode Box Breathing ini terbukti efektif untuk meredakan panik dan cemas.
          </p>
        </div>

        <div style={{ position: "relative", width: "200px", height: "200px", marginBottom: "4rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div 
            className={`breathe-circle ${isActive ? phase : ''}`}
            style={{ 
              width: "200px", 
              height: "200px", 
              position: "absolute",
              zIndex: 1,
              background: !isActive ? 'linear-gradient(135deg, #94A3B8, #64748B)' : undefined
            }}
          ></div>
          <div style={{ zIndex: 2, textAlign: "center", color: "white", pointerEvents: "none" }}>
            <h2 style={{ fontSize: "1.8rem", marginBottom: isActive ? "0.5rem" : "0", textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
              {getInstructionText()}
            </h2>
            {isActive && (
              <p style={{ fontSize: "1.5rem", fontWeight: "bold", textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                {timeLeft}
              </p>
            )}
          </div>
        </div>

        <button 
          onClick={toggleBreathing} 
          className="btn btn-primary"
          style={{ 
            padding: "1rem 3rem", 
            fontSize: "1.2rem", 
            borderRadius: "2rem",
            backgroundColor: isActive ? "#EF4444" : "var(--primary)"
          }}
        >
          {isActive ? "Berhenti" : "Mulai Latihan"}
        </button>

      </div>
    </>
  );
}
