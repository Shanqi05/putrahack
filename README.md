# TripleGain

TripleGain is a smart farming platform built to help growers make faster, better decisions with AI-assisted disease detection, crop operations tools, a marketplace flow, and a built-in agricultural assistant.

It combines a modern React frontend, a Node backend for app features, and a dedicated Python inference service for plant disease prediction.

## What TripleGain Delivers

- AI plant disease detection with image upload, confidence scores, history tracking, and treatment guidance
- Farmer dashboard with weather awareness and recent AI scan visibility
- Marketplace and leftover-management flows for produce handling
- AI chatbot support with attachments, emoji input, and clear-chat behavior
- Firebase-backed app data for users, messages, notifications, and disease scan history

## System Overview

TripleGain is split into 4 clear parts:

- `client/`: React + Vite frontend
- `server/`: Node + Express API for auth, chatbot, weather, and app logic
- `inference-service/`: FastAPI + PyTorch service for plant disease prediction
- `ml/`: training scripts, manifests, and model pipeline notes

## Repository Layout

```text
putrahack/
|-- client/
|-- server/
|-- inference-service/
|-- ml/
```

## Current Feature Status

- Authentication: implemented
- Dashboard: implemented
- Disease detection: implemented
- Disease scan history: implemented
- Treatment guide: implemented
- Chatbot: implemented
- Marketplace: implemented
- Leftover workflow: implemented
- ML training and inference pipeline: implemented

## Quick Start

Create these files first:

- `server/.env` from `server/.env.example`
- `client/.env` from `client/.env.example`
- optional: `inference-service/.env` from `inference-service/.env.example`

Run the project in 3 terminals:

```bash
# Terminal 1 - Main backend
cd server
npm install
npm start

# Terminal 2 - Inference service
cd inference-service
python -m pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 3 - Frontend
cd client
npm install
npm run dev
```

Open:

- Frontend: `http://localhost:3000`
- Main backend health: `http://localhost:5000/api/health`
- Inference service health: `http://localhost:8000/health`

## Environment Setup

### Frontend

For local development:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_INFERENCE_API_BASE_URL=http://localhost:8000
```

For Render or Lovable deployments:

```env
VITE_API_BASE_URL=https://vhack-backend-branch.onrender.com
VITE_INFERENCE_API_BASE_URL=https://plant-disease-inference.onrender.com
```

### Main Backend

Required values include:

- `JWT_SECRET`
- `GOOGLE_AI_API_KEY`
- Firebase config values used by the Express app

### Inference Service

Required values include:

- `MODEL_PATH`
- `LABELS_PATH`
- `ALLOWED_ORIGINS`
- `TOP_K_DEFAULT`

Render provides `PORT` automatically for deployed services.

## Disease Detection Flow

The plant disease feature depends on the separate inference service.

Flow:

1. The frontend uploads an image from `client/src/pages/DiseaseDetection.jsx`.
2. The frontend sends the file to the inference service through `client/src/config/api.js`.
3. The inference service returns the predicted label, crop, condition, confidence, and top predictions.
4. The frontend saves successful scan metadata to Firestore history.
5. The UI renders the diagnosis, treatment guide, and historical tracking.

Important:

- `VITE_INFERENCE_API_BASE_URL` must point to the inference service
- if that variable is missing, the frontend can fall back to the main backend URL and the scan request can fail

## Deployment

### Main Backend on Render

- Runtime: Node
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`

### Inference Service on Render

- Runtime: Python
- Root directory: `inference-service`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/health`

### Frontend on Lovable

The Lovable project should use the frontend app from `client/` as its project root content.

Set these Lovable environment variables:

```env
VITE_API_BASE_URL=https://vhack-backend-branch.onrender.com
VITE_INFERENCE_API_BASE_URL=https://plant-disease-inference.onrender.com
```

## Related Documentation

- ML pipeline: `ml/README.md`
- Inference service: `inference-service/README.md`
- Dataset upload notes: `server/PLANT_DISEASE_PIPELINE.md`
