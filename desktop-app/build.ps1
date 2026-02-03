# ChemViz Desktop Application Build Script
# Creates a standalone Windows executable

param(
  [string]$Name = "ChemVizDesktop",
  [string]$Version = "1.0.0"
)

$ErrorActionPreference = "Stop"

# Always run from this script's directory (avoids "main.py not found" when invoked elsewhere)
Set-Location $PSScriptRoot

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Building ChemViz Desktop Application" -ForegroundColor Cyan
Write-Host "Version: $Version" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if PyInstaller is installed
Write-Host "Checking dependencies..." -ForegroundColor Yellow
try {
    pyinstaller --version | Out-Null
} catch {
    Write-Host "PyInstaller not found. Installing..." -ForegroundColor Yellow
    pip install pyinstaller
}

Write-Host "Dependencies OK" -ForegroundColor Green
Write-Host ""

# Clean previous builds
Write-Host "Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}
if (Test-Path "build") {
    Remove-Item -Recurse -Force "build"
}
if (Test-Path "$Name.spec") {
    Remove-Item -Force "$Name.spec"
}
Write-Host "Cleanup complete" -ForegroundColor Green
Write-Host ""

# Build the executable
Write-Host "Building executable with PyInstaller..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
Write-Host ""

$pyinstallerArgs = @(
    "--noconsole",
    "--onefile",
    "--name", $Name,
    "--hidden-import", "PyQt5",
    "--hidden-import", "PyQt5.QtCore",
    "--hidden-import", "PyQt5.QtGui",
    "--hidden-import", "PyQt5.QtWidgets",
    "--hidden-import", "matplotlib",
    "--hidden-import", "matplotlib.backends.backend_qt5agg",
    "--hidden-import", "pandas",
    "--hidden-import", "requests"
)

if (Test-Path "assets\icon.ico") {
    $pyinstallerArgs += @("--icon", "assets\icon.ico")
}

if (Test-Path "styles.qss") {
    $pyinstallerArgs += @("--add-data", "styles.qss;.")
}

$pyinstallerArgs += "main.py"

pyinstaller @pyinstallerArgs

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Green
    Write-Host "Build successful!" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Output: dist\$Name.exe" -ForegroundColor Cyan
    
    $fileSize = (Get-Item "dist\$Name.exe").Length / 1MB
    Write-Host "Size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
    Write-Host ""
    
    # Copy to frontend public/downloads folder
    $downloadsPath = "..\frontend\public\downloads"
    if (-not (Test-Path $downloadsPath)) {
        New-Item -ItemType Directory -Path $downloadsPath | Out-Null
    }
    
    Write-Host "Copying to frontend downloads folder..." -ForegroundColor Yellow
    Copy-Item "dist\$Name.exe" "$downloadsPath\$Name.exe" -Force
    Write-Host "Done! File available at: $downloadsPath\$Name.exe" -ForegroundColor Green
    
} else {
    Write-Host ""
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "You can now run the application by executing:" -ForegroundColor Cyan
Write-Host "  .\dist\$Name.exe" -ForegroundColor White
Write-Host ""