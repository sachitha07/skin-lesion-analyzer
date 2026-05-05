import type { HistoryEntry } from "../types";

interface Props {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
}

function formatTime(date: Date) {
  return date.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AnalysisHistory({ history, onSelect }: Props) {
  if (history.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <div style={{
          width: "72px", height: "72px",
          background: "var(--navy-card)", border: "1px solid var(--navy-border)",
          borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
            <path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/>
            <path d="M12 7v5l4 2"/>
          </svg>
        </div>
        <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>No History Yet</p>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Analyzed images will appear here. Upload an image to get started.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
          Analysis History
        </h2>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)" }}>
          {history.length} record{history.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
        {history.map((entry) => {
          const vitMel = entry.result.vit_prediction.toLowerCase().includes("melanoma");
          const cnnMel = entry.result.cnn_prediction.toLowerCase().includes("melanoma");
          const anyMel = vitMel || cnnMel;
          const bothMel = vitMel && cnnMel;

          const riskLevel = bothMel ? "high" : anyMel ? "moderate" : "low";
          const riskConfig = {
            high: { color: "var(--red)", bg: "var(--red-dim)", border: "rgba(255,77,109,0.25)", label: "HIGH RISK" },
            moderate: { color: "var(--amber)", bg: "rgba(255,192,70,0.1)", border: "rgba(255,192,70,0.25)", label: "MODERATE" },
            low: { color: "var(--green)", bg: "var(--green-dim)", border: "rgba(0,229,160,0.25)", label: "LOW RISK" },
          }[riskLevel];

          return (
            <div
              key={entry.id}
              className="history-card card"
              onClick={() => onSelect(entry)}
              style={{ cursor: "pointer", overflow: "hidden", padding: 0 }}
            >
              <div style={{ position: "relative" }}>
                <img
                  src={entry.preview}
                  alt={entry.fileName}
                  style={{ width: "100%", height: "140px", objectFit: "cover", display: "block" }}
                />
                <div style={{
                  position: "absolute", top: "10px", right: "10px",
                  background: riskConfig.bg, border: `1px solid ${riskConfig.border}`,
                  borderRadius: "6px", padding: "3px 8px",
                  fontSize: "10px", fontWeight: 700, color: riskConfig.color,
                  fontFamily: "var(--font-mono)", letterSpacing: "0.05em",
                }}>
                  {riskConfig.label}
                </div>
              </div>
              <div style={{ padding: "14px" }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {entry.fileName}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: "12px" }}>
                  {formatTime(entry.timestamp)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {[
                    { label: "ViT", pred: entry.result.vit_prediction, conf: entry.result.vit_confidence },
                    { label: "CNN", pred: entry.result.cnn_prediction, conf: entry.result.cnn_confidence },
                  ].map(({ label, pred, conf }) => {
                    const isMel = pred.toLowerCase().includes("melanoma");
                    const color = isMel ? "var(--red)" : "var(--green)";
                    return (
                      <div key={label} style={{
                        background: "var(--navy)", border: "1px solid var(--navy-border)",
                        borderRadius: "8px", padding: "8px 10px",
                      }}>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: "2px" }}>{label}</div>
                        <div style={{ fontSize: "12px", fontWeight: 700, color }}>
                          {isMel ? "Melanoma" : "Nevus"}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          {Math.round(conf * 100)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .history-card { transition: transform 0.2s, box-shadow 0.2s; }
        .history-card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.4); }
      `}</style>
    </div>
  );
}
