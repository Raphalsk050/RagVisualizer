"""Reducao dimensional: N dims -> 3D para visualizacao.

A projecao 3D e apenas disposicao visual; as metricas semanticas (vizinhos,
similaridade) sao sempre calculadas no espaco original em analysis.py.
"""
import numpy as np
from fastapi import HTTPException
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE

from .schemas import ReductionConfig


def reduce_to_3d(vectors: np.ndarray, config: ReductionConfig) -> np.ndarray:
    """Reduz (N, dim) para (N, 3). Ajusta parametros para datasets pequenos."""
    n = vectors.shape[0]
    if n < 4:
        raise HTTPException(
            status_code=400,
            detail="Sao necessarios pelo menos 4 textos para projetar em 3D.",
        )

    if config.method == "pca":
        coords = PCA(n_components=3).fit_transform(vectors)

    elif config.method == "tsne":
        # perplexity precisa ser < n
        perplexity = min(config.perplexity, max(2.0, (n - 1) / 3.0))
        coords = TSNE(
            n_components=3,
            metric="cosine",
            perplexity=perplexity,
            init="pca" if n > 4 else "random",
            random_state=42,
        ).fit_transform(vectors)

    elif config.method == "umap":
        import umap  # import tardio: umap e lento para importar

        n_neighbors = int(min(config.n_neighbors, n - 1))
        coords = umap.UMAP(
            n_components=3,
            metric="cosine",
            n_neighbors=max(2, n_neighbors),
            min_dist=config.min_dist,
            random_state=42,
        ).fit_transform(vectors)

    else:  # pragma: no cover - pydantic ja valida
        raise HTTPException(status_code=400, detail=f"Metodo desconhecido: {config.method}")

    return np.asarray(coords, dtype=np.float64)
