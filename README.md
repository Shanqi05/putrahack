# 🌱 TripleGain

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white)

> **Empowering growers to make faster, better decisions.**
> TripleGain is a comprehensive smart farming platform that combines AI-assisted disease detection, crop operations tools, a marketplace flow, and a built-in agricultural assistant.

---

## ✨ What TripleGain Delivers

* 🔍 **AI Plant Disease Detection:** Image upload with confidence scores, history tracking, and actionable treatment guidance.
* 📊 **Farmer Dashboard:** Real-time weather awareness and recent AI scan visibility at a glance.
* 🛒 **Integrated Marketplace:** End-to-end flows for produce handling and leftover-management.
* 💬 **AI Agricultural Assistant:** Chatbot support featuring attachments, emoji input, and clear-chat behavior.
* ☁️ **Cloud-Backed Data:** Robust Firebase integration for users, messaging, notifications, and scan history.

---

## 🏗 System Architecture

TripleGain relies on a modern, decoupled microservices architecture divided into four core components:

```text
putrahack/
├── 💻 client/             # React + Vite frontend
├── ⚙️ server/             # Node + Express API (Auth, Chatbot, Weather, Logic)
├── 🧠 inference-service/  # FastAPI + PyTorch (Plant disease prediction)
└── 🔬 ml/                 # Training scripts, manifests, and model pipeline
```

### 📍 Current Feature Status

| Feature | Status | Feature | Status |
| :--- | :--- | :--- | :--- |
| **Authentication** | ✅ Implemented | **Chatbot** | ✅ Implemented |
| **Dashboard** | ✅ Implemented | **Marketplace** | ✅ Implemented |
| **Disease Detection** | ✅ Implemented | **Leftover Workflow** | ✅ Implemented |
| **Scan History** | ✅ Implemented | **ML Training Pipeline**| ✅ Implemented |
| **Treatment Guide** | ✅ Implemented | **Inference Pipeline** | ✅ Implemented |

-----

## 🚀 Quick Start

### 1\. Environment Setup

Before running the application, duplicate the example environment files:

  * Copy `server/.env.example` to `server/.env`
  * Copy `client/.env.example` to `client/.env`
  * *(Optional)* Copy `inference-service/.env.example` to `inference-service/.env`

### 2\. Run the Services

You will need three separate terminal instances to run the full stack locally.

**Terminal 1: Main Backend**

```bash
cd server
npm install
npm start
```

**Terminal 2: AI Inference Service**

```bash
cd inference-service
python -m pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 3: Frontend Client**

```bash
cd client
npm install
npm run dev
```

### 3\. Access the Application

  * **Frontend UI:** `http://localhost:3000`
  * **Main Backend Health:** `http://localhost:5000/api/health`
  * **Inference Service Health:** `http://localhost:8000/health`

-----

## ⚙️ Environment Variables

### Frontend (`client/.env`)

| Environment | `VITE_API_BASE_URL` | `VITE_INFERENCE_API_BASE_URL` |
| :--- | :--- | :--- |
| **Local** | `http://localhost:5000` | `http://localhost:8000` |
| **Production** | `https://vhack-backend-branch.onrender.com` | `https://plant-disease-inference.onrender.com` |

### Main Backend (`server/.env`)

Required keys for full functionality:

  * `JWT_SECRET`
  * `GOOGLE_AI_API_KEY`
  * Firebase configuration credentials

### Inference Service (`inference-service/.env`)

Required keys for the ML model:

  * `MODEL_PATH`
  * `LABELS_PATH`
  * `ALLOWED_ORIGINS`
  * `TOP_K_DEFAULT`

-----

## 🔬 AI Disease Detection Flow

The core plant disease feature is powered by our dedicated Python inference service.

```text
[ User Upload ] ➔ (React Frontend) 
                       │
                       ▼ Secure API Route
             (FastAPI Inference Service) ➔ Analyzes via PyTorch Model
                       │
                       ▼ Returns Label, Crop, Condition & Confidence
             (React Frontend) ➔ Saves Metadata to (Firebase/Firestore)
                       │
                       ▼
[ Renders Diagnosis, Treatment Steps & History UI ]
```

> ⚠️ **Important:** Ensure `VITE_INFERENCE_API_BASE_URL` is correctly mapped. If missing, the frontend will fall back to the main backend URL, resulting in a failed scan request.

-----

## 🌍 Deployment

### Main Backend (Render)

  * **Runtime:** Node
  * **Root Directory:** `server`
  * **Build Command:** `npm install`
  * **Start Command:** `npm start`

### Inference Service (Render)

  * **Runtime:** Python
  * **Root Directory:** `inference-service`
  * **Build Command:** `pip install -r requirements.txt`
  * **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
  * **Health Check:** `/health`

### Frontend (Lovable)

Point the Lovable project root to the `client/` directory and inject the Production Environment Variables listed above.

-----

## 📚 Related Documentation

Dive deeper into the specific subsystems:

  * [🧠 ML Pipeline Notes](https://www.google.com/search?q=ml/README.md)
  * [⚙️ Inference Service Specs](https://www.google.com/search?q=inference-service/README.md)
  * [📂 Dataset Upload Logistics](https://www.google.com/search?q=server/PLANT_DISEASE_PIPELINE.md)
