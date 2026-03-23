# Local GPU Training

The current machine has:

- dataset ready at `C:\Datasets\plantvillage-color`
- NVIDIA RTX 4050 visible to Windows
- but the installed PyTorch is CPU-only right now

That means the fastest path is:

1. install a CUDA-enabled PyTorch build
2. generate stratified train/validation manifests
3. train locally on the GPU

## Recommended First Split

Start with **80/20**.

Why:

- it is the standard baseline
- it leaves the most data for training
- it is the fastest comparison point before trying 70/30 or 60/40

You asked about testing 80/20, 70/30, and 60/40. That is fine, but I recommend:

1. train 80/20 first
2. inspect validation accuracy
3. only then compare 70/30 and 60/40 if needed

## Generate Split Manifests

```bash
python ml/prepare_dataset_splits.py --dataset "C:\Datasets\plantvillage-color"
```

This creates:

- `ml/manifests/labels.json`
- `ml/manifests/train_val_20.csv`
- `ml/manifests/val_val_20.csv`
- `ml/manifests/train_val_30.csv`
- `ml/manifests/val_val_30.csv`
- `ml/manifests/train_val_40.csv`
- `ml/manifests/val_val_40.csv`

## Train

Example for 80/20:

```bash
python ml/train_plant_disease_torch.py ^
  --train-manifest ml/manifests/train_val_20.csv ^
  --val-manifest ml/manifests/val_val_20.csv ^
  --labels-json ml/manifests/labels.json ^
  --output-dir ml/artifacts/torch-80-20
```

Example for 70/30:

```bash
python ml/train_plant_disease_torch.py ^
  --train-manifest ml/manifests/train_val_30.csv ^
  --val-manifest ml/manifests/val_val_30.csv ^
  --labels-json ml/manifests/labels.json ^
  --output-dir ml/artifacts/torch-70-30
```

Example for 60/40:

```bash
python ml/train_plant_disease_torch.py ^
  --train-manifest ml/manifests/train_val_40.csv ^
  --val-manifest ml/manifests/val_val_40.csv ^
  --labels-json ml/manifests/labels.json ^
  --output-dir ml/artifacts/torch-60-40
```

## Output

Each run saves:

- `plant_disease_model.pt`
- `labels.json`
- `training_history.json`

## Important Note

The existing inference service currently expects a TensorFlow `.keras` model, while this local GPU path uses PyTorch `.pt` weights.

If we continue with the PyTorch route, the next step will be to adapt the inference service to load the PyTorch model instead of the TensorFlow model.
