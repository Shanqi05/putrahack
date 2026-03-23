import argparse
import json
from pathlib import Path

import torch
from PIL import Image
from torchvision import models, transforms


IMAGE_SIZE = 224


def parse_args():
    parser = argparse.ArgumentParser(
        description="Run a single-image prediction with a trained PyTorch plant disease model."
    )
    parser.add_argument("--model", required=True)
    parser.add_argument("--labels", required=True)
    parser.add_argument("--image", required=True)
    parser.add_argument("--top-k", type=int, default=3)
    return parser.parse_args()


def prettify_label_part(value: str) -> str:
    return " ".join(value.replace("_", " ").replace(",", ", ").split())


def parse_label(label: str):
    crop, condition = label.split("___", 1) if "___" in label else ("Unknown", label)
    return {
        "label": label,
        "crop": prettify_label_part(crop),
        "condition": prettify_label_part(condition),
        "isHealthy": condition.lower() == "healthy",
    }


def load_model(model_path: Path, labels):
    model = models.efficientnet_b0(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier[1] = torch.nn.Linear(in_features, len(labels))
    state_dict = torch.load(model_path, map_location="cpu")
    model.load_state_dict(state_dict)
    model.eval()
    return model


def preprocess_image(image_path: Path):
    transform = transforms.Compose(
        [
            transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            ),
        ]
    )
    image = Image.open(image_path).convert("RGB")
    return transform(image).unsqueeze(0)


def main():
    args = parse_args()
    model_path = Path(args.model)
    labels_path = Path(args.labels)
    image_path = Path(args.image)

    labels = json.loads(labels_path.read_text(encoding="utf-8"))
    model = load_model(model_path, labels)
    batch = preprocess_image(image_path)

    with torch.inference_mode():
        probabilities = torch.softmax(model(batch), dim=1)[0]

    top_indices = torch.argsort(probabilities, descending=True)[: args.top_k]
    print(f"Prediction results for: {image_path}")
    for index in top_indices.tolist():
        parsed = parse_label(labels[index])
        print(f"- {parsed['label']}: {probabilities[index].item():.4f}")


if __name__ == "__main__":
    main()
