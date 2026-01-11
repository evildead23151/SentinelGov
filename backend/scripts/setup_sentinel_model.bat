@echo off
echo [INFO] Setting up SentinelGov Core AI Model...

echo [INFO] Waiting for Ollama service...
:CHECK
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [INFO] Ollama is running.
) else (
    echo [WAIT] Waiting for Ollama (is it installed?)...
    timeout /t 5 >nul
    goto CHECK
)

echo [INFO] Creating 'sentinel-core' from Modelfile...
cd ..
ollama create sentinel-core -f Modelfile

echo [SUCCESS] Model 'sentinel-core' created.
echo [INFO] Verifying...
ollama list
pause
