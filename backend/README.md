# Skin Lesion Analyzer — FastAPI Backend

Dual-model AI backend (ViT + ResNet50) for binary skin lesion classification.

---

## 📁 Project Structure

```
skin-lesion-backend/
├── main.py                  ← Full FastAPI application
├── requirements.txt
├── vit_baseline.pth         ← YOUR trained ViT weights  (copy here)
├── resnet50_baseline.pth    ← YOUR trained ResNet50 weights (copy here)
└── README.md
```

---

## ⚡ Quick Start

### 1. Copy your model files

```bash
cp /path/to/vit_baseline.pth     skin-lesion-backend/
cp /path/to/resnet50_baseline.pth skin-lesion-backend/
```

### 2. Create a virtual environment (recommended)

```bash
cd skin-lesion-backend
python -m venv venv

# Linux / macOS
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

> **GPU users**: Make sure you install the CUDA build of PyTorch first:
> ```bash
> pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
> ```
> Then install the rest: `pip install -r requirements.txt`

### 4. Run the server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server starts at: **http://127.0.0.1:8000**

---

## 🔌 API Endpoints

### `GET /health`
Check server and model status.

**Response:**
```json
{
  "status": "ok",
  "device": "cuda",
  "vit_loaded": true,
  "resnet_loaded": true
}
```

---

### `POST /predict`
Classify a skin lesion image.

**Request:** `multipart/form-data`
- `file` — image file (JPEG / PNG / WebP / BMP, max 20 MB)
- `gradcam` — boolean query param (default `true`) — include Grad-CAM heatmap

**Example with curl:**
```bash
curl -X POST http://127.0.0.1:8000/predict \
  -F "file=@your_image.jpg"
```

**Response:**
```json
{
  "vit_prediction": "Melanoma (Malignant)",
  "vit_confidence": 0.8731,
  "cnn_prediction": "Nevus (Benign)",
  "cnn_confidence": 0.9215,
  "heatmap_url": "data:image/png;base64,..."
}
```

`heatmap_url` is a base64 PNG data URI — set it directly as an `<img src>` in the frontend.

To disable Grad-CAM (faster):
```bash
curl -X POST "http://127.0.0.1:8000/predict?gradcam=false" \
  -F "file=@your_image.jpg"
```

---

## 🧠 Model Details

| Model | Architecture | Input | Output |
|-------|-------------|-------|--------|
| ViT | `vit_base_patch16_224` (timm) | 224×224 | 2 classes |
| CNN | `resnet50` (torchvision) | 224×224 | 2 classes |

**Classes:**
- `0` → Nevus (Benign)
- `1` → Melanoma (Malignant)

**Preprocessing:**
- Resize to 224×224
- Normalize: mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]

---

## 🔍 Grad-CAM Explainability

Grad-CAM highlights the image regions that most influenced the ResNet50 prediction. The overlay is returned as a base64 PNG and rendered by the React frontend automatically when `heatmap_url` is present in the response.

---

## ⚙️ Configuration

All settings are at the top of `main.py`:

| Variable | Default | Description |
|----------|---------|-------------|
| `DEVICE` | auto | `cuda` if GPU available, else `cpu` |
| `SEED` | 42 | Controls full determinism |
| `NUM_CLASSES` | 2 | Nevus / Melanoma |
| `VIT_PATH` | `./vit_baseline.pth` | Path to ViT weights |
| `CNN_PATH` | `./resnet50_baseline.pth` | Path to ResNet50 weights |

---

## 🚨 Troubleshooting

| Error | Fix |
|-------|-----|
| `FileNotFoundError: vit_baseline.pth` | Copy `.pth` files next to `main.py` |
| `RuntimeError: size mismatch` | Model architecture mismatch — file a GitHub issue with your training code |
| CORS error in browser | Add your frontend origin to `allow_origins` in `main.py` |
| `ModuleNotFoundError: timm` | Run `pip install timm==0.9.16` |
| GPU out of memory | Set `DEVICE = torch.device("cpu")` manually in `main.py` |

---

## 📝 Notes

- **Determinism**: Seeds are fixed for PyTorch and NumPy. `cudnn.deterministic=True` is set. Same image will always yield the same prediction.
- **No mock data**: All predictions come exclusively from the loaded `.pth` model weights.
- **Production**: For production deployment, remove `--reload` and consider gunicorn + nginx.
