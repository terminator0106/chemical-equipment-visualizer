param(
  [string]$Name = "ChemVizDesktop"
)

$ErrorActionPreference = "Stop"

Write-Host "Building $Name with PyInstaller..."

pyinstaller --noconsole --name $Name --onefile main.py

Write-Host "Done. Output: dist\\$Name.exe"