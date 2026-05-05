"""
Skin Lesion Analyzer — FastAPI Backend
=======================================
Models:
  • Vision Transformer  → vit_base_patch16_224 (timm)
  • CNN ResNet50        → torchvision resnet50

Classes:
  0 → Nevus (Benign)
  1 → Melanoma (Malignant)

Run:
  uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""

import io
import os
import logging
import base64
from pathlib import Path
from contextlib import asynccontextmanager

import numpy as np
import torch
import torch.nn as nn
import timm
from torchvision import models, transforms
from PIL import Image, UnidentifiedImageError
import cv2
import uvicorn

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Determinism — same image must always give same output
# ---------------------------------------------------------------------------
SEED = 42
torch.manual_seed(SEED)
np.random.seed(SEED)
torch.backends.cudnn.deterministic = True
torch.backends.cudnn.benchmark = False

# ---------------------------------------------------------------------------
# Paths  (place .pth files next to main.py)
# ---------------------------------------------------------------------------
BASE_DIR   = Path(__file__).parent
VIT_PATH   = BASE_DIR / "vit_baseline.pth"
CNN_PATH   = BASE_DIR / "resnet50_baseline.pth"
NUM_CLASSES = 2
LABELS      = {0: "Nevus (Benign)", 1: "Melanoma (Malignant)"}

# ---------------------------------------------------------------------------
# Device
# ---------------------------------------------------------------------------
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
log.info(f"Running on: {DEVICE}")

# ---------------------------------------------------------------------------
# Image preprocessing — ImageNet stats, 224×224
# ---------------------------------------------------------------------------
TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std =[0.229, 0.224, 0.225],
    ),
])

# ---------------------------------------------------------------------------
# Model loaders
# ---------------------------------------------------------------------------

def load_vit() -> nn.Module:
    """Load vit_base_patch16_224 with 2-class head."""
    log.info("Loading ViT …")
    model = timm.create_model(
        "vit_base_patch16_224",
        pretrained=False,
        num_classes=NUM_CLASSES,
    )
    state = torch.load(VIT_PATH, map_location=DEVICE)
    model.load_state_dict(state, strict=True)
    model.to(DEVICE)
    model.eval()
    log.info("ViT ready ✓")
    return model


def load_resnet() -> nn.Module:
    """Load ResNet50 with 2-class fc head."""
    log.info("Loading ResNet50 …")
    model = models.resnet50(weights=None)
    model.fc = nn.Linear(model.fc.in_features, NUM_CLASSES)
    state = torch.load(CNN_PATH, map_location=DEVICE)
    model.load_state_dict(state, strict=True)
    model.to(DEVICE)
    model.eval()
    log.info("ResNet50 ready ✓")
    return model


# ---------------------------------------------------------------------------
# Global model holders (populated at startup)
# ---------------------------------------------------------------------------
VIT_MODEL:    nn.Module | None = None
RESNET_MODEL: nn.Module | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global VIT_MODEL, RESNET_MODEL
    VIT_MODEL    = load_vit()
    RESNET_MODEL = load_resnet()
    yield
    # cleanup (if needed)
    log.info("Shutting down — models released.")


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Skin Lesion Analyzer API",
    version="1.0.0",
    description="ViT + ResNet50 dual-model skin lesion classifier with Grad-CAM.",
    lifespan=lifespan,
)

# CORS — allow React dev server and any localhost origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Response schema
# ---------------------------------------------------------------------------
class PredictResponse(BaseModel):
    # ViT
    vit_prediction: str
    vit_confidence: float
    # CNN
    cnn_prediction: str
    cnn_confidence: float
    # Grad-CAM (base64 PNG data URI — optional)
    heatmap_url: str | None = None


class HealthResponse(BaseModel):
    status: str
    device: str
    vit_loaded: bool
    resnet_loaded: bool


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def preprocess_image(raw_bytes: bytes) -> tuple[torch.Tensor, np.ndarray]:
    """
    Returns:
        tensor  — shape (1, 3, 224, 224) on DEVICE
        img_np  — uint8 RGB numpy array (224×224) for Grad-CAM
    """
    try:
        img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Cannot decode image. Upload a valid JPEG/PNG/BMP/WebP.")

    img_resized = img.resize((224, 224), Image.LANCZOS)
    img_np      = np.array(img_resized, dtype=np.uint8)          # (224,224,3)
    tensor      = TRANSFORM(img).unsqueeze(0).to(DEVICE)         # (1,3,224,224)
    return tensor, img_np


@torch.no_grad()
def run_inference(model: nn.Module, tensor: torch.Tensor) -> tuple[str, float]:
    """Returns (label_string, confidence_0_to_1)."""
    logits = model(tensor)                                        # (1, 2)
    probs  = torch.softmax(logits, dim=1)[0]                     # (2,)
    cls    = int(probs.argmax().item())
    conf   = float(probs[cls].item())
    return LABELS[cls], conf


# ---------------------------------------------------------------------------
# Grad-CAM for ResNet50
# ---------------------------------------------------------------------------

class GradCAM:
    """
    Hooks into the last conv layer of ResNet50 (layer4[-1]).
    Works only with CNN — ViT attention rollout is a separate technique.
    """

    def __init__(self, model: nn.Module):
        self.model      = model
        self.gradients  = None
        self.activations = None
        # ResNet50 last conv block
        target_layer = model.layer4[-1]
        target_layer.register_forward_hook(self._save_activation)
        target_layer.register_full_backward_hook(self._save_gradient)

    def _save_activation(self, module, inp, out):
        self.activations = out.detach()

    def _save_gradient(self, module, grad_in, grad_out):
        self.gradients = grad_out[0].detach()

    def generate(self, tensor: torch.Tensor, img_np: np.ndarray) -> str:
        """
        Returns a base64-encoded PNG data URI of the Grad-CAM overlay.
        """
        self.model.zero_grad()
        logits = self.model(tensor)                    # (1,2)
        cls    = int(logits.argmax(dim=1).item())
        logits[0, cls].backward()

        # Pool gradients over spatial dims
        weights = self.gradients.mean(dim=(2, 3), keepdim=True)  # (1,C,1,1)
        cam     = (weights * self.activations).sum(dim=1, keepdim=True)
        cam     = torch.relu(cam)                                 # ReLU
        cam     = cam.squeeze().cpu().numpy()                     # (H,W)

        # Normalise + resize to 224×224
        if cam.max() > 0:
            cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)
        cam_uint8 = np.uint8(cam * 255)
        cam_resized = cv2.resize(cam_uint8, (224, 224))

        # Apply colour map and overlay on original image
        heatmap = cv2.applyColorMap(cam_resized, cv2.COLORMAP_JET)
        heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
        overlay = cv2.addWeighted(img_np, 0.55, heatmap, 0.45, 0)

        # Encode as base64 PNG data URI
        _, buf = cv2.imencode(".png", cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))
        b64 = base64.b64encode(buf.tobytes()).decode("utf-8")
        return f"data:image/png;base64,{b64}"


# Instantiated after model load (in endpoint, lazily)
_gradcam: GradCAM | None = None


def get_gradcam() -> GradCAM:
    global _gradcam
    if _gradcam is None:
        if RESNET_MODEL is None:
            raise RuntimeError("ResNet model not loaded yet.")
        _gradcam = GradCAM(RESNET_MODEL)
    return _gradcam


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health", response_model=HealthResponse, tags=["System"])
def health():
    """Check that both models are loaded and the server is alive."""
    return HealthResponse(
        status      = "ok",
        device      = str(DEVICE),
        vit_loaded  = VIT_MODEL is not None,
        resnet_loaded = RESNET_MODEL is not None,
    )


@app.post("/predict", response_model=PredictResponse, tags=["Inference"])
async def predict(
    file: UploadFile = File(..., description="Dermoscopy image (JPEG/PNG/WebP/BMP)"),
    gradcam: bool    = True,
):
    """
    Run both ViT and ResNet50 on the uploaded image.

    - **file**: image file
    - **gradcam**: include Grad-CAM overlay (default True)
    """
    # ── Validate content type ──────────────────────────────────────────────
    allowed = {"image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"}
    ct = (file.content_type or "").lower()
    if ct and ct not in allowed:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported media type '{ct}'. Allowed: JPEG, PNG, WebP, BMP.",
        )

    # ── Read raw bytes ─────────────────────────────────────────────────────
    raw = await file.read()
    if len(raw) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(raw) > 20 * 1024 * 1024:   # 20 MB cap
        raise HTTPException(status_code=413, detail="File too large. Max 20 MB.")

    # ── Preprocess ────────────────────────────────────────────────────────
    tensor, img_np = preprocess_image(raw)

    # ── ViT inference (no_grad) ───────────────────────────────────────────
    vit_pred, vit_conf = run_inference(VIT_MODEL, tensor)

    # ── ResNet50 inference (with grad for Grad-CAM) ───────────────────────
    if gradcam:
        # need grad enabled for Grad-CAM
        tensor_gc = tensor.clone().requires_grad_(True)
        gradcam_obj = get_gradcam()
        with torch.enable_grad():
            cnn_pred, cnn_conf = run_inference(RESNET_MODEL, tensor_gc)
        try:
            heatmap_uri = gradcam_obj.generate(tensor_gc, img_np)
        except Exception as e:
            log.warning(f"Grad-CAM failed: {e}")
            heatmap_uri = None
    else:
        cnn_pred, cnn_conf = run_inference(RESNET_MODEL, tensor)
        heatmap_uri = None

    log.info(
        f"[{file.filename}] "
        f"ViT={vit_pred} ({vit_conf:.2%}) | "
        f"CNN={cnn_pred} ({cnn_conf:.2%})"
    )

    return PredictResponse(
        vit_prediction = vit_pred,
        vit_confidence = round(vit_conf, 4),
        cnn_prediction = cnn_pred,
        cnn_confidence = round(cnn_conf, 4),
        heatmap_url    = heatmap_uri,
    )


# ---------------------------------------------------------------------------
# Direct run (python main.py)
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
