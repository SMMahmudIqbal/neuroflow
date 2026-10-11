"""
Vision Feature Extractor & Visual Latent Space Projector
Developed by S. M. Mahmud Iqbal
"""

from typing import List, Optional, Dict, Any
import numpy as np
from PIL import Image
from sklearn.manifold import TSNE
from sklearn.decomposition import PCA
from sklearn.metrics.pairwise import cosine_similarity
from pydantic import BaseModel
import io

try:
    import umap
    HAS_UMAP = True
except ImportError:
    HAS_UMAP = False


class ImageItem(BaseModel):
    id: str
    title: str
    category: str
    imageUrl: str  # local base64 or static url
    features: List[float]  # color histogram + spatial moments


class ImageNode(BaseModel):
    id: str
    title: str
    category: str
    imageUrl: str
    x: float
    y: float
    z: float
    clusterId: int
    neighbors: List[str]
    dominantHex: str
    brightness: float


class ImageGraphResponse(BaseModel):
    nodes: List[ImageNode]
    edges: List[Dict[str, Any]]
    categories: List[str]
    reductionMethod: str
    totalPoints: int
    stats: Dict[str, Any]


class VisionLatentEngine:
    """Extracts visual color histograms, perceptual hue moments, and spatial features."""

    def extract_visual_features(self, image_bytes: bytes) -> tuple[List[float], str, float]:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image_resized = image.resize((64, 64))
        img_arr = np.array(image_resized, dtype=np.float32) / 255.0  # (64, 64, 3)

        # 1. 3D Color Histogram (8 bins per RGB channel = 512 dimensions)
        hist, _ = np.histogramdd(
            img_arr.reshape(-1, 3),
            bins=(8, 8, 8),
            range=((0, 1), (0, 1), (0, 1))
        )
        hist = hist.flatten()
        norm = np.linalg.norm(hist)
        if norm > 0:
            hist = hist / norm

        # 2. Dominant Color calculation & Brightness
        mean_rgb = img_arr.mean(axis=(0, 1))
        brightness = float(0.299 * mean_rgb[0] + 0.587 * mean_rgb[1] + 0.114 * mean_rgb[2])
        r = int(np.clip(mean_rgb[0] * 255, 0, 255))
        g = int(np.clip(mean_rgb[1] * 255, 0, 255))
        b = int(np.clip(mean_rgb[2] * 255, 0, 255))
        dominant_hex = f"#{r:02x}{g:02x}{b:02x}"

        # 3. Spatial Color Gradients (quadrant color moments = 12 dimensions)
        q1 = img_arr[:32, :32].mean(axis=(0, 1))
        q2 = img_arr[:32, 32:].mean(axis=(0, 1))
        q3 = img_arr[32:, :32].mean(axis=(0, 1))
        q4 = img_arr[32:, 32:].mean(axis=(0, 1))
        spatial_features = np.concatenate([q1, q2, q3, q4])

        full_features = np.concatenate([hist, spatial_features])
        full_norm = np.linalg.norm(full_features)
        if full_norm > 0:
            full_features = full_features / full_norm

        return full_features.tolist(), dominant_hex, float(round(brightness, 3))

    def generate_image_layout(
        self,
        images: List[ImageItem],
        method: str = "tsne",
        similarity_threshold: float = 0.40
    ) -> ImageGraphResponse:
        n_samples = len(images)
        if n_samples == 0:
            return ImageGraphResponse(
                nodes=[],
                edges=[],
                categories=[],
                reductionMethod=method,
                totalPoints=0,
                stats={
                    "totalNodes": 0,
                    "totalEdges": 0,
                    "avgDegree": 0.0,
                    "density": 0.0,
                    "featureDimensions": 0,
                }
            )

        feature_matrix = np.array([img.features for img in images], dtype=np.float32)

        # Micro-jitter to prevent exact overlap in 3D
        noise = np.random.normal(0, 0.015, feature_matrix.shape)
        enriched_matrix = feature_matrix + noise

        # Dimensionality Reduction to 3D (x, y, z)
        coords: np.ndarray
        if method == "pca" or n_samples < 4:
            n_components = min(3, n_samples)
            pca = PCA(n_components=n_components, random_state=42)
            transformed = pca.fit_transform(enriched_matrix)
            if n_components < 3:
                padded = np.zeros((n_samples, 3))
                padded[:, :n_components] = transformed
                coords = padded
            else:
                coords = transformed
        elif method == "umap" and HAS_UMAP and n_samples >= 5:
            reducer = umap.UMAP(
                n_components=3,
                n_neighbors=min(15, n_samples - 1),
                min_dist=0.25,
                metric='cosine',
                random_state=42
            )
            coords = reducer.fit_transform(enriched_matrix)
        else:
            perplexity = min(30, max(2, n_samples // 3))
            tsne = TSNE(
                n_components=3,
                perplexity=perplexity,
                random_state=42,
                init="pca",
                learning_rate="auto",
                max_iter=1000
            )
            coords = tsne.fit_transform(enriched_matrix)

        # Normalize coordinates to 3D bounding box [-25, 25]
        min_vals = coords.min(axis=0)
        max_vals = coords.max(axis=0)
        span = np.where((max_vals - min_vals) == 0, 1.0, max_vals - min_vals)
        normalized_coords = ((coords - min_vals) / span - 0.5) * 50.0

        # Cosine similarity for visual graph edges
        sim_matrix = cosine_similarity(feature_matrix)

        unique_categories = list(dict.fromkeys([img.category for img in images]))
        category_to_id = {cat: idx for idx, cat in enumerate(unique_categories)}

        nodes: List[ImageNode] = []
        edges: List[Dict[str, Any]] = []

        for i, img in enumerate(images):
            neighbors = []
            for j in range(n_samples):
                if i != j and sim_matrix[i][j] >= similarity_threshold:
                    neighbors.append(images[j].id)
                    if i < j:
                        edges.append({
                            "source": img.id,
                            "target": images[j].id,
                            "weight": float(round(sim_matrix[i][j], 3))
                        })

            # Recompute dominant hex and brightness from features or metadata
            nodes.append(
                ImageNode(
                    id=img.id,
                    title=img.title,
                    category=img.category,
                    imageUrl=img.imageUrl,
                    x=float(round(normalized_coords[i][0], 3)),
                    y=float(round(normalized_coords[i][1], 3)),
                    z=float(round(normalized_coords[i][2], 3)),
                    clusterId=category_to_id[img.category],
                    neighbors=neighbors,
                    dominantHex="#38bdf8",
                    brightness=0.5
                )
            )

        stats = {
            "totalNodes": len(nodes),
            "totalEdges": len(edges),
            "avgDegree": round(len(edges) * 2 / max(1, len(nodes)), 2),
            "density": round(len(edges) / max(1, (len(nodes) * (len(nodes) - 1) / 2)), 3) if len(nodes) > 1 else 0,
            "featureDimensions": int(feature_matrix.shape[1]),
        }

        return ImageGraphResponse(
            nodes=nodes,
            edges=edges,
            categories=unique_categories,
            reductionMethod=method,
            totalPoints=len(nodes),
            stats=stats
        )
