# ChemViz Desktop App (PyQt5)

Premium desktop client for chemical equipment analytics matching the web UI.

## Features

- **Modern Dark Theme** - Professional UI with #0B0F19 background and glassmorphic cards
- **Top Navigation Bar** - Web-style navbar with Dashboard, Upload, History tabs
- **KPI Cards** - Large, color-coded metric cards with icons (Total Equipment, Avg Flowrate, Pressure, Temperature)
- **Key Insights Section** - Auto-generated insights with status indicators
- **Interactive Charts** - Matplotlib visualizations (bar, donut, multi-metric)
- **Upload History** - Dataset cards with inline metrics badges and action buttons
- **PDF Reports** - Download and auto-open generated reports

## Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  ChemViz Analytics    Dashboard Upload History Logout│  ← Top Nav (56px)
├─────────────────────────────────────────────────────┤
│                                                       │
│  Analytics Dashboard                                  │  ← Page Title (28px)
│  Real-time insights from your chemical equipment data│
│                                                       │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │  ← KPI Grid
│  │ 🏭   │ │ 💧   │ │ ⚙️   │ │ 🌡️   │               │
│  │150.00│ │141.44│ │ 9.80 │ │148.66│               │
│  └──────┘ └──────┘ └──────┘ └──────┘               │
│                                                       │
│  Key Insights                                         │
│  ┌────────────────┐ ┌────────────────┐              │
│  │✅ Temperature  │ │🏭 Equipment    │              │
│  │   Normal       │ │   Fleet Status │              │
│  └────────────────┘ └────────────────┘              │
│                                                       │
│  Visualizations            📄 Download Report        │
│  ┌─────────────┐ ┌─────────────┐                    │
│  │   Chart 1   │ │   Chart 2   │                    │
│  └─────────────┘ └─────────────┘                    │
│  ┌───────────────────────────┐                      │
│  │       Chart 3             │                      │
│  └───────────────────────────┘                      │
└─────────────────────────────────────────────────────┘
```

## Backend

Start the backend (from `backend/`):

```bash
python manage.py runserver
```

The desktop app expects the API at `http://127.0.0.1:8000/api` (override with `CHEMVIZ_API_BASE` env var).

## Install

From `desktop-app/`:

```bash
python -m venv .venv
./.venv/Scripts/activate
pip install -r requirements.txt
```

## Run

From `desktop-app/`:

```bash
python main.py
```

## Build (PyInstaller)

From `desktop-app/`:

```bash
pyinstaller --noconsole --name ChemVizDesktop --onefile main.py
```

Output: `desktop-app/dist/ChemVizDesktop.exe`

## UI Components

- **CardFrame** - Reusable glassmorphic card with hover states
- **KPICardWidget** - Metric card with icon, title, and large value display
- **MetricBadge** - Color-coded inline metric (blue/teal/indigo/emerald)
- **InsightCard** - Status card with icon, title, description
- **ChartCard** - Container for Matplotlib embedded charts
- **TopNavBar** - Fixed top navigation matching web layout

## Styling

All styles defined in `styles.qss`:
- Background: #0B0F19
- Cards: #121826
- Primary: #3B82F6
- Secondary: #22D3EE
- Success: #22C55E
- Danger: #EF4444

Typography uses **Inter** font family with sizes from 11px (base) to 28px (page titles).
