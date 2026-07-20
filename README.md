# RagVisualizer

Visualizador 3D interativo de embeddings semânticos. Cole textos, gere embeddings via
qualquer provedor compatível com a API OpenAI e explore o mapa semântico em 3D.

![stack](https://img.shields.io/badge/stack-FastAPI%20%2B%20React%20%2B%20Plotly-4e79a7)

## Como funciona

1. **Embeddings** — os textos são enviados a um provedor OpenAI-compatível
   (OpenAI, Azure, Ollama, LM Studio…) configurável pela UI: base URL, API key e modelo.
2. **Projeção 3D** — os vetores de N dimensões são reduzidos para 3D com
   **UMAP** (padrão), **t-SNE** ou **PCA**.
3. **Precisão semântica** — vizinhos mais próximos, similaridade e clustering são
   calculados por **cosseno no espaço original de alta dimensão**, não no 3D.
   A UI exibe também a *trustworthiness* (0–1) da projeção, indicando o quanto a
   disposição visual preservou as vizinhanças reais.

## Rodando

### Início rápido

- **Windows**: dê dois cliques em `start.bat` (ou rode no terminal). Abre backend e frontend em janelas separadas e o navegador em http://localhost:5173.
- **Linux/macOS**: `./start.sh` (na primeira vez: `chmod +x start.sh`). Ctrl+C encerra os dois servidores.

Na primeira execução os scripts criam o venv e instalam as dependências automaticamente (requer Python 3.10+ e Node.js no PATH).

### Manual — Backend (porta 8000)

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Opcional: copie `.env.example` para `.env` para definir defaults (base URL, modelo, key).

### Manual — Frontend (porta 5173)

```powershell
cd frontend
npm install
npm run dev
```

Abra http://localhost:5173, configure o provedor, clique em **Carregar exemplo** e em **Visualizar**.

## Uso com provedores locais

- **Ollama**: base URL `http://localhost:11434/v1`, modelo ex. `nomic-embed-text`, key vazia.
- **LM Studio**: base URL `http://localhost:1234/v1`.

## API

`POST /api/visualize`

```json
{
  "texts": ["...", "..."],
  "provider": {"base_url": "https://api.openai.com/v1", "api_key": "sk-...", "model": "text-embedding-3-small"},
  "reduction": {"method": "umap", "n_neighbors": 15, "min_dist": 0.1},
  "clustering": {"method": "hdbscan"},
  "neighbors_k": 5
}
```

Retorna pontos `{x, y, z, cluster, neighbors[]}` + metadados (`trustworthiness`, dimensão, modelo).

A API key trafega apenas em memória durante a requisição — nunca é persistida nem logada.
