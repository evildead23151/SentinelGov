@echo off
REM SentinelGov Backend Startup Script
REM This ensures the backend always starts correctly

echo ========================================
echo   SentinelGov Backend Startup
echo ========================================
echo.

cd /d "%~dp0"

REM Check if virtual environment exists
if exist "venv\Scripts\activate.bat" (
    echo [1/3] Activating virtual environment...
    call venv\Scripts\activate.bat
) else (
    echo [!] No virtual environment found, using global Python
)

REM Seed database if it doesn't exist or is empty
if not exist "app.db" (
    echo [2/3] Database not found, creating and seeding...
    python seed_tenders.py
) else (
    echo [2/3] Database exists, skipping seed
)

echo [3/3] Starting Uvicorn server on port 8000...
echo.
echo ========================================
echo Backend will be available at:
echo   http://localhost:8000
echo.
echo Login Credentials:
echo   Investigator: investigator / police123
echo   Finance:      treasury / finance123
echo ========================================
echo.
echo Press CTRL+C to stop the server
echo.

python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
