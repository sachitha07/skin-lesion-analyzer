# 🔬 Skin Lesion Analyzer

A **AI-powered skin lesion classification system** using dual deep learning models - **Vision Transformer (ViT)** and **ResNet50** - to classify dermoscopy images as:

* 🟢 Nevus (Benign)
* 🔴 Melanoma (Malignant)


## ✨ Features

* 🤖 **Dual-model inference** - ViT and ResNet50 run in parallel
* 🔍 **Grad-CAM heatmaps** - visual explanation of CNN predictions
* 📊 **Confidence scores** - probability + risk level (Low / Medium / High)
* ⚖️ **Model comparison** - highlights disagreement between models
* 🕘 **Analysis history** - stores previous predictions
* 🔁 **Deterministic results** - same image → same prediction



## 🧠 Models

| Model | Architecture                | Parameters | Input   |
| ----- | --------------------------- | ---------- | ------- |
| ViT   | vit_base_patch16_224 (timm) | 86M        | 224×224 |
| CNN   | ResNet50 (torchvision)      | 25M        | 224×224 |

**Classes:**

* 0 → Nevus (Benign)
* 1 → Melanoma (Malignant)

**Preprocessing:**

* Resize → 224×224
* Normalize → ImageNet mean/std




## 📥 Download Model Weights

Due to GitHub file size limitations, the trained model weights (`.pth` files) are not included in this repository.

👉 Download them from Google Drive:  
[https://drive.google.com/drive/folders/1qukIaUwwn4C4WqVVGZziFdU51EtBNQd-?usp=sharing]

After Downloading place the models in the backend 



## 🗂️ Project Structure

```
skin-lesion-analyzer/     ← Frontend (React + TypeScript)
skin-lesion-backend/
├── main.py
├── requirements.txt
├── vit_baseline.pth
└── resnet50_baseline.pth
```



## 🚀 Getting Started

### 🔹 Backend

```bash
cd skin-lesion-backend

# Place model files here
vit_baseline.pth
resnet50_baseline.pth

pip install -r requirements.txt

uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

👉 Server runs at: http://127.0.0.1:8000



### 🔹 Frontend

```bash
cd skin-lesion-analyzer
npm install
npm run dev
```

👉 Open: http://localhost:5173



## 🔌 API

### POST /predict

Upload an image for classification.

**Request:**

* file → image (JPEG / PNG / WebP / BMP)

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



### GET /health

Check server status.



## 🛠️ Tech Stack

* **Frontend:** React, TypeScript, Vite, TailwindCSS
* **Backend:** FastAPI, PyTorch, timm, torchvision, OpenCV



## 📋 Requirements

* Python ≥ 3.10
* Node.js ≥ 18
* PyTorch ≥ 2.1



## 👨‍💻 Author

* Sachitha Ravichandran
* Akalya Tamilvel Senbakam
