import { useCallback, useRef, useState } from "react";
import Loader from "./Loader";

interface Props {
  onUpload: (file: File) => void;
  imagePreview: string | null;
  loading: boolean;
}

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/bmp"];

export default function UploadSection({ onUpload, imagePreview, loading }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      alert("Please upload a JPEG, PNG, WebP, or BMP image.");
      return;
    }
    onUpload(file);
  }, [onUpload]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  return (
    <div className="card upload-card">
      <div className="card-label">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        Image Input
      </div>

      <div
        className={`drop-zone ${dragging ? "dragging" : ""} ${imagePreview ? "has-image" : ""}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !loading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          onChange={onInputChange}
          style={{ display: "none" }}
        />

        {loading ? (
          <div className="drop-inner">
            <Loader />
            <p className="drop-hint" style={{ marginTop: "16px" }}>Processing image through AI models…</p>
          </div>
        ) : imagePreview ? (
          <div className="preview-container">
            <img src={imagePreview} alt="Uploaded lesion" className="preview-img" />
            <div className="preview-overlay">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span>Upload New Image</span>
            </div>
          </div>
        ) : (
          <div className="drop-inner">
            <div className="upload-icon-wrap">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <p className="drop-title">Drop dermoscopy image here</p>
            <p className="drop-hint">or click to browse · JPEG, PNG, WebP, BMP</p>
            <div className="drop-formats">
              {["JPEG", "PNG", "WebP", "BMP"].map(f => (
                <span key={f} className="format-tag">{f}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .upload-card { padding: 20px; }

        .drop-zone {
          border: 1.5px dashed var(--navy-border);
          border-radius: 12px;
          min-height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s;
          background: rgba(0,0,0,0.2);
          overflow: hidden;
          position: relative;
        }
        .drop-zone:hover { border-color: var(--cyan); background: var(--cyan-dim); }
        .drop-zone.dragging { border-color: var(--cyan); background: var(--cyan-dim); box-shadow: 0 0 30px var(--cyan-glow); }
        .drop-zone.has-image { border-style: solid; border-color: var(--navy-border); min-height: 320px; }

        .drop-inner { text-align: center; padding: 32px; }

        .upload-icon-wrap {
          width: 72px; height: 72px;
          background: var(--cyan-dim);
          border: 1px solid rgba(0,212,255,0.2);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
        }

        .drop-title { font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
        .drop-hint { font-size: 13px; color: var(--text-muted); margin-bottom: 16px; }

        .drop-formats { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; }
        .format-tag {
          font-family: var(--font-mono);
          font-size: 10px; font-weight: 500;
          color: var(--text-secondary);
          background: var(--navy-border);
          border: 1px solid var(--navy-border);
          padding: 2px 8px; border-radius: 4px;
        }

        .preview-container { width: 100%; height: 100%; position: relative; }
        .preview-img { width: 100%; height: 320px; object-fit: cover; display: block; }
        .preview-overlay {
          position: absolute; inset: 0;
          background: rgba(10,22,40,0.75);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 10px;
          opacity: 0;
          transition: opacity 0.2s;
          color: #fff;
          font-size: 14px; font-weight: 500;
        }
        .preview-container:hover .preview-overlay { opacity: 1; }
      `}</style>
    </div>
  );
}
