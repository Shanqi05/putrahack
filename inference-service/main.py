import json
import os
from functools import lru_cache
from io import BytesIO
from pathlib import Path
from typing import List

import numpy as np
import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel
from torchvision import models, transforms


IMAGE_SIZE = (224, 224)
BASE_DIR = Path(__file__).resolve().parent


class PredictionItem(BaseModel):
    label: str
    crop: str
    condition: str
    isHealthy: bool
    confidence: float


class PredictionResponse(BaseModel):
    predictedLabel: str
    crop: str
    condition: str
    isHealthy: bool
    confidence: float
    topPredictions: List[PredictionItem]


def get_env_path(name: str, default: str) -> Path:
    candidate = Path(os.getenv(name, default))
    if candidate.is_absolute():
        return candidate
    return (BASE_DIR / candidate).resolve()


def parse_allowed_origins() -> List[str]:
    raw = os.getenv("ALLOWED_ORIGINS", "*").strip()
    if raw == "*":
        return ["*"]
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


def prettify_label_part(value: str) -> str:
    return value.replace("_", " ").replace(",", ", ").strip()


def normalize_spaces(value: str) -> str:
    return " ".join(value.split())


def parse_label(label: str) -> dict:
    if "___" in label:
        crop_raw, condition_raw = label.split("___", 1)
    else:
        crop_raw, condition_raw = "Unknown", label

    crop = normalize_spaces(prettify_label_part(crop_raw))
    condition = normalize_spaces(prettify_label_part(condition_raw))

    return {
        "label": label,
        "crop": crop,
        "condition": condition,
        "isHealthy": condition.lower() == "healthy",
    }


@lru_cache(maxsize=1)
def load_labels() -> List[str]:
    labels_path = get_env_path("LABELS_PATH", "models/labels.json")
    if not labels_path.exists():
        raise FileNotFoundError(f"Labels file not found: {labels_path}")

    labels = json.loads(labels_path.read_text(encoding="utf-8"))
    if not isinstance(labels, list) or not labels:
        raise ValueError("labels.json must contain a non-empty JSON array")
    return labels


@lru_cache(maxsize=1)
def load_model():
    labels = load_labels()
    model_path = get_env_path("MODEL_PATH", "models/plant_disease_model.pt")
    if not model_path.exists():
        raise FileNotFoundError(f"Model file not found: {model_path}")

    model = models.efficientnet_b0(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier[1] = torch.nn.Linear(in_features, len(labels))

    state_dict = torch.load(model_path, map_location="cpu")
    model.load_state_dict(state_dict)
    model.eval()
    return model


def preprocess_image(image_bytes: bytes) -> torch.Tensor:
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    transform = transforms.Compose(
        [
            transforms.Resize(IMAGE_SIZE),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            ),
        ]
    )
    return transform(image).unsqueeze(0)


def predict_image(image_bytes: bytes, top_k: int) -> PredictionResponse:
    labels = load_labels()
    model = load_model()
    batch = preprocess_image(image_bytes)

    with torch.inference_mode():
        probabilities = torch.softmax(model(batch), dim=1)[0].cpu().numpy()

    top_k = max(1, min(top_k, len(labels)))
    top_indices = np.argsort(probabilities)[::-1][:top_k]

    top_predictions = []
    for index in top_indices:
        parsed = parse_label(labels[index])
        top_predictions.append(
            PredictionItem(
                **parsed,
                confidence=float(probabilities[index]),
            )
        )

    best = top_predictions[0]
    return PredictionResponse(
        predictedLabel=best.label,
        crop=best.crop,
        condition=best.condition,
        isHealthy=best.isHealthy,
        confidence=best.confidence,
        topPredictions=top_predictions,
    )


app = FastAPI(title="Plant Disease Inference Service", version="1.0.0")

origins = parse_allowed_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    model_path = get_env_path("MODEL_PATH", "models/plant_disease_model.pt")
    labels_path = get_env_path("LABELS_PATH", "models/labels.json")
    return {
        "status": "ok",
        "modelReady": model_path.exists() and labels_path.exists(),
        "modelPath": str(model_path),
        "labelsPath": str(labels_path),
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...), top_k: int | None = None):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")

    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")

        selected_top_k = top_k or int(os.getenv("TOP_K_DEFAULT", "3"))
        return predict_image(image_bytes, selected_top_k)
    except FileNotFoundError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {error}") from error
