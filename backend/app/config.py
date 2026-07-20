"""Defaults opcionais carregados de variaveis de ambiente / .env.

A API key enviada pela UI sempre tem precedencia; estes valores servem apenas
como fallback para desenvolvimento local.
"""
import os

from dotenv import load_dotenv

load_dotenv()

DEFAULT_BASE_URL = os.getenv("EMBEDDINGS_BASE_URL", "https://api.openai.com/v1")
DEFAULT_MODEL = os.getenv("EMBEDDINGS_MODEL", "text-embedding-3-small")
DEFAULT_API_KEY = os.getenv("EMBEDDINGS_API_KEY", "")
