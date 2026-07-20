#!/usr/bin/env bash
# RagVisualizer — sobe backend (FastAPI :8000) e frontend (Vite :5173).
# Ctrl+C encerra os dois.
set -e
cd "$(dirname "$0")"

echo "=== RagVisualizer ==="

# --- Backend: cria o venv e instala dependencias na primeira execucao ---
if [ ! -x "backend/.venv/bin/python" ]; then
    echo "[backend] criando ambiente virtual..."
    python3 -m venv backend/.venv
    echo "[backend] instalando dependencias (pode demorar na primeira vez)..."
    backend/.venv/bin/pip install -r backend/requirements.txt
fi

# --- Frontend: instala dependencias na primeira execucao ---
if [ ! -d "frontend/node_modules" ]; then
    echo "[frontend] instalando dependencias npm..."
    (cd frontend && npm install --no-fund --no-audit)
fi

cleanup() {
    echo ""
    echo "Encerrando servidores..."
    kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
    wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "[backend] iniciando em http://localhost:8000 ..."
(cd backend && .venv/bin/uvicorn app.main:app --port 8000 --reload) &
BACKEND_PID=$!

echo "[frontend] iniciando em http://localhost:5173 ..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "Abra http://localhost:5173 no navegador. Ctrl+C para parar."
wait
