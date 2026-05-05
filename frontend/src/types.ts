export interface PredictionResult {
  vit_prediction: string;
  vit_confidence: number;
  cnn_prediction: string;
  cnn_confidence: number;
  heatmap_url?: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  fileName: string;
  preview: string;
  result: PredictionResult;
}
