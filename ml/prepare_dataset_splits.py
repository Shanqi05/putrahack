import argparse
import csv
from collections import Counter
from pathlib import Path

from sklearn.model_selection import train_test_split


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".gif", ".webp"}


def parse_args():
    parser = argparse.ArgumentParser(
        description="Create stratified train/validation manifests for a folder-per-class plant dataset."
    )
    parser.add_argument(
        "--dataset",
        required=True,
        help="Path to dataset root, e.g. C:\\Datasets\\plantvillage-color",
    )
    parser.add_argument(
        "--output-dir",
        default="ml/manifests",
        help="Directory where CSV manifests will be written.",
    )
    parser.add_argument(
        "--val-splits",
        nargs="+",
        type=float,
        default=[0.2, 0.3, 0.4],
        help="One or more validation split ratios to generate.",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for reproducible splits.",
    )
    return parser.parse_args()


def collect_samples(dataset_root: Path):
    class_names = sorted([path.name for path in dataset_root.iterdir() if path.is_dir()])
    if not class_names:
        raise ValueError(f"No class folders found in dataset root: {dataset_root}")

    samples = []
    for class_index, class_name in enumerate(class_names):
        class_dir = dataset_root / class_name
        for file_path in class_dir.rglob("*"):
            if file_path.is_file() and file_path.suffix.lower() in IMAGE_EXTENSIONS:
                samples.append(
                    {
                        "path": str(file_path.resolve()),
                        "label": class_name,
                        "label_index": class_index,
                    }
                )

    if not samples:
        raise ValueError(f"No images found in dataset root: {dataset_root}")

    return class_names, samples


def write_manifest(path: Path, rows):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=["path", "label", "label_index"])
        writer.writeheader()
        writer.writerows(rows)


def summarize(rows):
    return Counter(row["label"] for row in rows)


def main():
    args = parse_args()
    dataset_root = Path(args.dataset)
    if not dataset_root.exists():
        raise FileNotFoundError(f"Dataset path not found: {dataset_root}")

    output_dir = Path(args.output_dir)
    class_names, samples = collect_samples(dataset_root)
    labels = [row["label"] for row in samples]

    labels_path = output_dir / "labels.json"
    labels_path.parent.mkdir(parents=True, exist_ok=True)
    labels_path.write_text(
        __import__("json").dumps(class_names, indent=2),
        encoding="utf-8",
    )

    print(f"Found {len(samples)} images across {len(class_names)} classes.")
    print(f"Saved label map to: {labels_path}")

    for val_split in args.val_splits:
        if not 0 < val_split < 1:
            raise ValueError(f"Validation split must be between 0 and 1. Got: {val_split}")

        train_rows, val_rows = train_test_split(
            samples,
            test_size=val_split,
            random_state=args.seed,
            stratify=labels,
        )

        split_name = f"val_{int(val_split * 100):02d}"
        train_path = output_dir / f"train_{split_name}.csv"
        val_path = output_dir / f"val_{split_name}.csv"

        write_manifest(train_path, train_rows)
        write_manifest(val_path, val_rows)

        train_counts = summarize(train_rows)
        val_counts = summarize(val_rows)

        print("")
        print(f"Generated split: train {(1 - val_split):.0%} / val {val_split:.0%}")
        print(f"- Train rows: {len(train_rows)} -> {train_path}")
        print(f"- Val rows: {len(val_rows)} -> {val_path}")
        print(f"- Example class distribution: Apple___healthy train={train_counts.get('Apple___healthy', 0)} val={val_counts.get('Apple___healthy', 0)}")


if __name__ == "__main__":
    main()
