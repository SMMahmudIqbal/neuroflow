"""
NeuroFlow Engine - High-Dimensional Latent Space & Neural Graph Backend
Developed by S. M. Mahmud Iqbal
"""

from typing import List, Optional, Dict, Any
import numpy as np
from sklearn.manifold import TSNE
from sklearn.decomposition import PCA
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pydantic import BaseModel
import re

# Try importing UMAP, fallback to PCA/t-SNE if unavailable
try:
    import umap
    HAS_UMAP = True
except ImportError:
    HAS_UMAP = False


class DocumentItem(BaseModel):
    id: str
    title: str
    content: str
    category: str
    metadata: Optional[Dict[str, Any]] = None


class ClusterNode(BaseModel):
    id: str
    title: str
    category: str
    x: float
    y: float
    z: float
    summary: str
    clusterId: int
    neighbors: List[str]
    vectorMagnitude: float


class ClusterGraphResponse(BaseModel):
    nodes: List[ClusterNode]
    edges: List[Dict[str, Any]]
    categories: List[str]
    reductionMethod: str
    totalPoints: int
    stats: Dict[str, Any]


class LatentEngine:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=512,
            stop_words='english',
            ngram_range=(1, 2)
        )

    def generate_embeddings_and_layout(
        self,
        documents: List[DocumentItem],
        method: str = "tsne",
        similarity_threshold: float = 0.42
    ) -> ClusterGraphResponse:
        n_samples = len(documents)
        if n_samples == 0:
            return ClusterGraphResponse(
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

        # 1. Feature extraction
        corpus = [f"{doc.title} {doc.category} {doc.content}" for doc in documents]
        tfidf_matrix = self.vectorizer.fit_transform(corpus).toarray()

        # 2. Add slight stochastic latent jitter to avoid exact point collisions in 3D
        noise = np.random.normal(0, 0.015, tfidf_matrix.shape)
        enriched_matrix = tfidf_matrix + noise

        # 3. Dimensionality Reduction to 3D Coordinates (x, y, z)
        coords: np.ndarray
        if method == "pca" or n_samples < 4:
            n_components = min(3, n_samples)
            pca = PCA(n_components=n_components, random_state=42)
            transformed = pca.fit_transform(enriched_matrix)
            if n_components < 3:
                # Pad to 3 dimensions if very small sample
                padded = np.zeros((n_samples, 3))
                padded[:, :n_components] = transformed
                coords = padded
            else:
                coords = transformed
        elif method == "umap" and HAS_UMAP and n_samples >= 5:
            reducer = umap.UMAP(
                n_components=3,
                n_neighbors=min(15, n_samples - 1),
                min_dist=0.2,
                metric='cosine',
                random_state=42
            )
            coords = reducer.fit_transform(enriched_matrix)
        else:
            # Default: t-SNE 3D
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

        # 4. Normalize coordinates to visual bounding sphere [-25, 25]
        min_vals = coords.min(axis=0)
        max_vals = coords.max(axis=0)
        span = np.where((max_vals - min_vals) == 0, 1.0, max_vals - min_vals)
        normalized_coords = ((coords - min_vals) / span - 0.5) * 50.0

        # 5. Compute pairwise Cosine Similarity for Graph Edges
        sim_matrix = cosine_similarity(tfidf_matrix)

        # Extract categories & assign clusters
        unique_categories = list(dict.fromkeys([doc.category for doc in documents]))
        category_to_id = {cat: idx for idx, cat in enumerate(unique_categories)}

        nodes: List[ClusterNode] = []
        edges: List[Dict[str, Any]] = []

        for i, doc in enumerate(documents):
            neighbors = []
            for j in range(n_samples):
                if i != j and sim_matrix[i][j] >= similarity_threshold:
                    neighbors.append(documents[j].id)
                    if i < j:  # Only add undirected edge once
                        edges.append({
                            "source": doc.id,
                            "target": documents[j].id,
                            "weight": float(round(sim_matrix[i][j], 3))
                        })

            # Vector magnitude proxy
            mag = float(np.linalg.norm(tfidf_matrix[i]))

            nodes.append(
                ClusterNode(
                    id=doc.id,
                    title=doc.title,
                    category=doc.category,
                    x=float(round(normalized_coords[i][0], 3)),
                    y=float(round(normalized_coords[i][1], 3)),
                    z=float(round(normalized_coords[i][2], 3)),
                    summary=doc.content[:160] + ("..." if len(doc.content) > 160 else ""),
                    clusterId=category_to_id[doc.category],
                    neighbors=neighbors,
                    vectorMagnitude=float(round(mag, 3))
                )
            )

        # 6. Graph Statistics
        stats = {
            "totalNodes": len(nodes),
            "totalEdges": len(edges),
            "avgDegree": round(len(edges) * 2 / max(1, len(nodes)), 2),
            "density": round(len(edges) / max(1, (len(nodes) * (len(nodes) - 1) / 2)), 3) if len(nodes) > 1 else 0,
            "featureDimensions": int(tfidf_matrix.shape[1]),
        }

        return ClusterGraphResponse(
            nodes=nodes,
            edges=edges,
            categories=unique_categories,
            reductionMethod=method,
            totalPoints=len(nodes),
            stats=stats
        )

    def query_semantic_search(
        self,
        query: str,
        documents: List[DocumentItem],
        current_nodes: List[ClusterNode],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """Compute cosine similarity of query vector against existing latent nodes."""
        if not query.strip() or not documents:
            return []

        corpus = [f"{doc.title} {doc.category} {doc.content}" for doc in documents]
        doc_matrix = self.vectorizer.transform(corpus)
        query_vec = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, doc_matrix)[0]

        top_indices = np.argsort(similarities)[::-1][:top_k]

        results = []
        node_lookup = {n.id: n for n in current_nodes}
        for idx in top_indices:
            score = float(similarities[idx])
            if score > 0.05:  # meaningful match
                doc = documents[idx]
                node = node_lookup.get(doc.id)
                results.append({
                    "id": doc.id,
                    "title": doc.title,
                    "category": doc.category,
                    "score": round(score, 3),
                    "coordinates": [node.x, node.y, node.z] if node else [0, 0, 0],
                    "summary": doc.content[:140] + "..."
                })
        return results
