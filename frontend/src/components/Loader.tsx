export default function Loader() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
      <div style={{ position: "relative", width: "56px", height: "56px" }}>
        {/* Outer ring */}
        <div style={{
          position: "absolute", inset: 0,
          border: "2px solid var(--navy-border)",
          borderRadius: "50%",
        }}/>
        {/* Spinning arc */}
        <div style={{
          position: "absolute", inset: 0,
          border: "2px solid transparent",
          borderTopColor: "var(--cyan)",
          borderRightColor: "var(--cyan)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          boxShadow: "0 0 12px var(--cyan-glow)",
        }}/>
        {/* Inner pulse */}
        <div style={{
          position: "absolute",
          inset: "12px",
          background: "var(--cyan-dim)",
          borderRadius: "50%",
          animation: "pulse-inner 1.6s ease-in-out infinite",
        }}/>
        {/* Center dot */}
        <div style={{
          position: "absolute",
          inset: "22px",
          background: "var(--cyan)",
          borderRadius: "50%",
        }}/>
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
          Analyzing
        </div>
        <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
          {["ViT", "ResNet50"].map((m, i) => (
            <span key={m} style={{
              fontSize: "10px", fontFamily: "var(--font-mono)",
              color: "var(--cyan)", background: "var(--cyan-dim)",
              border: "1px solid rgba(0,212,255,0.2)",
              padding: "2px 6px", borderRadius: "4px",
              animation: `fadeAlt 1.2s ease-in-out ${i * 0.3}s infinite alternate`,
            }}>{m}</span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-inner { 0%, 100% { opacity: 0.3; transform: scale(0.9); } 50% { opacity: 0.7; transform: scale(1); } }
        @keyframes fadeAlt { from { opacity: 0.4; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
