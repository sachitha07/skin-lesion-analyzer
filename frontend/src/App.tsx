import { useState, useCallback } from "react";
import Header from "./components/Header";
import UploadSection from "./components/UploadSection";
import PredictionPanel from "./components/PredictionPanel";
import ModelComparison from "./components/ModelComparison";
import AnalysisHistory from "./components/AnalysisHistory";
import { analyzeSkin } from "./api/predict";
import type { PredictionResult, HistoryEntry } from "./types";

export default function App() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"analyze" | "history">("analyze");

  const handleImageUpload = useCallback(async (file: File) => {
    setImage(file);
    setError(null);
    setResult(null);
    const url = URL.createObjectURL(file);
    setImagePreview(url);

    setLoading(true);
    try {
      const data = await analyzeSkin(file);
      setResult(data);
      setHistory((prev) => [
        {
          id: Date.now().toString(),
          timestamp: new Date(),
          fileName: file.name,
          preview: url,
          result: data,
        },
        ...prev.slice(0, 19),
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleHistorySelect = useCallback((entry: HistoryEntry) => {
    setImagePreview(entry.preview);
    setResult(entry.result);
    setError(null);
    setActiveTab("analyze");
  }, []);

  return (
    <div className="app-shell">
      <Header />
      <nav className="tab-nav">
        <button
          className={`tab-btn ${activeTab === "analyze" ? "active" : ""}`}
          onClick={() => setActiveTab("analyze")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          Analyze
        </button>
        <button
          className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/>
            <path d="M12 7v5l4 2"/>
          </svg>
          History
          {history.length > 0 && <span className="badge">{history.length}</span>}
        </button>
      </nav>

      <main className="main-content">
        {activeTab === "analyze" ? (
          <div className="analyze-layout">
            <div className="left-panel">
              <UploadSection
                onUpload={handleImageUpload}
                imagePreview={imagePreview}
                loading={loading}
              />
              {result && !loading && (
                <ModelComparison result={result} />
              )}
            </div>
            <div className="right-panel">
              <PredictionPanel
                result={result}
                loading={loading}
                error={error}
                imagePreview={imagePreview}
              />
            </div>
          </div>
        ) : (
          <AnalysisHistory history={history} onSelect={handleHistorySelect} />
        )}
      </main>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --navy: #0a1628;
          --navy-mid: #0f2044;
          --navy-card: #132040;
          --navy-border: #1e3058;
          --cyan: #00d4ff;
          --cyan-dim: rgba(0,212,255,0.15);
          --cyan-glow: rgba(0,212,255,0.4);
          --green: #00e5a0;
          --green-dim: rgba(0,229,160,0.15);
          --red: #ff4d6d;
          --red-dim: rgba(255,77,109,0.15);
          --amber: #ffc046;
          --text-primary: #e8edf5;
          --text-secondary: #7a9bc4;
          --text-muted: #3d5a80;
          --font-display: 'DM Sans', system-ui, sans-serif;
          --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
        }

        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        body { background: var(--navy); color: var(--text-primary); font-family: var(--font-display); }

        .app-shell {
          min-height: 100vh;
          background: var(--navy);
          background-image:
            radial-gradient(ellipse 80% 50% at 20% -10%, rgba(0,212,255,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 110%, rgba(0,229,160,0.04) 0%, transparent 60%);
        }

        .tab-nav {
          display: flex;
          gap: 4px;
          padding: 0 24px;
          border-bottom: 1px solid var(--navy-border);
          background: var(--navy-mid);
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 20px;
          background: none;
          border: none;
          color: var(--text-secondary);
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          transition: all 0.2s;
          letter-spacing: 0.02em;
        }
        .tab-btn:hover { color: var(--text-primary); }
        .tab-btn.active { color: var(--cyan); border-bottom-color: var(--cyan); }

        .badge {
          background: var(--cyan);
          color: var(--navy);
          font-size: 10px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 10px;
          font-family: var(--font-mono);
        }

        .main-content { padding: 24px; max-width: 1400px; margin: 0 auto; }

        .analyze-layout {
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 24px;
          align-items: start;
        }

        .left-panel, .right-panel { display: flex; flex-direction: column; gap: 24px; }

        @media (max-width: 1024px) {
          .analyze-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
