# Plant Disease Detection Pipeline

## What Goes Where

- Firebase Storage: keep the actual image files here
- Firestore: keep metadata, labels, predictions, and scan history here
- ML/DL model: use this for the actual disease classification
- Optional LLM or agent: use this only after classification to explain treatment steps in farmer-friendly language

Do not store raw image files directly inside Firestore documents.

## Suggested Firebase Structure

### Dataset images for training

- Storage path: `datasets/plant-disease/{split}/{label}/{filename}`
- Firestore collection: `diseaseDatasetImages`

Example document:

```json
{
  "label": "Tomato Early Blight",
  "split": "train",
  "storagePath": "datasets/plant-disease/train/tomato-early-blight/img001.jpg",
  "downloadUrl": "...",
  "uploadedAt": "server timestamp"
}
```

### Real user scans from the app

- Storage path: `disease-scans/{userId}/{timestamp}-{filename}`
- Firestore collection: `diseaseScans`

Example document:

```json
{
  "userId": "user_123",
  "imageUrl": "...",
  "storagePath": "disease-scans/user_123/1710000000-leaf.jpg",
  "predictedLabel": "Tomato Early Blight",
  "confidence": 0.94,
  "recommendedAction": "Remove infected leaves and apply fungicide",
  "createdAt": "server timestamp"
}
```

## Bulk Upload Your Existing Dataset

The uploader script expects one of these folder layouts:

### Simple labeled folders

```text
dataset-root/
  Healthy/
    img1.jpg
    img2.jpg
  Early Blight/
    img3.jpg
```

### Train and validation folders

```text
dataset-root/
  train/
    Healthy/
      img1.jpg
    Early Blight/
      img2.jpg
  val/
    Healthy/
      img3.jpg
```

## Before Running

1. Download a Firebase service account JSON from your Firebase project settings.
2. Put the file somewhere safe outside git.
3. Set `FIREBASE_SERVICE_ACCOUNT_PATH` in `server/.env`.
4. Make sure `FIREBASE_STORAGE_BUCKET` is set in `server/.env`.

## Run the Upload

```bash
cd server
npm run upload:disease-dataset -- "C:\path\to\dataset-root"
```

Optional flags:

```bash
npm run upload:disease-dataset -- "C:\path\to\dataset-root" --prefix=datasets/plant-disease --collection=diseaseDatasetImages
```

## How To View The Uploaded Data

- Firestore: `https://console.firebase.google.com/project/triplegain-afb8c/firestore`
- Storage: `https://console.firebase.google.com/project/triplegain-afb8c/storage`

## Recommended AI Architecture

### Best fit for your project now

1. Bulk upload your labeled dataset to Firebase Storage.
2. Train an image classifier with transfer learning.
3. Save the trained model outside this Node app.
4. Add a prediction endpoint that accepts an uploaded crop image.
5. Store each prediction result in `diseaseScans`.
6. Optionally send the predicted label to Gemini for treatment explanation.

### Why not an agent first

An agent is not the core solution for image disease detection.

- Use ML/DL to classify the image itself.
- Use an LLM or agent only to explain the result, suggest treatment, or answer follow-up questions.

## Practical Recommendation

For a hackathon or MVP, the fastest path is:

1. Train a transfer-learning model in Python with TensorFlow or Keras.
2. Serve inference through a small Python service or export to TensorFlow.js if you want browser inference.
3. Keep your existing React frontend and Node backend as the app shell.

That gives you a real classifier instead of a prompt-only system pretending to detect disease.
