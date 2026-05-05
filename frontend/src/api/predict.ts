import type { PredictionResult } from "../types";

const API_BASE = "http://127.0.0.1:8000";

export async function analyzeSkin(file: File): Promise<PredictionResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let detail = `Server error (${response.status})`;
    try {
      const err = await response.json();
      detail = err.detail || err.message || detail;
    } catch {}
    throw new Error(detail);
  }

  const data: PredictionResult = await response.json();
  return data;
}
