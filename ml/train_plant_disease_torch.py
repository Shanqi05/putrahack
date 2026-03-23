import argparse
import csv
import json
from collections import Counter
from pathlib import Path

import numpy as np
import torch
from PIL import Image
from torch import nn
from torch.utils.data import DataLoader, Dataset, WeightedRandomSampler
from torchvision import models, transforms


IMAGE_SIZE = 224


def parse_args():
    parser = argparse.ArgumentParser(
        description="Train a plant disease classifier with PyTorch."
    )
    parser.add_argument("--train-manifest", required=True)
    parser.add_argument("--val-manifest", required=True)
    parser.add_argument("--labels-json", required=True)
    parser.add_argument("--output-dir", default="ml/artifacts/torch")
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--epochs-head", type=int, default=3)
    parser.add_argument("--epochs-finetune", type=int, default=5)
    parser.add_argument("--learning-rate-head", type=float, default=1e-3)
    parser.add_argument("--learning-rate-finetune", type=float, default=1e-4)
    parser.add_argument("--num-workers", type=int, default=4)
    parser.add_argument(
        "--amp",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="Enable automatic mixed precision when CUDA is available.",
    )
    return parser.parse_args()


class ManifestImageDataset(Dataset):
    def __init__(self, manifest_path, transform):
        self.transform = transform
        self.rows = []
        with open(manifest_path, newline="", encoding="utf-8") as handle:
            reader = csv.DictReader(handle)
            for row in reader:
                self.rows.append(
                    {
                        "path": row["path"],
                        "label": row["label"],
                        "label_index": int(row["label_index"]),
                    }
                )

    def __len__(self):
        return len(self.rows)

    def __getitem__(self, index):
        row = self.rows[index]
        image = Image.open(row["path"]).convert("RGB")
        return self.transform(image), row["label_index"]


def build_transforms():
    train_transform = transforms.Compose(
        [
            transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(10),
            transforms.ColorJitter(brightness=0.1, contrast=0.1, saturation=0.1),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            ),
        ]
    )

    eval_transform = transforms.Compose(
        [
            transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            ),
        ]
    )

    return train_transform, eval_transform


def build_sampler(dataset):
    counts = Counter(row["label_index"] for row in dataset.rows)
    sample_weights = [1.0 / counts[row["label_index"]] for row in dataset.rows]
    return WeightedRandomSampler(
        weights=sample_weights,
        num_samples=len(sample_weights),
        replacement=True,
    )


def create_model(num_classes):
    weights = models.EfficientNet_B0_Weights.DEFAULT
    model = models.efficientnet_b0(weights=weights)
    in_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(in_features, num_classes)
    return model


def freeze_backbone(model, trainable=False):
    for param in model.features.parameters():
        param.requires_grad = trainable


def partial_unfreeze(model, num_last_blocks=2):
    freeze_backbone(model, trainable=False)
    for block in model.features[-num_last_blocks:]:
        for param in block.parameters():
            param.requires_grad = True


def run_epoch(model, loader, criterion, optimizer, device, training, amp_enabled, scaler):
    model.train(training)
    running_loss = 0.0
    running_correct = 0
    running_total = 0

    for images, labels in loader:
        images = images.to(device)
        labels = labels.to(device)

        if training:
            optimizer.zero_grad()

        with torch.set_grad_enabled(training):
            with torch.amp.autocast(
                device_type=device.type,
                enabled=amp_enabled,
            ):
                outputs = model(images)
                loss = criterion(outputs, labels)

            if training:
                if scaler is not None:
                    scaler.scale(loss).backward()
                    scaler.step(optimizer)
                    scaler.update()
                else:
                    loss.backward()
                    optimizer.step()

        predictions = outputs.argmax(dim=1)
        running_loss += loss.item() * images.size(0)
        running_correct += (predictions == labels).sum().item()
        running_total += images.size(0)

    return {
        "loss": running_loss / running_total,
        "accuracy": running_correct / running_total,
    }


