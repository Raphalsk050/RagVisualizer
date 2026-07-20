@echo off
setlocal
cd /d "%~dp0"

echo === RagVisualizer ===

REM --- Backend: cria o venv e instala dependencias na primeira execucao ---
if not exist "backend\.venv\Scripts\python.exe" (
    echo [backend] criando ambiente virtual...
    python -m venv backend\.venv || goto :error
    echo [backend] instalando dependencias ^(pode demorar na primeira vez^)...
    backend\.venv\Scripts\pip.exe install -r backend\requirements.txt || goto :error
)

REM --- Frontend: instala dependencias na primeira execucao ---
if not exist "frontend\node_modules" (
    echo [frontend] instalando dependencias npm...
    pushd frontend
    call npm install --no-fund --no-audit
    if errorlevel 1 (
        popd
        goto :error
    )
    popd
)

echo [backend] iniciando em http://localhost:8000 ...
start "RagVisualizer backend" cmd /k "cd /d "%~dp0backend" && .venv\Scripts\uvicorn.exe app.main:app --port 8000 --reload"

echo [frontend] iniciando em http://localhost:5173 ...
start "RagVisualizer frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

REM da um tempo para o Vite subir antes de abrir o navegador
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo Servidores iniciados em janelas separadas. Feche as janelas para parar.
exit /b 0

:error
echo.
echo ERRO na inicializacao. Verifique se Python e Node.js estao instalados e no PATH.
pause
exit /b 1
