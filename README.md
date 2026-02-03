# Chemical Equipment Visualizer (ChemViz)

Hybrid analytics platform for chemical equipment CSV data.

- Web app (React + Vite + Tailwind)
- Backend API (Django REST Framework)
- Desktop app (PyQt5) + downloadable Windows `.exe`

## Prerequisites

- Windows 10/11
- Python 3.10+ (recommended) and `pip`
- Node.js 18+ and `npm`

Recommended:

- A Python virtual environment (`venv`)

## Run Locally (Web)

### 1) Backend (Django)

```powershell
cd backend

# Install deps (first time)
python -m pip install Django djangorestframework django-cors-headers pandas numpy reportlab matplotlib

# Migrate DB (first time)
python manage.py migrate

# Create user (first time)
python manage.py createsuperuser

# Run
python manage.py runserver
```

Backend default: `http://127.0.0.1:8000`

### 2) Frontend (React + Vite)

```powershell
cd frontend

# Install deps (first time)
npm install

# Run dev server
npm run dev
```

Frontend default: `http://localhost:3000`

## Desktop App (Run from Source)

The desktop app calls the same backend API. For “smooth” operation, the backend must be running and reachable.

```powershell
cd desktop-app

pip install -r requirements.txt
python main.py
```

### API base URL

By default, the desktop app expects the backend at `http://127.0.0.1:8000/api`.

- If you run the backend on another machine or port, set the environment variable `CHEMVIZ_API_BASE` before launching the desktop app.

Example:

```powershell
$env:CHEMVIZ_API_BASE = "http://127.0.0.1:8000/api"
python main.py
```

## Build Windows EXE (Desktop)

The build scripts package the desktop app into a standalone `.exe` and publish it into the web downloads folder.

```powershell
cd desktop-app
./build.ps1
```

Output:

- `desktop-app/dist/ChemVizDesktop.exe`
- `frontend/public/downloads/ChemVizDesktop.exe`

Notes:

- `styles.qss` is bundled into the EXE (required for theme).
- If Windows SmartScreen warns, click “More info” → “Run anyway” (common for unsigned executables).

## Website Download Link

The landing page download button serves the file from:

- `/downloads/ChemVizDesktop.exe` (static file at `frontend/public/downloads/ChemVizDesktop.exe`)

If you use the Vite dev server, the download URL is typically:

- `http://localhost:3000/downloads/ChemVizDesktop.exe`

## CSV Format

Minimal required columns:

```csv
Equipment Name,Type,Flowrate,Pressure,Temperature
Pump-1,Pump,120,5.2,110
Reactor-1,Reactor,200,15.5,250
```

## API Endpoints (Backend)

- `POST /api/login/`
- `POST /api/upload/`
- `GET /api/summary/<id>/`
- `GET /api/history/`
- `GET /api/report/<id>/`
- `GET /api/csv-data/<id>/?limit=<n>`

## Troubleshooting

### Desktop EXE crash: missing `styles.qss`

If you saw an error like:

`FileNotFoundError: ... _MEI...\styles.qss`

That means the EXE was built without bundling `styles.qss`. Rebuild using `desktop-app/build.ps1` (it includes `--add-data "styles.qss;."`).

### “Corrupted/unreadable EXE” after download

This usually happens if the download returned HTML (SPA fallback) or the download was interrupted.

- The EXE should be tens of MB.
- Ensure you’re downloading from a direct static file path like `/downloads/ChemVizDesktop.exe`.

