import type { PredictionResult } from "../types";

interface Props {
  result: PredictionResult | null;
  loading: boolean;
  error: string | null;
  imagePreview: string | null;
}

function getRisk(prediction: string, confidence: number) {
  const isMelanoma = prediction.toLowerCase().includes("melanoma");
  const isHighConf = confidence >= 0.7;
  if (isMelanoma && isHighConf) return "high";
  if (isMelanoma && !isHighConf) return "moderate";
  return "low";
}

function RiskBadge({ level }: { level: "low" | "moderate" | "high" }) {
  const config = {
    low: { label: "LOW RISK", color: "var(--green)", bg: "var(--green-dim)", border: "rgba(0,229,160,0.3)", icon: "✓" },
    moderate: { label: "MODERATE RISK", color: "var(--amber)", bg: "rgba(255,192,70,0.12)", border: "rgba(255,192,70,0.3)", icon: "!" },
    high: { label: "HIGH RISK", color: "var(--red)", bg: "var(--red-dim)", border: "rgba(255,77,109,0.3)", icon: "⚠" },
  }[level];

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "8px",
      background: config.bg, border: `1px solid ${config.border}`,
      borderRadius: "8px", padding: "8px 14px",
    }}>
      <span style={{ fontSize: "16px", color: config.color }}>{config.icon}</span>
      <span style={{ fontSize: "12px", fontWeight: 700, color: config.color, fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>
        {config.label}
      </span>
    </div>
  );
}

function ConfidenceBar({ value, color }: { value: number; color: string }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Confidence</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 600, color }}>{pct}%</span>
      </div>
      <div style={{ height: "6px", background: "var(--navy-border)", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: "3px",
          transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: `0 0 8px ${color}66`,
        }}/>
      </div>
    </div>
  );
}

