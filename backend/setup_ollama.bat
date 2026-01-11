@echo off
echo [INFO] Anti-Gravity AI Setup
echo [INFO] Checking for Ollama...

where ollama >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Ollama is not installed or not in PATH.
    echo [ACTION] Please install Ollama from https://ollama.com/download
    exit /b 1
)

echo [INFO] Ollama found. Checking service...
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [INFO] Ollama service is running.
) else (
    echo [INFO] Starting Ollama in background...
    start /B ollama serve
    timeout /t 5
)

echo [INFO] Pulling Llama3 model (this may take a while)...
ollama pull llama3

echo [SUCCESS] Model 'llama3' is ready.
echo [INFO] You can now use the SentinelGov AI Agent.
pause
