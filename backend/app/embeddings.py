"""Cliente generico de embeddings compativel com a API OpenAI.

O mesmo codigo atende OpenAI, Azure OpenAI, Ollama (http://localhost:11434/v1),
LM Studio e qualquer provedor que exponha POST /embeddings no formato OpenAI —
basta mudar base_url / model / api_key.
"""
import numpy as np
from fastapi import HTTPException
from openai import APIError, APIConnectionError, AuthenticationError, OpenAI

BATCH_SIZE = 128


def embed_texts(texts: list[str], base_url: str, api_key: str, model: str) -> np.ndarray:
    """Gera embeddings para os textos e retorna array (N, dim) float32."""
    if not texts:
        raise HTTPException(status_code=400, detail="Nenhum texto informado.")
    if any(not t.strip() for t in texts):
        raise HTTPException(status_code=400, detail="Textos vazios nao sao permitidos.")

    # Alguns provedores locais (Ollama) aceitam key vazia, mas o cliente exige algo.
    client = OpenAI(base_url=base_url, api_key=api_key or "not-needed")

    vectors: list[list[float]] = []
    try:
        for start in range(0, len(texts), BATCH_SIZE):
            batch = texts[start : start + BATCH_SIZE]
            response = client.embeddings.create(model=model, input=batch)
            # A API garante a ordem, mas ordenamos por index por seguranca.
            for item in sorted(response.data, key=lambda d: d.index):
                vectors.append(item.embedding)
    except AuthenticationError:
        raise HTTPException(status_code=401, detail="API key invalida para este provedor.")
    except APIConnectionError:
        raise HTTPException(
            status_code=502,
            detail=f"Nao foi possivel conectar ao provedor em {base_url}.",
        )
    except APIError as exc:
        raise HTTPException(status_code=502, detail=f"Erro do provedor: {exc}")

    return np.asarray(vectors, dtype=np.float32)