function ModelResult({ label, model, prediction, confidence, icon }: {
  label: string; model: string; prediction: string; confidence: number; icon: string;
}) {
  const risk = getRisk(prediction, confidence);
  const isMel = prediction.toLowerCase().includes("melanoma");
  const accentColor = isMel ? "var(--red)" : "var(--green)";

  return (
    <div style={{
      background: "var(--navy)",
      border: "1px solid var(--navy-border)",
      borderRadius: "12px",
      padding: "18px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>{icon}</span>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>{label}</div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>{model}</div>
          </div>
        </div>
        <RiskBadge level={risk} />
      </div>

      <div style={{
        fontSize: "18px", fontWeight: 700, color: accentColor,
        marginBottom: "14px", letterSpacing: "-0.02em",
      }}>
        {prediction}
      </div>

      <ConfidenceBar value={confidence} color={accentColor} />
    </div>
  );
}

export default function PredictionPanel({ result, loading, error, imagePreview }: Props) {
  if (!imagePreview && !loading) {
    return (
      <div className="card" style={{ padding: "32px 24px", textAlign: "center" }}>
        <div style={{
          width: "64px", height: "64px",
          background: "var(--navy)",
          border: "1px solid var(--navy-border)",
          borderRadius: "16px",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
          </svg>
        </div>
        <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
          Awaiting Image
        </p>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
          Upload a dermoscopy image to begin AI analysis with ViT and ResNet50.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card" style={{ padding: "32px 24px" }}>
        <div className="card-label" style={{ marginBottom: "20px" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          Analysis Results
        </div>
        {[1, 2].map(i => (
          <div key={i} style={{
            background: "var(--navy)", border: "1px solid var(--navy-border)",
            borderRadius: "12px", padding: "18px", marginBottom: "12px",
          }}>
            <div className="skeleton" style={{ height: "12px", width: "40%", marginBottom: "10px", borderRadius: "4px" }}/>
            <div className="skeleton" style={{ height: "22px", width: "70%", marginBottom: "14px", borderRadius: "4px" }}/>
            <div className="skeleton" style={{ height: "6px", width: "100%", borderRadius: "3px" }}/>
          </div>
        ))}
        <style>{`
          .skeleton {
            background: linear-gradient(90deg, var(--navy-border) 25%, var(--navy-mid) 50%, var(--navy-border) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
          @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: "24px" }}>
        <div style={{
          background: "var(--red-dim)", border: "1px solid rgba(255,77,109,0.3)",
          borderRadius: "10px", padding: "16px", display: "flex", gap: "12px",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" style={{ flexShrink: 0, marginTop: "1px" }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--red)", marginBottom: "4px" }}>Connection Error</p>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{error}</p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px", fontFamily: "var(--font-mono)" }}>
              Ensure FastAPI is running at localhost:8000
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const vitRisk = getRisk(result.vit_prediction, result.vit_confidence);
  const cnnRisk = getRisk(result.cnn_prediction, result.cnn_confidence);
  const overallRisk = vitRisk === "high" || cnnRisk === "high" ? "high"
    : vitRisk === "moderate" || cnnRisk === "moderate" ? "moderate" : "low";
  const modelsAgree = result.vit_prediction.toLowerCase().split(" ")[0] === result.cnn_prediction.toLowerCase().split(" ")[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Overall verdict */}
      <div className="card" style={{ padding: "20px" }}>
        <div className="card-label" style={{ marginBottom: "14px" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          Analysis Results
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
          <div style={{
            width: "48px", height: "48px",
            borderRadius: "12px",
            background: overallRisk === "high" ? "var(--red-dim)" : overallRisk === "moderate" ? "rgba(255,192,70,0.12)" : "var(--green-dim)",
            border: `1px solid ${overallRisk === "high" ? "rgba(255,77,109,0.3)" : overallRisk === "moderate" ? "rgba(255,192,70,0.3)" : "rgba(0,229,160,0.3)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "22px",
          }}>
            {overallRisk === "high" ? "⚠️" : overallRisk === "moderate" ? "⚡" : "✅"}
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "2px" }}>Overall Assessment</div>
            <div style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              {overallRisk === "high" ? "High Risk Detected" : overallRisk === "moderate" ? "Moderate Risk" : "Low Risk"}
            </div>
          </div>
        </div>

        <div style={{
          padding: "10px 12px",
          background: modelsAgree ? "var(--green-dim)" : "rgba(255,192,70,0.1)",
          border: `1px solid ${modelsAgree ? "rgba(0,229,160,0.2)" : "rgba(255,192,70,0.25)"}`,
          borderRadius: "8px",
          fontSize: "12px",
          color: modelsAgree ? "var(--green)" : "var(--amber)",
          fontFamily: "var(--font-mono)",
        }}>
          {modelsAgree ? "✓ Both models are in agreement" : "⚡ Models disagree — review both predictions"}
        </div>
      </div>

      {/* Individual model results */}
      <div className="card" style={{ padding: "20px" }}>
        <div className="card-label" style={{ marginBottom: "14px" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          Model Predictions
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <ModelResult
            label="MODEL 1"
            model="Vision Transformer (ViT)"
            prediction={result.vit_prediction}
            confidence={result.vit_confidence}
            icon="🔬"
          />
          <ModelResult
            label="MODEL 2"
            model="CNN (ResNet50)"
            prediction={result.cnn_prediction}
            confidence={result.cnn_confidence}
            icon="🧠"
          />
        </div>
      </div>

      {/* Heatmap section if available */}
      {result.heatmap_url && (
        <div className="card" style={{ padding: "20px" }}>
          <div className="card-label" style={{ marginBottom: "14px" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
            </svg>
            Attention Heatmap
          </div>
          <img
            src={result.heatmap_url}
            alt="Attention heatmap"
            style={{ width: "100%", borderRadius: "8px", border: "1px solid var(--navy-border)" }}
          />
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px", fontFamily: "var(--font-mono)" }}>
            Highlighted regions indicate areas of model focus during analysis.
          </p>
        </div>
      )}

      <p style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", lineHeight: 1.6, padding: "0 8px" }}>
        ⚕️ For research purposes only. Not a substitute for professional dermatological diagnosis.
      </p>
    </div>
  );
}
