import type { PredictionResult } from "../types";

interface Props {
  result: PredictionResult;
}

function MiniBar({ value, color }: { value: number; color: string }) {
  const pct = Math.round(value * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{ flex: 1, height: "5px", background: "var(--navy-border)", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: color, borderRadius: "3px",
          transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
        }}/>
      </div>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 600, color, width: "36px", textAlign: "right" }}>
        {pct}%
      </span>
    </div>
  );
}

export default function ModelComparison({ result }: Props) {
  const vitIsMel = result.vit_prediction.toLowerCase().includes("melanoma");
  const cnnIsMel = result.cnn_prediction.toLowerCase().includes("melanoma");
  const agree = vitIsMel === cnnIsMel;

  const vitColor = vitIsMel ? "var(--red)" : "var(--green)";
  const cnnColor = cnnIsMel ? "var(--red)" : "var(--green)";

  const confDiff = Math.abs(result.vit_confidence - result.cnn_confidence);

  return (
    <div className="card" style={{ padding: "20px" }}>
      <div className="card-label" style={{ marginBottom: "16px" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
        Model Comparison
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        {/* ViT */}
        <div style={{
          background: "var(--navy)",
          border: `1px solid ${vitIsMel ? "rgba(255,77,109,0.25)" : "rgba(0,229,160,0.25)"}`,
          borderRadius: "10px", padding: "14px",
        }}>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em", marginBottom: "6px" }}>
            VISION TRANSFORMER
          </div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: vitColor, marginBottom: "10px", lineHeight: 1.3 }}>
            {result.vit_prediction}
          </div>
          <MiniBar value={result.vit_confidence} color={vitColor} />
        </div>

        {/* CNN */}
        <div style={{
          background: "var(--navy)",
          border: `1px solid ${cnnIsMel ? "rgba(255,77,109,0.25)" : "rgba(0,229,160,0.25)"}`,
          borderRadius: "10px", padding: "14px",
        }}>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em", marginBottom: "6px" }}>
            CNN · RESNET50
          </div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: cnnColor, marginBottom: "10px", lineHeight: 1.3 }}>
            {result.cnn_prediction}
          </div>
          <MiniBar value={result.cnn_confidence} color={cnnColor} />
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        gap: "10px",
        borderTop: "1px solid var(--navy-border)",
        paddingTop: "14px",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--cyan)" }}>
            {Math.round(Math.max(result.vit_confidence, result.cnn_confidence) * 100)}%
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Peak Confidence</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: "var(--font-mono)", color: confDiff > 0.2 ? "var(--amber)" : "var(--text-secondary)" }}>
            {Math.round(confDiff * 100)}%
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Conf. Delta</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: "var(--font-mono)", color: agree ? "var(--green)" : "var(--amber)" }}>
            {agree ? "YES" : "NO"}
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Agreement</div>
        </div>
      </div>

      {!agree && (
        <div style={{
          marginTop: "12px", padding: "10px 12px",
          background: "rgba(255,192,70,0.08)", border: "1px solid rgba(255,192,70,0.2)",
          borderRadius: "8px", fontSize: "11px", color: "var(--amber)", lineHeight: 1.5,
          fontFamily: "var(--font-mono)",
        }}>
          ⚡ Disagreement detected. Consider clinical review — ViT and ResNet50 produced conflicting classifications.
        </div>
      )}
    </div>
  );
}
