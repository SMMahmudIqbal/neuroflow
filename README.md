# NeuroFlow: 3D Latent Space & Neural Graph Explorer

> **Developed by S. M. Mahmud Iqbal**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-r160+-black.svg?logo=three.js&logoColor=white)](https://threejs.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

**NeuroFlow** is an interactive, full-stack 3D latent space visualizer and knowledge graph discovery platform. It projects high-dimensional document and semantic embeddings into an explorable 3D celestial universe using non-linear manifold learning techniques (**t-SNE**, **PCA**, **UMAP**).

---

## 🌟 Key Highlights & Engineering Features

- **Hardware Instancing at 60 FPS**: Renders thousands of multidimensional vector nodes using Three.js `InstancedMesh` with per-instance dynamic matrices and color buffers in a single GPU draw call.
- **FastAPI Latent Engine**: High-throughput mathematical engine that performs feature extraction (TF-IDF with n-grams), dimensionality reduction to 3D Cartesian space $(x, y, z)$, and calculates pairwise cosine similarities.
- **Real-time Manifold Recalculation**: Toggle dynamically between **t-SNE**, **PCA**, and **UMAP**, or adjust the synaptic cosine similarity threshold slider on the fly.
- **Semantic Vector Search**: Instant cosine distance search across high-dimensional vector spaces with smooth camera focus transitions.
- **Interactive Knowledge Ingestion**: Inject custom technical documents or upload `.txt`, `.md`, and `.csv` files that are automatically chunked and projected into the latent galaxy.
- **Spatial Web Audio FX**: Synthesized browser audio providing sound design for node interactions and camera jumps.

---

## 🏗️ Architecture

```mermaid
flowchart TD
    subgraph Frontend ["Frontend (React + Vite + Three.js + R3F)"]
        UI["Control Panel & Search Bar"]
        Canvas["3D WebGL Canvas (InstancedMesh)"]
        Audio["Web Audio Synthesizer"]
    end

    subgraph Backend ["Backend (FastAPI + Python 3.12)"]
        API["FastAPI REST Endpoints"]
        Engine["LatentEngine"]
        TFIDF["TF-IDF Vectorizer (512-D)"]
        Manifold["t-SNE / PCA / UMAP Reducer"]
        Graph["Cosine Similarity Matrix"]
    end

    UI -->|Query / Settings / Upload| API
    API --> Engine
    Engine --> TFIDF
    TFIDF --> Manifold
    TFIDF --> Graph
    Manifold -->|Coordinates (x, y, z)| API
    Graph -->|Synaptic Edges| API
    API -->|Nodes & Edges Payload| Canvas
    Canvas --> Audio
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (v24 recommended)
- **Python**: 3.10+ (3.12 recommended)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```
*The FastAPI backend will run on `http://localhost:8000` with interactive Swagger docs at `http://localhost:8000/docs`.*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## 💻 Tech Stack

- **Frontend**: React 18, TypeScript, Three.js, `@react-three/fiber`, `@react-three/drei`, Tailwind CSS v4, Lucide React, Canvas Confetti.
- **Backend**: FastAPI, Uvicorn, Scikit-Learn, NumPy, SciPy, Pydantic, Python-Multipart.

---

## 👤 Author & Attribution
**Developed by S. M. Mahmud Iqbal**
