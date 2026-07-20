"""RagVisualizer API.

POST /api/visualize: textos -> embeddings (provedor generico OpenAI-compativel)
-> projecao 3D (UMAP/t-SNE/PCA) -> clustering + vizinhos por cosseno no espaco
original + trustworthiness da projecao.

A API key recebida e usada apenas em memoria durante a requisicao; nunca e
persistida nem logada.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import config
from .analysis import cluster, nearest_neighbors, projection_trustworthiness
from .embeddings import embed_texts
from .reduce import reduce_to_3d
from .schemas import Meta, Neighbor, Point, VisualizeRequest, VisualizeResponse

app = FastAPI(title="RagVisualizer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/api/defaults")
def defaults() -> dict:
    """Defaults nao sensiveis para pre-preencher a UI (a key nunca e exposta)."""
    return {
        "base_url": config.DEFAULT_BASE_URL,
        "model": config.DEFAULT_MODEL,
        "has_server_key": bool(config.DEFAULT_API_KEY),
    }


@app.post("/api/visualize", response_model=VisualizeResponse)
def visualize(request: VisualizeRequest) -> VisualizeResponse:
    texts = [t.strip() for t in request.texts if t.strip()]

    api_key = request.provider.api_key or config.DEFAULT_API_KEY
    vectors = embed_texts(
        texts,
        base_url=request.provider.base_url,
        api_key=api_key,
        model=request.provider.model,
    )

    coords = reduce_to_3d(vectors, request.reduction)
    labels = cluster(vectors, request.clustering)
    neighbors = nearest_neighbors(vectors, request.neighbors_k)
    trust = projection_trustworthiness(vectors, coords)

    points = [
        Point(
            id=i,
            text=texts[i],
            x=coords[i, 0],
            y=coords[i, 1],
            z=coords[i, 2],
            cluster=int(labels[i]),
            neighbors=[
                Neighbor(id=j, text=texts[j], score=round(score, 4))
                for j, score in neighbors[i]
            ],
        )
        for i in range(len(texts))
    ]

    meta = Meta(
        model=request.provider.model,
        dim=int(vectors.shape[1]),
        count=len(texts),
        trustworthiness=round(trust, 4),
        reduction_method=request.reduction.method,
        clustering_method=request.clustering.method,
    )
    return VisualizeResponse(points=points, meta=meta)
