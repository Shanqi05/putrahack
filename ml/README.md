# Plant Disease Model Training

This folder contains the working ML pipeline for the plant disease detection feature.

## Current Dataset

Use the **color** dataset first because it most closely matches the real crop photos users will upload from the app.

Local dataset path:

```text
C:\Datasets\plantvillage-color
```

Why not use grayscale or segmented first:

- `color` keeps disease color patterns that matter for classification
- `grayscale` removes color signals
- `segmented` uses unnaturally clean backgrounds, which is less realistic for field photos

For the first working model, train on `color` only.

## ML / DL Approach Used

This project uses **deep learning**, specifically **transfer learning** with a pretrained image classifier.

Current stack:

- Framework: `PyTorch`
- Model family: `EfficientNet-B0`
- Approach: transfer learning
- Training flow:
  - train the classifier head first
  - then fine-tune the last part of the backbone
- Imbalance handling:
  - weighted sampling for the training set
- Data prep:
  - stratified train/validation splits
  - image augmentation for training images

This is not a rule-based ML system and not an LLM classifier. It is a real image classifier trained on labeled crop disease images.

## How The Model Learns

Each image belongs to one of the PlantVillage-style labels, for example:

- `Tomato___Late_blight`
- `Apple___Apple_scab`
- `Pepper,_bell___healthy`

During training:

1. the model reads the labeled folder structure
2. each image is resized and normalized
3. the network learns visual patterns linked to each label
4. the output is a probability across all classes
5. the highest probability becomes the prediction

For display and API responses, labels like `Tomato___Late_blight` are parsed into:

- crop: `Tomato`
- condition: `Late blight`
- healthy/diseased flag

## Main Code Locations

- Dataset split generation:
  - `ml/prepare_dataset_splits.py`
- Main training code:
  - `ml/train_plant_disease_torch.py`
- Single-image prediction test:
  - `ml/predict_image_torch.py`
- Local GPU notes:
  - `ml/LOCAL_GPU_TRAINING.md`

What to inspect in the code:

- model creation:
  - search for `create_model` in `ml/train_plant_disease_torch.py`
- freezing and fine-tuning logic:
  - search for `freeze_backbone` and `partial_unfreeze`
- augmentation:
  - search for `build_transforms`
- weighted sampling:
  - search for `build_sampler`

## Current Baseline Result

Initial 80/20 run:

- head stage validation accuracy: `0.9348`
- fine-tune stage validation accuracy: `0.9750`

Artifacts from that run:

- `ml/artifacts/torch-80-20-initial/plant_disease_model.pt`
- `ml/artifacts/torch-80-20-initial/labels.json`
- `ml/artifacts/torch-80-20-initial/training_history.json`

## Split Generation

Generate stratified manifests for the 80/20, 70/30, and 60/40 experiments:

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

## Training

Recommended first run:

```bash
python ml/train_plant_disease_torch.py ^
  --train-manifest ml/manifests/train_val_20.csv ^
  --val-manifest ml/manifests/val_val_20.csv ^
  --labels-json ml/manifests/labels.json ^
  --output-dir ml/artifacts/torch-80-20
```

## Test One Image

```bash
python ml/predict_image_torch.py ^
  --model ml/artifacts/torch-80-20-initial/plant_disease_model.pt ^
  --labels ml/artifacts/torch-80-20-initial/labels.json ^
  --image "C:\Datasets\plantvillage-color\Tomato___Late_blight\0003faa8-4b27-4c65-bf42-6d9e352ca1a5___RS_Late.B 4946.JPG"
```

## What To Do After Training

1. test the model on a few real crop images
2. serve the model from the Python inference service
3. connect the frontend upload flow to the prediction endpoint
4. optionally save user scan images to Firebase Storage and prediction history to Firestore

## Firebase Note

You do **not** need to put the full `color` training folder into Firebase or Firestore for the hackathon to work.

Recommended:

- keep the training dataset local for model development
- use Firebase Storage later for **real user-uploaded crop images**
- use Firestore later for **prediction metadata and scan history**

Only upload the full dataset to Firebase if you specifically want backup, sharing, or remote dataset management.
