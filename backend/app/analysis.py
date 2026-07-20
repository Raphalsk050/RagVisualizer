"""Analise semantica no espaco ORIGINAL de alta dimensao.

Tudo aqui usa distancia de cosseno sobre os vetores originais — nunca as
coordenadas 3D — para que os numeros exibidos na UI reflitam o significado
semantico real e nao a distorcao da projecao.
"""
import numpy as np
from sklearn.cluster import KMeans
from sklearn.manifold import trustworthiness as sk_trustworthiness

from .schemas import ClusteringConfig


def _normalize(vectors: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    return vectors / norms


def nearest_neighbors(vectors: np.ndarray, k: int) -> list[list[tuple[int, float]]]:
    """Para cada ponto, os k vizinhos mais proximos por cosseno no espaco original.

    Retorna, por ponto, lista de (indice, similaridade) em ordem decrescente.
    """
    n = vectors.shape[0]
    k = min(k, n - 1)
    unit = _normalize(vectors.astype(np.float64))
    sim = unit @ unit.T
    np.fill_diagonal(sim, -np.inf)  # exclui o proprio ponto

    result: list[list[tuple[int, float]]] = []
    for i in range(n):
        idx = np.argpartition(-sim[i], k)[:k]
        idx = idx[np.argsort(-sim[i][idx])]
        result.append([(int(j), float(sim[i][j])) for j in idx])
    return result


def cluster(vectors: np.ndarray, config: ClusteringConfig) -> np.ndarray:
    """Rotula cada ponto. HDBSCAN pode retornar -1 (ruido)."""
    n = vectors.shape[0]
    if config.method == "none" or n < 5:
        return np.zeros(n, dtype=int)

    unit = _normalize(vectors.astype(np.float64))

    if config.method == "kmeans":
        n_clusters = min(config.n_clusters, n)
        return KMeans(n_clusters=n_clusters, n_init=10, random_state=42).fit_predict(unit)

    # hdbscan (padrao): detecta o numero de grupos e marca ruido como -1.
    import hdbscan

    labels = hdbscan.HDBSCAN(
        min_cluster_size=max(2, min(5, n // 4)),
        min_samples=1,  # menos conservador: importante para datasets pequenos
        metric="euclidean",  # euclidiana sobre vetores normalizados ~ cosseno
    ).fit_predict(unit)

    # Se ainda assim tudo virou ruido, KMeans com heuristica sqrt(n) e melhor
    # que um grafico inteiro cinza.
    if (labels == -1).all():
        n_clusters = max(2, min(8, int(np.sqrt(n))))
        labels = KMeans(n_clusters=n_clusters, n_init=10, random_state=42).fit_predict(unit)
    return labels


def projection_trustworthiness(vectors: np.ndarray, coords3d: np.ndarray) -> float:
    """Fidelidade (0-1) da projecao 3D em preservar vizinhancas do espaco original."""
    n = vectors.shape[0]
    n_neighbors = min(5, (n - 1) // 2)
    if n_neighbors < 1:
        return 1.0
    return float(
        sk_trustworthiness(vectors, coords3d, n_neighbors=n_neighbors, metric="cosine")
    )
