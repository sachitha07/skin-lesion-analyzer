export default function Header() {
  return (
    <header style={{
      background: "var(--navy-mid)",
      borderBottom: "1px solid var(--navy-border)",
      padding: "0 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "64px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "36px", height: "36px",
          background: "linear-gradient(135deg, var(--cyan), #0080ff)",
          borderRadius: "10px",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 16px var(--cyan-glow)",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
            Skin Lesion Analyzer
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
            DERMASCOPE AI · DIAGNOSTIC SYSTEM
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          background: "var(--green-dim)", border: "1px solid rgba(0,229,160,0.3)",
          borderRadius: "20px", padding: "4px 12px",
        }}>
          <div style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: "var(--green)",
            boxShadow: "0 0 6px var(--green)",
            animation: "pulse 2s infinite",
          }}/>
          <span style={{ fontSize: "11px", color: "var(--green)", fontFamily: "var(--font-mono)", fontWeight: 500 }}>
            MODELS READY
          </span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>ViT + ResNet50</div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", opacity: 0.6 }}>v1.0.0 · Baseline</div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </header>
  );
}
