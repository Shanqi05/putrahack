# Plant Disease Inference Service

This service is the model-serving backend for the plant disease detection feature.

It is intentionally separate from the existing Node backend so the disease model can run in a Python-native stack on Render.

## Endpoints

- `GET /health`
- `POST /predict`

## Expected Files

Place these files in `inference-service/models/` or point to them with env vars:

- `plant_disease_model.pt`
- `labels.json`

You will get both from the PyTorch training output in `ml/artifacts/`.

## Local Run

```bash
cd inference-service
python -m pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Render Setup

Create a new Render Web Service for this folder.

- Root Directory: `inference-service`
- Python Version: `3.12.8` via `.python-version`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Health Check Path: `/health`

## Environment Variables

Use values like:

```text
PORT=8000
MODEL_PATH=models/plant_disease_model.pt
LABELS_PATH=models/labels.json
ALLOWED_ORIGINS=*
TOP_K_DEFAULT=3
```

### What You Need To Add On Render

For the **new inference service**, add:

- `MODEL_PATH=models/plant_disease_model.pt`
- `LABELS_PATH=models/labels.json`
- `ALLOWED_ORIGINS=*`
- `TOP_K_DEFAULT=3`

Notes:

- Render provides `PORT` automatically for deployed services
- you do not need Firebase keys for this inference service
- you do not need `GOOGLE_AI_API_KEY` for this inference service

### Your Existing Node Backend Service

For your current Node backend Render service:

- no new environment variables are required for the model inference service integration right now
- your existing Firebase and Gemini environment variables can stay as they are
- recommended cleanup later: set `NODE_ENV=production` instead of `development` on Render

### Frontend Environment Variable

Wherever the frontend runs, set:

```text
VITE_INFERENCE_API_BASE_URL=https://your-inference-service.onrender.com
```

This is separate from your normal backend API URL.

## Predict Example

```bash
curl -X POST "http://localhost:8000/predict" ^
  -F "file=@C:\path\to\leaf.jpg"
```

## Next Integration Step

After the first trained model exists:

1. Put the model and labels into `inference-service/models/`
2. Run the service locally
3. Test `/predict` with a few leaf images
4. Deploy this service to Render
5. Connect the React disease upload page to this endpoint
