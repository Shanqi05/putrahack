import argparse
import json
from pathlib import Path

import numpy as np
import tensorflow as tf
from tensorflow import keras


IMAGE_SIZE = (224, 224)


def parse_args():
    parser = argparse.ArgumentParser(
        description="Run a single-image prediction with a trained plant disease model."
    )
    parser.add_argument(
        "--model",
        default="ml/artifacts/plant_disease_model.keras",
        help="Path to the trained Keras model file.",
    )
    parser.add_argument(
        "--labels",
        default="ml/artifacts/labels.json",
        help="Path to labels.json produced by the training script.",
    )
    parser.add_argument(
        "--image",
        required=True,
        help="Path to the image to classify.",
    )
    parser.add_argument(
        "--top-k",
        type=int,
        default=3,
        help="How many top predictions to print.",
    )
    return parser.parse_args()


def load_image(image_path):
    image = keras.utils.load_img(image_path, target_size=IMAGE_SIZE)
    array = keras.utils.img_to_array(image)
    return np.expand_dims(array, axis=0)


def main():
    args = parse_args()
    model_path = Path(args.model)
    labels_path = Path(args.labels)
    image_path = Path(args.image)

    if not model_path.exists():
        raise FileNotFoundError(f"Model file not found: {model_path}")
    if not labels_path.exists():
        raise FileNotFoundError(f"Labels file not found: {labels_path}")
    if not image_path.exists():
        raise FileNotFoundError(f"Image file not found: {image_path}")

    model = keras.models.load_model(model_path)
    labels = json.loads(labels_path.read_text(encoding="utf-8"))
    image_batch = load_image(image_path)

    predictions = model.predict(image_batch, verbose=0)[0]
    top_indices = np.argsort(predictions)[::-1][: args.top_k]

    print(f"Prediction results for: {image_path}")
    for index in top_indices:
        confidence = float(predictions[index])
        print(f"- {labels[index]}: {confidence:.4f}")


if __name__ == "__main__":
    main()
