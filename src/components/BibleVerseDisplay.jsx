import { useState, useEffect, useRef, useCallback } from "react";

const ANTHROPIC_PROMPT = `You are a Bible verse assistant. The user will speak text that may be a Bible verse, a partial verse, or a reference (like "John 3:16"). 

Your job:
1. Identify the Bible verse being spoken or referenced
2. Return the FULL, accurate verse text (KJV preferred)
3. Return the reference (Book Chapter:Verse)

Respond ONLY in this exact JSON format, nothing else:
{
  "verse": "Full verse text here",
  "reference": "Book Chapter:Verse",
  "found": true
}

If you cannot identify a Bible verse, respond:
{
  "verse": "",
  "reference": "",
  "found": false
}`;

const styles = {
  root: {
    width: "100vw",
    height: "100vh",
    margin: 0,
    padding: 0,
    overflow: "hidden",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    fontFamily: "'EB Garamond', 'Cinzel Decorative', serif",
    color: "#e5d5b8",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },
  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 1,
  },
  particle: {
    position: "absolute",
    background: "#d4af37",
    borderRadius: "50%",
    boxShadow: "0 0 20px rgba(212,175,55,0.8)",
  },
  crossWatermark: {
    position: "absolute",
    fontSize: "180px",
    color: "rgba(212,175,55,0.08)",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 0,
    userSelect: "none",
  },
  header: {
    textAlign: "center",
    padding: "40px 20px 0",
    zIndex: 10,
    position: "relative",
  },
  headerLine: {
    width: "60px",
    height: "2px",
    background: "#d4af37",
    margin: "0 auto 20px",
  },
  title: {
    fontSize: "56px",
    fontWeight: "700",
    letterSpacing: "8px",
    margin: "0 0 10px 0",
    textShadow: "0 4px 20px rgba(212,175,55,0.4)",
  },
  subtitle: {
    fontSize: "14px",
    fontWeight: "400",
    letterSpacing: "4px",
    margin: 0,
    color: "#a89968",
  },
  main: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    zIndex: 10,
    width: "100%",
    maxWidth: "800px",
  },
  placeholder: {
    textAlign: "center",
  },
  placeholderIcon: {
    fontSize: "72px",
    marginBottom: "20px",
    fontFamily: "'Cinzel Decorative', serif",
    fontWeight: "700",
  },
  placeholderText: {
    fontSize: "18px",
    margin: "10px 0",
    color: "#e5d5b8",
  },
  placeholderSub: {
    fontSize: "14px",
    color: "#a89968",
    margin: "5px 0 0 0",
  },
  transcriptBox: {
    textAlign: "center",
    padding: "30px",
    background: "rgba(26, 26, 46, 0.7)",
    borderRadius: "8px",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(212, 175, 55, 0.3)",
  },
  transcriptLabel: {
    fontSize: "12px",
    color: "#a89968",
    textTransform: "uppercase",
    letterSpacing: "2px",
    margin: "0 0 10px 0",
  },
  transcriptText: {
    fontSize: "20px",
    fontStyle: "italic",
    margin: 0,
    color: "#d4af37",
  },
  loadingBox: {
    textAlign: "center",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "3px solid rgba(212, 175, 55, 0.3)",
    borderTop: "3px solid #d4af37",
    borderRadius: "50%",
    margin: "0 auto 20px",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    fontSize: "16px",
    color: "#d4af37",
    margin: 0,
  },
  verseCard: {
    padding: "50px 40px",
    textAlign: "center",
    background: "rgba(26, 26, 46, 0.5)",
    borderRadius: "12px",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(212, 175, 55, 0.3)",
    maxWidth: "600px",
    transition: "all 0.3s ease",
  },
  verseCardPulse: {
    boxShadow: "0 0 40px rgba(212, 175, 55, 0.5)",
    animation: "pulse 1.2s ease-out",
  },
  verseDecoTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
    marginBottom: "30px",
  },
  decorLine: {
    width: "40px",
    height: "1px",
    background: "#d4af37",
    flex: "0 0 auto",
  },
  openQuote: {
    fontSize: "40px",
    color: "#d4af37",
    fontFamily: "'Cinzel Decorative', serif",
  },
  verseText: {
    fontSize: "24px",
    lineHeight: "1.8",
    margin: "20px 0",
    color: "#e5d5b8",
    fontStyle: "italic",
    fontWeight: "400",
  },
  verseDecoBottom: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
    marginTop: "30px",
    marginBottom: "30px",
  },
  closeQuote: {
    fontSize: "40px",
    color: "#d4af37",
    fontFamily: "'Cinzel Decorative', serif",
  },
  referenceTag: {
    paddingTop: "20px",
    borderTop: "1px solid rgba(212, 175, 55, 0.3)",
  },
  referenceText: {
    fontSize: "14px",
    color: "#a89968",
    textTransform: "uppercase",
    letterSpacing: "2px",
  },
  controls: {
    paddingBottom: "40px",
    zIndex: 10,
    position: "relative",
    textAlign: "center",
  },
  micBtn: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    border: "3px solid #d4af37",
    background: "rgba(212, 175, 55, 0.1)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#d4af37",
    fontSize: "32px",
    transition: "all 0.3s ease",
    position: "relative",
    margin: "0 auto 20px",
  },
  micBtnActive: {
    background: "rgba(212, 175, 55, 0.3)",
    boxShadow: "0 0 20px rgba(212, 175, 55, 0.4), inset 0 0 20px rgba(212, 175, 55, 0.1)",
  },
  micIcon: {
    fontSize: "24px",
  },
  micSvg: {
    width: "36px",
    height: "36px",
  },
  ring: {
    position: "absolute",
    width: "100%",
    height: "100%",
    border: "2px solid #d4af37",
    borderRadius: "50%",
    animation: "ringPulse 1.5s ease-out infinite",
  },
  statusText: {
    fontSize: "13px",
    color: "#a89968",
    margin: 0,
    letterSpacing: "1px",
  },
};

