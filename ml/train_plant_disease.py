import argparse
import json
from pathlib import Path

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers


IMAGE_SIZE = (224, 224)
AUTOTUNE = tf.data.AUTOTUNE
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".gif", ".webp"}


def parse_args():
    parser = argparse.ArgumentParser(
        description="Train a plant disease classifier with transfer learning."
    )
    parser.add_argument(
        "--dataset",
        required=True,
        help="Path to the dataset root. Supports either class folders or train/val/test folders.",
    )
    parser.add_argument(
        "--output-dir",
        default="ml/artifacts",
        help="Directory to save the trained model and label metadata.",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=32,
        help="Batch size for training.",
    )
    parser.add_argument(
        "--epochs-head",
        type=int,
        default=5,
        help="Epochs for training the new classifier head.",
    )
    parser.add_argument(
        "--epochs-finetune",
        type=int,
        default=5,
        help="Epochs for fine-tuning the base model.",
    )
    parser.add_argument(
        "--validation-split",
        type=float,
        default=0.2,
        help="Validation split used when the dataset has no train/val folders.",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for dataset shuffling and splitting.",
    )
    return parser.parse_args()


def count_images_per_class(root_dir, class_names):
    counts = {}

    for class_name in class_names:
        class_dir = Path(root_dir) / class_name
        count = sum(
            1
            for file_path in class_dir.rglob("*")
            if file_path.is_file() and file_path.suffix.lower() in IMAGE_EXTENSIONS
        )
        counts[class_name] = count

    return counts


def build_class_weights(class_names, class_counts):
    total_images = sum(class_counts.values())
    num_classes = len(class_names)

    return {
        index: total_images / (num_classes * max(class_counts[class_name], 1))
        for index, class_name in enumerate(class_names)
    }


def load_datasets(dataset_root, batch_size, validation_split, seed):
    dataset_root = Path(dataset_root)
    train_dir = dataset_root / "train"
    val_dir = dataset_root / "val"
    test_dir = dataset_root / "test"

    common_args = {
        "label_mode": "int",
        "image_size": IMAGE_SIZE,
        "batch_size": batch_size,
        "seed": seed,
    }

    if train_dir.exists() and val_dir.exists():
        train_ds = keras.utils.image_dataset_from_directory(train_dir, **common_args)
        val_ds = keras.utils.image_dataset_from_directory(val_dir, **common_args)
        class_names = train_ds.class_names
        class_counts = count_images_per_class(train_dir, class_names)
        test_ds = (
            keras.utils.image_dataset_from_directory(test_dir, **common_args)
            if test_dir.exists()
            else None
        )
    else:
        train_ds = keras.utils.image_dataset_from_directory(
            dataset_root,
            validation_split=validation_split,
            subset="training",
            **common_args,
        )
        val_ds = keras.utils.image_dataset_from_directory(
            dataset_root,
            validation_split=validation_split,
            subset="validation",
            **common_args,
        )
        class_names = train_ds.class_names
        class_counts = count_images_per_class(dataset_root, class_names)
        test_ds = None

    return train_ds, val_ds, test_ds, class_names, class_counts


def optimize_dataset(dataset, training=False):
    if training:
        dataset = dataset.shuffle(1000)
    return dataset.prefetch(AUTOTUNE)


def build_model(num_classes):
    data_augmentation = keras.Sequential(
        [
            layers.RandomFlip("horizontal"),
            layers.RandomRotation(0.08),
            layers.RandomZoom(0.1),
            layers.RandomContrast(0.1),
        ],
        name="data_augmentation",
    )

    preprocess_input = keras.applications.mobilenet_v2.preprocess_input
    base_model = keras.applications.MobileNetV2(
        input_shape=IMAGE_SIZE + (3,),
        include_top=False,
        weights="imagenet",
    )
    base_model.trainable = False

    inputs = keras.Input(shape=IMAGE_SIZE + (3,))
    x = data_augmentation(inputs)
    x = preprocess_input(x)
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = keras.Model(inputs, outputs)
    return model, base_model


def compile_model(model, learning_rate):
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=learning_rate),
        loss=keras.losses.SparseCategoricalCrossentropy(),
        metrics=["accuracy"],
    )


def save_artifacts(output_dir, model, class_names, class_counts, history_payload, test_metrics):
    output_dir.mkdir(parents=True, exist_ok=True)

    model_path = output_dir / "plant_disease_model.keras"
    labels_path = output_dir / "labels.json"
    metrics_path = output_dir / "training_metrics.json"

    model.save(model_path)
    labels_path.write_text(json.dumps(class_names, indent=2), encoding="utf-8")
    metrics_path.write_text(
        json.dumps(
            {
                "history": history_payload,
                "class_counts": class_counts,
                "test_metrics": test_metrics,
            },
            indent=2,
        ),
        encoding="utf-8",
    )

    print(f"Saved model to: {model_path}")
    print(f"Saved labels to: {labels_path}")
    print(f"Saved metrics to: {metrics_path}")


def main():
    args = parse_args()
    dataset_root = Path(args.dataset)

    if not dataset_root.exists():
        raise FileNotFoundError(f"Dataset folder not found: {dataset_root}")

    print(f"Loading dataset from: {dataset_root}")
    train_ds, val_ds, test_ds, class_names, class_counts = load_datasets(
        dataset_root=dataset_root,
        batch_size=args.batch_size,
        validation_split=args.validation_split,
        seed=args.seed,
    )
    class_weights = build_class_weights(class_names, class_counts)

    print(f"Detected {len(class_names)} classes.")
    print("Classes:")
    for class_name in class_names:
        print(f"- {class_name} ({class_counts[class_name]} images)")

    train_ds = optimize_dataset(train_ds, training=True)
    val_ds = optimize_dataset(val_ds)
    if test_ds is not None:
        test_ds = optimize_dataset(test_ds)

    model, base_model = build_model(num_classes=len(class_names))

    print("Training classifier head...")
    compile_model(model, learning_rate=1e-3)
    history_head = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=args.epochs_head,
        class_weight=class_weights,
    )

    print("Fine-tuning base model...")
    base_model.trainable = True
    for layer in base_model.layers[:-30]:
        layer.trainable = False

    compile_model(model, learning_rate=1e-5)
    history_finetune = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=args.epochs_head + args.epochs_finetune,
        initial_epoch=args.epochs_head,
        class_weight=class_weights,
    )

    test_metrics = None
    if test_ds is not None:
        print("Evaluating on test set...")
        metric_names = model.metrics_names
        values = model.evaluate(test_ds, return_dict=False)
        test_metrics = dict(zip(metric_names, values))
        print(f"Test metrics: {test_metrics}")

    history_payload = {
        "head": history_head.history,
        "finetune": history_finetune.history,
    }

    save_artifacts(
        output_dir=Path(args.output_dir),
        model=model,
        class_names=class_names,
        class_counts=class_counts,
        history_payload=history_payload,
        test_metrics=test_metrics,
    )


if __name__ == "__main__":
    main()
