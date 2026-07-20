"""Contratos pydantic da API."""
from typing import Literal, Optional

from pydantic import BaseModel, Field

from . import config


class ProviderConfig(BaseModel):
    """Provedor generico OpenAI-compativel (OpenAI, Azure, Ollama, LM Studio...).

    Os defaults vem do .env do servidor; a UI pode sobrescrever tudo.
    """

    base_url: str = config.DEFAULT_BASE_URL
    api_key: str = ""
    model: str = config.DEFAULT_MODEL


class ReductionConfig(BaseModel):
    method: Literal["umap", "tsne", "pca"] = "umap"
    # UMAP
    n_neighbors: int = Field(default=15, ge=2, le=200)
    min_dist: float = Field(default=0.1, ge=0.0, le=0.99)
    # t-SNE
    perplexity: float = Field(default=30.0, ge=2.0, le=100.0)


class ClusteringConfig(BaseModel):
    method: Literal["hdbscan", "kmeans", "none"] = "hdbscan"
    n_clusters: int = Field(default=8, ge=2, le=50)


class VisualizeRequest(BaseModel):
    texts: list[str]
    provider: ProviderConfig = ProviderConfig()
    reduction: ReductionConfig = ReductionConfig()
    clustering: ClusteringConfig = ClusteringConfig()
    neighbors_k: int = Field(default=5, ge=1, le=20)


class Neighbor(BaseModel):
    id: int
    text: str
    score: float  # similaridade de cosseno no espaco original


class Point(BaseModel):
    id: int
    text: str
    x: float
    y: float
    z: float
    cluster: int
    neighbors: list[Neighbor]


class Meta(BaseModel):
    model: str
    dim: int
    count: int
    trustworthiness: Optional[float] = None
    reduction_method: str
    clustering_method: str


class VisualizeResponse(BaseModel):
    points: list[Point]
    meta: Meta