export default function BibleVerseDisplay() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [verseData, setVerseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [particles, setParticles] = useState([]);
  const [pulseRing, setPulseRing] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  // Generate floating particles
  useEffect(() => {
    const pts = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 12 + 8,
      delay: Math.random() * 6,
      opacity: Math.random() * 0.4 + 0.1,
    }));
    setParticles(pts);
  }, []);

  const processVerse = useCallback(async (text) => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error("API key not configured. Please set VITE_ANTHROPIC_API_KEY in .env");
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: ANTHROPIC_PROMPT,
          messages: [{ role: "user", content: text }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const raw = data.content?.map((c) => c.text || "").join("") || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      
      if (parsed.found) {
        setVerseData(parsed);
        setPulseRing(true);
        setTimeout(() => setPulseRing(false), 1200);
      } else {
        setError(`Verse not found: "${text}". Try speaking a Bible reference like "John 3:16" or a verse phrase.`);
      }
    } catch (e) {
      console.error("API error:", e);
      setError(`Error: ${e.message}`);
    }
    setLoading(false);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser doesn't support voice recognition. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      setTranscript(final || interim);
      if (final) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => processVerse(final), 800);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
    setVerseData(null);
    setTranscript("");
    setError(null);
  }, [processVerse]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  return (
    <div style={styles.root}>
      {/* Starfield particles */}
      <div style={styles.canvas}>
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              ...styles.particle,
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              animation: `floatUp ${p.duration}s ${p.delay}s infinite ease-in-out`,
            }}
          />
        ))}
      </div>

      {/* Cross watermark */}
      <div style={styles.crossWatermark}>✝</div>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLine} />
        <h1 style={styles.title}>SCRIPTURE</h1>
        <p style={styles.subtitle}>Voice · Vision · Word</p>
        <div style={styles.headerLine} />
      </header>

      {/* Verse Display */}
      <main style={styles.main}>
        {!verseData && !loading && !transcript && (
          <div style={styles.placeholder}>
            <div style={styles.placeholderIcon}>𝕀𝕎</div>
            <p style={styles.placeholderText}>
              Press the mic and speak a Bible verse or reference
            </p>
            <p style={styles.placeholderSub}>e.g. "John 3:16" or "The Lord is my shepherd..."</p>
          </div>
        )}

        {transcript && !verseData && (
          <div style={styles.transcriptBox}>
            <p style={styles.transcriptLabel}>Hearing...</p>
            <p style={styles.transcriptText}>"{transcript}"</p>
          </div>
        )}

        {loading && (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Finding the Word...</p>
          </div>
        )}

        {error && !loading && (
          <div style={{...styles.transcriptBox, borderColor: "rgba(220, 100, 100, 0.5)", background: "rgba(40, 20, 20, 0.7)"}}>
            <p style={{...styles.transcriptLabel, color: "#d46464"}}>⚠ Notice</p>
            <p style={{...styles.transcriptText, color: "#ff9999"}}>{error}</p>
            <p style={{fontSize: "12px", color: "#a89968", marginTop: "12px"}}>Try again or try a different verse</p>
          </div>
        )}

        {verseData && !loading && (
          <div style={{ ...styles.verseCard, ...(pulseRing ? styles.verseCardPulse : {}) }}>
            <div style={styles.verseDecoTop}>
              <span style={styles.decorLine} />
              <span style={styles.openQuote}>"</span>
              <span style={styles.decorLine} />
            </div>
            <p style={styles.verseText}>{verseData.verse}</p>
            <div style={styles.verseDecoBottom}>
              <span style={styles.decorLine} />
              <span style={styles.closeQuote}>"</span>
              <span style={styles.decorLine} />
            </div>
            <div style={styles.referenceTag}>
              <span style={styles.referenceText}>— {verseData.reference}</span>
            </div>
          </div>
        )}
      </main>

      {/* Mic Button */}
      <div style={styles.controls}>
        <button
          onClick={toggleListening}
          style={{
            ...styles.micBtn,
            ...(isListening ? styles.micBtnActive : {}),
          }}
          aria-label={isListening ? "Stop listening" : "Start listening"}
        >
          {isListening ? (
            <span style={styles.micIcon}>◼</span>
          ) : (
            <svg style={styles.micSvg} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4z" />
              <path d="M19 10a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.93V19H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2.07A7 7 0 0 0 19 10z" />
            </svg>
          )}
          {isListening && (
            <>
              <span style={{ ...styles.ring, animationDelay: "0s" }} />
              <span style={{ ...styles.ring, animationDelay: "0.4s" }} />
            </>
          )}
        </button>
        <p style={styles.statusText}>
          {isListening ? "Listening — speak your verse" : "Tap to begin"}
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes floatUp {
          0%, 100% { transform: translateY(0px) scale(1); opacity: var(--op, 0.2); }
          50% { transform: translateY(-30px) scale(1.2); opacity: calc(var(--op, 0.2) * 1.5); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(212,175,55,0.5); }
          100% { box-shadow: 0 0 0 40px rgba(212,175,55,0); }
        }
        @keyframes ringPulse {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        html, body, #root {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  );
}
