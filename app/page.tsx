"use client";

import { useState, useEffect, useRef } from "react";

const LANGUAGES = ["TypeScript", "JavaScript", "Python", "Rust", "Go", "Java", "C++", "Ruby"];

type ReviewResult = {
  bugs: string[];
  style: string[];
  improvements: string[];
  summary: string;
};

/* ── Floating 3D-ish code icon inside the orb ── */
function OrbProduct() {
  return (
    <div
      style={{
        width: 200,
        height: 200,
        borderRadius: 32,
        background: "linear-gradient(135deg, #c084fc 0%, #f59e0b 40%, #fbbf24 70%, #f97316 100%)",
        boxShadow:
          "0 0 60px rgba(251,191,36,0.5), 0 0 120px rgba(192,132,252,0.3), inset 0 2px 0 rgba(255,255,255,0.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        animation: "floatProduct 6s ease-in-out infinite",
      }}
    >
      {/* Glare */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.2)",
          filter: "blur(12px)",
        }}
      />
      {/* Code brackets icon */}
      <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="rgba(10,0,8,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    </div>
  );
}

export default function Home() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("TypeScript");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToEditor = () => {
    editorRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleReview = async () => {
  if (!code.trim()) return;
  setLoading(true);
  setResult(null);
  try {
    const res = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language }),
    });
    const data = await res.json();
    setResult(data);
  } catch {
    setResult({
      bugs: ["Failed to connect. Please try again."],
      style: [],
      improvements: [],
      summary: "An error occurred while reviewing your code.",
    });
  } finally {
    setLoading(false);
  }
};

  const navBg = scrollY > 10
    ? "rgba(6,0,4,0.92)"
    : "transparent";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #060004; color: #fff; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }

        .serif { font-family: 'Cormorant Garamond', Georgia, serif; }

        @keyframes floatProduct {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-18px) rotate(2deg); }
        }
        @keyframes orbPulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.03); opacity: 1; }
        }
        @keyframes rayRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .fade-up-1 { animation: fadeSlideUp 1s cubic-bezier(.16,1,.3,1) 0.1s both; }
        .fade-up-2 { animation: fadeSlideUp 1s cubic-bezier(.16,1,.3,1) 0.25s both; }
        .fade-up-3 { animation: fadeSlideUp 1s cubic-bezier(.16,1,.3,1) 0.4s both; }
        .fade-up-4 { animation: fadeSlideUp 1s cubic-bezier(.16,1,.3,1) 0.55s both; }
        .fade-up-result { animation: fadeSlideUp 0.6s cubic-bezier(.16,1,.3,1) both; }

        .demo-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 22px; border-radius: 9999px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.85);
          font-size: 0.9rem; font-weight: 500; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          backdrop-filter: blur(10px);
          transition: all 0.2s ease;
        }
        .demo-btn:hover { background: rgba(255,255,255,0.13); border-color: rgba(255,255,255,0.35); color: #fff; }

        .nav-demo-btn {
          display: inline-flex; align-items: center; padding: 9px 22px;
          border-radius: 9999px; border: none;
          background: #1a1a1a; color: #fff;
          font-size: 0.875rem; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.2s ease;
        }
        .nav-demo-btn:hover { background: #2a2a2a; }

        .glass-editor {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.8), 0 0 80px -20px rgba(160,80,220,0.15);
        }

        .review-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 11px 26px; border-radius: 12px; border: none;
          font-size: 0.875rem; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.25s ease;
        }
        .review-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .review-btn:active:not(:disabled) { transform: translateY(0); }

        textarea { font-family: 'DM Mono', 'Fira Code', monospace !important; }
        textarea::placeholder { color: rgba(255,255,255,0.15); }

        select option { background: #0d000c; }

        .result-card {
          border-radius: 16px; padding: 22px;
          backdrop-filter: blur(16px);
        }
      `}</style>

      {/* ═══════════════════ NAVBAR ═══════════════════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        height: 68,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2.5rem",
        background: navBg,
        backdropFilter: scrollY > 10 ? "blur(20px)" : "none",
        borderBottom: scrollY > 10 ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        transition: "all 0.4s ease",
      }}>
        {/* Left */}
        <div style={{ display: "flex", gap: "2rem" }}>
          {["Product", "Resources"].map(l => (
            <a key={l} href="#" style={{
              color: "rgba(255,255,255,0.6)", fontSize: "0.9rem",
              fontWeight: 500, textDecoration: "none", transition: "color 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            >{l}</a>
          ))}
        </div>

        {/* Center logo */}
        <div style={{
          position: "absolute", left: "50%", transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg, #9333ea 0%, #6366f1 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px rgba(147,51,234,0.5)",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <span className="serif" style={{ fontSize: "1.3rem", fontWeight: 700, letterSpacing: "-0.01em", color: "#fff" }}>
            CodeLens
          </span>
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="#" style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.9rem", fontWeight: 500, textDecoration: "none" }}>Login</a>
          <button className="nav-demo-btn">Demo →</button>
        </div>
      </nav>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}>
        {/* ── Background layers — exactly like Clyde video ── */}
        <div style={{ position: "absolute", inset: 0, background: "#060004" }} />

        {/* Warm amber/orange glow — top right, like Clyde */}
        <div style={{
          position: "absolute",
          top: "-10%", right: "-5%",
          width: "55%", height: "65%",
          background: "radial-gradient(ellipse at 70% 20%, rgba(251,146,60,0.45) 0%, rgba(245,158,11,0.25) 30%, rgba(180,80,180,0.15) 60%, transparent 80%)",
          filter: "blur(50px)",
        }} />

        {/* Purple/violet left and center */}
        <div style={{
          position: "absolute",
          top: "20%", left: "-10%",
          width: "60%", height: "70%",
          background: "radial-gradient(ellipse at 30% 50%, rgba(120,40,180,0.4) 0%, rgba(80,20,140,0.2) 50%, transparent 75%)",
          filter: "blur(60px)",
        }} />

        {/* Bottom darkness */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
          background: "linear-gradient(to top, #060004 0%, transparent 100%)",
        }} />

        {/* ── GIANT ORB — center right, like Clyde ── */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-15%, -50%)",
          width: 680, height: 680,
          zIndex: 1,
        }}>
          {/* Outer orb glow ring */}
          <div style={{
            position: "absolute", inset: 0,
            borderRadius: "50%",
            background: "radial-gradient(ellipse at 40% 35%, rgba(200,120,255,0.25) 0%, rgba(160,80,220,0.4) 40%, rgba(100,30,180,0.5) 65%, rgba(40,10,80,0.6) 80%, transparent 100%)",
            animation: "orbPulse 5s ease-in-out infinite",
            boxShadow: "0 0 120px rgba(160,80,220,0.3), 0 0 200px rgba(120,40,200,0.15)",
          }} />

          {/* Light ray streaks inside orb — exactly like Clyde */}
          <div style={{
            position: "absolute", inset: "8%",
            borderRadius: "50%",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", inset: "-50%",
              animation: "rayRotate 12s linear infinite",
            }}>
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
                <div key={i} style={{
                  position: "absolute",
                  top: "50%", left: "50%",
                  width: "50%", height: "1px",
                  transformOrigin: "0 0",
                  transform: `rotate(${deg}deg)`,
                  background: `linear-gradient(to right, rgba(220,170,255,${0.08 + (i % 3) * 0.04}) 0%, transparent 100%)`,
                }} />
              ))}
            </div>
          </div>

          {/* Inner orb — brighter center */}
          <div style={{
            position: "absolute",
            inset: "18%",
            borderRadius: "50%",
            background: "radial-gradient(ellipse at 40% 35%, rgba(230,180,255,0.3) 0%, rgba(180,100,240,0.2) 50%, transparent 80%)",
          }} />

          {/* Product floating in center */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
          }}>
            <OrbProduct />
          </div>
        </div>

        {/* ── HEADING — left aligned, giant, like Clyde ── */}
        <div style={{
          position: "relative", zIndex: 10,
          padding: "0 3rem",
          paddingTop: "68px",
          maxWidth: "100%",
        }}>
          <h1
            className="serif fade-up-1"
            style={{
              fontSize: "clamp(4rem, 9.5vw, 10rem)",
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              maxWidth: "75vw",
              textShadow: "0 2px 60px rgba(0,0,0,0.5)",
            }}
          >
            Ship code with
          </h1>
          <h1
            className="serif fade-up-2"
            style={{
              fontSize: "clamp(4rem, 9.5vw, 10rem)",
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #f0abfc 0%, #c084fc 30%, #a78bfa 60%, #93c5fd 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              maxWidth: "75vw",
              marginBottom: "3rem",
            }}
          >
            confidence.
          </h1>
        </div>

        {/* ── BOTTOM LEFT COPY — like Clyde ── */}
        <div style={{
          position: "absolute",
          bottom: "3.5rem",
          left: "3rem",
          zIndex: 10,
          maxWidth: 300,
        }}>
          <p
            className="fade-up-3"
            style={{
              fontSize: "0.9rem",
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.75,
              marginBottom: "1.5rem",
              fontWeight: 400,
            }}
          >
            Paste any snippet from TypeScript, JavaScript, Python, Rust, Go and more.
            Powered by Claude AI for expert-level code analysis at scale.
          </p>
          <button
            className="demo-btn fade-up-4"
            onClick={scrollToEditor}
          >
            Try it now →
          </button>
        </div>
      </section>

      {/* ═══════════════════ EDITOR SECTION ═══════════════════ */}
      <section
        ref={editorRef}
        style={{
          background: "#040003",
          padding: "7rem 1.5rem 8rem",
          position: "relative",
        }}
      >
        {/* Top glow bleed from hero */}
        <div style={{
          position: "absolute", top: 0, left: "30%",
          width: "40%", height: 300,
          background: "radial-gradient(ellipse at 50% 0%, rgba(147,51,234,0.2) 0%, transparent 70%)",
          filter: "blur(40px)", pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>

          {/* Section header */}
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <p style={{
              fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.14em",
              textTransform: "uppercase", color: "rgba(192,132,252,0.65)",
              marginBottom: "0.75rem",
            }}>AI Code Reviewer</p>
            <h2 className="serif" style={{
              fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700,
              color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1,
            }}>
              Analyze your code, instantly.
            </h2>
          </div>

          {/* ── EDITOR CARD ── */}
          <div className="glass-editor">

            {/* Window chrome bar */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.02)",
            }}>
              {/* Traffic lights */}
              <div style={{ display: "flex", gap: 7 }}>
                {[["#ff5f57", "#e0403a"], ["#febc2e", "#d99c1a"], ["#28c840", "#1da030"]].map(([bg, shadow], i) => (
                  <div key={i} style={{
                    width: 13, height: 13, borderRadius: "50%",
                    background: bg,
                    boxShadow: `0 0 6px ${shadow}88`,
                  }} />
                ))}
              </div>

              {/* Filename */}
              <span style={{
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.22)",
                fontFamily: "'DM Mono', monospace",
              }}>
                {`review.${({ TypeScript: "ts", JavaScript: "js", Python: "py", Rust: "rs", Go: "go", Java: "java", "C++": "cpp", Ruby: "rb" } as Record<string, string>)[language] || "txt"}`}
              </span>

              {/* Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  style={{
                    appearance: "none", background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
                    padding: "5px 28px 5px 10px", fontSize: "0.75rem",
                    color: "rgba(255,255,255,0.65)",
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                    cursor: "pointer", outline: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
                  }}
                >
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>

                {code && (
                  <button
                    onClick={() => { setCode(""); setResult(null); }}
                    style={{
                      fontSize: "0.75rem", color: "rgba(255,255,255,0.3)",
                      background: "transparent", border: "none", cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif", padding: "5px 8px",
                      borderRadius: 6, transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.65)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "transparent"; }}
                  >Clear</button>
                )}
              </div>
            </div>

            {/* Editor body */}
            <div style={{ display: "flex" }}>
              {/* Line numbers */}
              <div style={{
                width: 50, padding: "16px 0", flexShrink: 0,
                borderRight: "1px solid rgba(255,255,255,0.04)",
                userSelect: "none",
              }}>
                {Array.from({ length: Math.max(18, code.split("\n").length + 3) }, (_, i) => (
                  <div key={i} style={{
                    fontSize: "0.7rem", lineHeight: "24px", height: 24,
                    color: "rgba(255,255,255,0.1)",
                    fontFamily: "'DM Mono', monospace",
                    textAlign: "right", paddingRight: 12,
                  }}>{i + 1}</div>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder={`// Paste your ${language} code here…\n// CodeLens will check for bugs, style, and improvements`}
                style={{
                  flex: 1, minHeight: 380,
                  background: "transparent", border: "none", outline: "none",
                  resize: "vertical", fontSize: "0.82rem", lineHeight: "24px",
                  color: "rgba(255,255,255,0.78)",
                  padding: "16px 20px", caretColor: "#c084fc",
                }}
                spellCheck={false}
              />
            </div>

            {/* Footer */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 20px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.01)",
            }}>
              <span style={{
                fontSize: "0.7rem", color: "rgba(255,255,255,0.15)",
                fontFamily: "'DM Mono', monospace",
              }}>
                {code ? `${code.split("\n").length} lines · ${code.length} chars` : "Ready"}
              </span>

              <button
                className="review-btn"
                onClick={handleReview}
                disabled={loading || !code.trim()}
                style={{
                  background: loading || !code.trim()
                    ? "rgba(255,255,255,0.05)"
                    : "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #2563eb 100%)",
                  color: loading || !code.trim() ? "rgba(255,255,255,0.3)" : "#fff",
                  boxShadow: loading || !code.trim()
                    ? "none"
                    : "0 0 28px rgba(124,58,237,0.45), 0 4px 20px rgba(79,70,229,0.3)",
                  cursor: loading || !code.trim() ? "not-allowed" : "pointer",
                  opacity: loading || !code.trim() ? 0.5 : 1,
                }}
              >
                {loading ? (
                  <>
                    <svg style={{ animation: "spin 1s linear infinite" }} width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                      <path d="M4 12a8 8 0 018-8" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Analyzing…
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
                    </svg>
                    Review Code
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ── RESULTS ── */}
          {result && (
            <div style={{
              marginTop: "1.5rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "1rem",
            }}>
              {[
                { title: "Bugs", items: result.bugs || [], empty: "No bugs detected 🎉", color: "#f87171", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.18)", glow: "rgba(239,68,68,0.06)", delay: "0s" },
                { title: "Style Issues", items: result.style || [], empty: "Style looks great ✨", color: "#fbbf24", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.18)", glow: "rgba(245,158,11,0.05)", delay: "0.08s" },
                { title: "Improvements", items: result.improvements || [], empty: "No improvements suggested", color: "#a78bfa", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.18)", glow: "rgba(139,92,246,0.07)", delay: "0.16s" },
              ].map(({ title, items, empty, color, bg, border, glow, delay }) => (
                <div key={title} className="result-card fade-up-result" style={{
                  background: bg, border: `1px solid ${border}`,
                  boxShadow: `0 0 40px ${glow}, 0 8px 32px rgba(0,0,0,0.5)`,
                  animationDelay: delay,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: "rgba(255,255,255,0.04)", border: `1px solid ${border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
                    </div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.78)" }}>{title}</span>
                    {items.length > 0 && (
                      <span style={{
                        marginLeft: "auto", fontSize: "0.7rem", padding: "2px 9px",
                        borderRadius: 9999, background: "rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.35)", fontWeight: 600,
                      }}>{items.length}</span>
                    )}
                  </div>
                  {items.length === 0
                    ? <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.2)", fontStyle: "italic" }}>{empty}</p>
                    : <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
                      {items.map((item, i) => (
                        <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <span style={{ marginTop: 6, width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0, opacity: 0.7 }} />
                          <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.48)", lineHeight: 1.6 }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  }
                </div>
              ))}

              {/* Summary — full width */}
              <div className="result-card fade-up-result" style={{
                gridColumn: "1 / -1", animationDelay: "0.24s",
                background: "rgba(96,165,250,0.07)",
                border: "1px solid rgba(96,165,250,0.16)",
                boxShadow: "0 0 40px rgba(96,165,250,0.05), 0 8px 32px rgba(0,0,0,0.5)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.78)" }}>Summary</span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.48)", lineHeight: 1.75 }}>{result.summary || "No summary available."}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: "#030002", borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "2rem 3rem", display: "flex",
        alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 8,
            background: "linear-gradient(135deg, #9333ea, #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <span className="serif" style={{ fontSize: "0.95rem", fontWeight: 700, color: "rgba(255,255,255,0.45)" }}>CodeLens</span>
        </div>
        <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.18)" }}>© 2025 CodeLens · Powered by Claude AI</p>
      </footer>
    </>
  );
}