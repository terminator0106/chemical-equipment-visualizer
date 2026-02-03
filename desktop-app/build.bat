@echo off
REM ChemViz Desktop Application Build Script for Windows
REM Simple batch file alternative to PowerShell script

REM Always run from this script's directory
cd /d "%~dp0"

echo ======================================
echo Building ChemViz Desktop Application
echo ======================================
echo.

REM Check for Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

REM Install PyInstaller if needed
echo Checking PyInstaller...
pip show pyinstaller >nul 2>&1
if errorlevel 1 (
    echo Installing PyInstaller...
    pip install pyinstaller
)

REM Clean previous builds
echo Cleaning previous builds...
if exist dist rd /s /q dist
if exist build rd /s /q build
if exist ChemVizDesktop.spec del /q ChemVizDesktop.spec

REM Build the executable
echo.
echo Building executable...
echo This may take a few minutes...
echo.

set PYI_DATA=
if exist "styles.qss" set PYI_DATA=--add-data "styles.qss;."

pyinstaller --noconsole --onefile --name ChemVizDesktop %PYI_DATA% ^
    --hidden-import PyQt5 ^
    --hidden-import matplotlib ^
    --hidden-import pandas ^
    --hidden-import requests ^
    main.py

if errorlevel 1 (
    echo.
    echo Build FAILED!
    pause
    exit /b 1
)

echo.
echo ======================================
echo Build successful!
echo ======================================
echo.
echo Output: dist\ChemVizDesktop.exe
echo.

REM Copy to frontend downloads folder
if not exist "..\frontend\public\downloads" mkdir "..\frontend\public\downloads"
copy /y "dist\ChemVizDesktop.exe" "..\frontend\public\downloads\ChemVizDesktop.exe" >nul

echo File copied to frontend downloads folder
echo.
echo You can now run the application:
echo   .\dist\ChemVizDesktop.exe
echo.

pause
