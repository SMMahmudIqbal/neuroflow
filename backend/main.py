"""
NeuroFlow API Server - Multimodal (Text & Image) 3D Latent Space Explorer
Developed by S. M. Mahmud Iqbal
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uuid
import base64

from latent_engine import LatentEngine, DocumentItem, ClusterGraphResponse
from sample_data import DEFAULT_DATASET
from vision_engine import VisionLatentEngine, ImageItem, ImageGraphResponse
from sample_images import generate_sample_images

app = FastAPI(
    title="NeuroFlow Latent Graph API",
    description="High-Dimensional Embedding Projection & 3D Neural Discovery Engine for Text & Vision. Developed by S. M. Mahmud Iqbal.",
    version="1.0.0"
)

LOCAL_FRONTEND_ORIGINS = {"http://localhost:5173", "http://127.0.0.1:5173"}

# Enable CORS only for the local Vite frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(LOCAL_FRONTEND_ORIGINS),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.middleware("http")
async def enforce_local_browser_origin(request, call_next):
    origin = request.headers.get("origin")
    if origin is not None and origin not in LOCAL_FRONTEND_ORIGINS:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=403, content={"detail": "Browser origin not allowed."})
    return await call_next(request)

engine = LatentEngine()
vision_engine = VisionLatentEngine()

# Mode: "vision" or "text"
# In-memory document & image states (Both start as 100% CLEAN SLATES)
active_documents: List[DocumentItem] = []
active_images: List[ImageItem] = []

current_mode: str = "vision"
current_method: str = "tsne"
current_threshold: float = 0.38
MAX_IMAGE_BYTES = 5 * 1024 * 1024


class RecalculateRequest(BaseModel):
    method: str = "tsne"
    similarityThreshold: float = 0.38
    mode: Optional[str] = "vision"


class AddDocumentRequest(BaseModel):
    title: str
    category: str
    content: str


class SearchQueryRequest(BaseModel):
    query: str
    topK: int = 6


@app.get("/")
def root():
    return {
        "project": "NeuroFlow",
        "description": "3D Latent Space & Neural Graph Explorer (Text & Vision)",
        "developer": "Developed by S. M. Mahmud Iqbal",
        "mode": current_mode,
        "totalImages": len(active_images),
        "totalDocuments": len(active_documents),
        "status": "online"
    }


# ==========================================
# VISION 3D LATENT SPACE ENDPOINTS
# ==========================================

@app.get("/api/vision/graph")
def get_vision_graph(method: str = "tsne", threshold: float = 0.38):
    global current_method, current_threshold
    current_method = method
    current_threshold = threshold
    return vision_engine.generate_image_layout(
        images=active_images,
        method=method,
        similarity_threshold=threshold
    )


@app.post("/api/vision/upload")
async def upload_image(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    category: Optional[str] = Form("Vision")
):
    global active_images
    try:
        content_bytes = await file.read(MAX_IMAGE_BYTES + 1)
        if len(content_bytes) > MAX_IMAGE_BYTES:
            raise HTTPException(status_code=413, detail="Image exceeds the 5 MiB upload limit.")
        if not content_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        features, dominant_hex, brightness = vision_engine.extract_visual_features(content_bytes)

        # Base64 data URL for fast 3D texture display
        mime_type = file.content_type or "image/jpeg"
        b64_str = f"data:{mime_type};base64," + base64.b64encode(content_bytes).decode('utf-8')

        img_id = f"img-{str(uuid.uuid4())[:8]}"
        img_title = title.strip() if title and title.strip() else file.filename

        new_image = ImageItem(
            id=img_id,
            title=img_title,
            category=category.strip() if category and category.strip() else "Visual Cluster",
            imageUrl=b64_str,
            features=features
        )
        active_images.append(new_image)

        # Recompute 3D projection
        graph = vision_engine.generate_image_layout(
            images=active_images,
            method=current_method,
            similarity_threshold=current_threshold
        )
        return {"message": "Image successfully projected into 3D latent space", "graph": graph}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")


@app.post("/api/vision/clear")
def clear_vision_slate():
    global active_images
    active_images = []
    return vision_engine.generate_image_layout(
        images=[],
        method=current_method,
        similarity_threshold=current_threshold
    )


@app.post("/api/vision/load-sample")
def load_vision_sample():
    global active_images
    active_images = generate_sample_images(vision_engine)
    return vision_engine.generate_image_layout(
        images=active_images,
        method=current_method,
        similarity_threshold=current_threshold
    )


# ==========================================
# TEXT 3D LATENT SPACE ENDPOINTS
# ==========================================

@app.get("/api/graph", response_model=ClusterGraphResponse)
def get_graph(method: str = "tsne", threshold: float = 0.38):
    global current_method, current_threshold
    current_method = method
    current_threshold = threshold
    return engine.generate_embeddings_and_layout(
        documents=active_documents,
        method=method,
        similarity_threshold=threshold
    )


@app.post("/api/clear")
def clear_text_slate():
    global active_documents
    active_documents = []
    return engine.generate_embeddings_and_layout(
        documents=[],
        method=current_method,
        similarity_threshold=current_threshold
    )


@app.post("/api/load-sample")
def load_text_sample():
    global active_documents
    active_documents = list(DEFAULT_DATASET)
    return engine.generate_embeddings_and_layout(
        documents=active_documents,
        method=current_method,
        similarity_threshold=current_threshold
    )


@app.post("/api/reset")
def reset_dataset():
    return clear_text_slate()


@app.post("/api/documents", response_model=ClusterGraphResponse)
def add_document(req: AddDocumentRequest):
    global active_documents
    if not req.title.strip() or not req.content.strip():
        raise HTTPException(status_code=400, detail="Title and content are required")

    new_doc = DocumentItem(
        id=f"node-{str(uuid.uuid4())[:8]}",
        title=req.title.strip(),
        category=req.category.strip() or "General",
        content=req.content.strip()
    )
    active_documents.append(new_doc)
    return engine.generate_embeddings_and_layout(
        documents=active_documents,
        method=current_method,
        similarity_threshold=current_threshold
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
