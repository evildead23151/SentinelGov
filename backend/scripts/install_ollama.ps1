$ErrorActionPreference = "Stop"

Write-Host "[INFO] Starting Ollama Installer..."

# Define URLs and Paths
$OllamaUrl = "https://ollama.com/download/OllamaSetup.exe"
$InstallerPath = "$PSScriptRoot\OllamaSetup.exe"

# 1. Download
Write-Host "[INFO] Downloading OllamaSetup.exe from $OllamaUrl..."
try {
    Invoke-WebRequest -Uri $OllamaUrl -OutFile $InstallerPath -UseBasicParsing
    Write-Host "[SUCCESS] Download complete."
} catch {
    Write-Error "[ERROR] Failed to download Ollama. Please check your internet connection."
    exit 1
}

# 2. Install
Write-Host "[INFO] Launching Installer. Please accept the UAC prompt if it appears."
try {
    # Start the installer and wait for it to close
    Start-Process -FilePath $InstallerPath -ArgumentList "/silent" -Wait -Verb RunAs
    Write-Host "[SUCCESS] Installation process finished."
} catch {
    Write-Error "[ERROR] Failed to launch installer. You may need to run this script as Administrator."
    exit 1
}

# 3. Verify
Write-Host "[INFO] Verifying installation..."
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

if (Get-Command "ollama" -ErrorAction SilentlyContinue) {
    Write-Host "[SUCCESS] Ollama is installed and in PATH."
    Write-Host "[INFO] Starting Ollama Service..."
    Start-Process "ollama" -ArgumentList "serve" -NoNewWindow
} else {
    Write-Warning "[WARNING] Ollama executable not found in PATH yet. You may need to restart your terminal or computer."
}