def train_stage(model, train_loader, val_loader, criterion, optimizer, device, epochs, history, stage_name, amp_enabled):
    best_state = None
    best_val_accuracy = -1.0
    scaler = torch.amp.GradScaler(device="cuda", enabled=amp_enabled)

    for epoch in range(epochs):
        train_metrics = run_epoch(
            model,
            train_loader,
            criterion,
            optimizer,
            device,
            training=True,
            amp_enabled=amp_enabled,
            scaler=scaler,
        )
        val_metrics = run_epoch(
            model,
            val_loader,
            criterion,
            optimizer,
            device,
            training=False,
            amp_enabled=amp_enabled,
            scaler=None,
        )

        history.append(
            {
                "stage": stage_name,
                "epoch": epoch + 1,
                "train_loss": train_metrics["loss"],
                "train_accuracy": train_metrics["accuracy"],
                "val_loss": val_metrics["loss"],
                "val_accuracy": val_metrics["accuracy"],
            }
        )

        print(
            f"[{stage_name}] epoch {epoch + 1}/{epochs} "
            f"train_loss={train_metrics['loss']:.4f} "
            f"train_acc={train_metrics['accuracy']:.4f} "
            f"val_loss={val_metrics['loss']:.4f} "
            f"val_acc={val_metrics['accuracy']:.4f}"
        )

        if val_metrics["accuracy"] > best_val_accuracy:
            best_val_accuracy = val_metrics["accuracy"]
            best_state = {
                key: value.detach().cpu().clone()
                for key, value in model.state_dict().items()
            }

    if best_state is not None:
        model.load_state_dict(best_state)

    return best_val_accuracy


def save_artifacts(output_dir, model, class_names, history):
    output_dir.mkdir(parents=True, exist_ok=True)
    model_path = output_dir / "plant_disease_model.pt"
    labels_path = output_dir / "labels.json"
    history_path = output_dir / "training_history.json"

    torch.save(model.state_dict(), model_path)
    labels_path.write_text(json.dumps(class_names, indent=2), encoding="utf-8")
    history_path.write_text(json.dumps(history, indent=2), encoding="utf-8")

    print(f"Saved weights to: {model_path}")
    print(f"Saved labels to: {labels_path}")
    print(f"Saved training history to: {history_path}")


def main():
    args = parse_args()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training device: {device}")
    amp_enabled = args.amp and device.type == "cuda"
    print(f"AMP enabled: {amp_enabled}")

    class_names = json.loads(Path(args.labels_json).read_text(encoding="utf-8"))
    train_transform, eval_transform = build_transforms()
    train_dataset = ManifestImageDataset(args.train_manifest, train_transform)
    val_dataset = ManifestImageDataset(args.val_manifest, eval_transform)

    sampler = build_sampler(train_dataset)

    train_loader = DataLoader(
        train_dataset,
        batch_size=args.batch_size,
        sampler=sampler,
        num_workers=args.num_workers,
        pin_memory=torch.cuda.is_available(),
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=args.num_workers,
        pin_memory=torch.cuda.is_available(),
    )

    model = create_model(num_classes=len(class_names)).to(device)
    criterion = nn.CrossEntropyLoss()
    history = []

    freeze_backbone(model, trainable=False)
    head_parameters = [param for param in model.parameters() if param.requires_grad]
    optimizer = torch.optim.Adam(head_parameters, lr=args.learning_rate_head)
    train_stage(
        model,
        train_loader,
        val_loader,
        criterion,
        optimizer,
        device,
        args.epochs_head,
        history,
        stage_name="head",
        amp_enabled=amp_enabled,
    )

    partial_unfreeze(model, num_last_blocks=2)
    finetune_parameters = [param for param in model.parameters() if param.requires_grad]
    optimizer = torch.optim.Adam(finetune_parameters, lr=args.learning_rate_finetune)
    train_stage(
        model,
        train_loader,
        val_loader,
        criterion,
        optimizer,
        device,
        args.epochs_finetune,
        history,
        stage_name="finetune",
        amp_enabled=amp_enabled,
    )

    save_artifacts(Path(args.output_dir), model, class_names, history)


if __name__ == "__main__":
    main()
