# Quick Start Guide

## 🚀 Run the Full Application

### Step 1: Start Backend

```powershell
# Navigate to backend
cd "d:\Fosse Project\chemical-equipment-visualizer\backend"

# Run Django server
& "D:\Fosse Project\.venv\Scripts\python.exe" manage.py runserver
```

Backend will run at: **http://127.0.0.1:8000**

### Step 2: Start Frontend (New Terminal)

```powershell
# Navigate to frontend
cd "d:\Fosse Project\chemical-equipment-visualizer\frontend"

# Start React dev server (use cmd to avoid PowerShell execution policy issues)
cmd /c "npm start"
```

Frontend will run at: **http://localhost:3000**

### Step 3: Create Test User (First Time Only)

```powershell
cd "d:\Fosse Project\chemical-equipment-visualizer\backend"
& "D:\Fosse Project\.venv\Scripts\python.exe" manage.py createsuperuser
```

## 🧪 Testing Workflow

1. **Open Browser**: Navigate to `http://localhost:3000`
2. **Login**: Use credentials created above
3. **Upload CSV**: 
   - Go to Upload page
   - Use `sample_data.csv` from project root
   - Drag & drop or browse
4. **View Dashboard**: See KPIs and charts
5. **Download PDF**: Click "Download PDF Report" button
6. **Check History**: Navigate to History page (shows last 5 uploads)

## 📝 Sample Data Location

```
d:\Fosse Project\chemical-equipment-visualizer\sample_data.csv
```

## ⚡ Quick Commands

### Backend
```powershell
# Check Django
& "D:\Fosse Project\.venv\Scripts\python.exe" manage.py check

# Run migrations
& "D:\Fosse Project\.venv\Scripts\python.exe" manage.py migrate

# Create superuser
& "D:\Fosse Project\.venv\Scripts\python.exe" manage.py createsuperuser
```

### Frontend
```powershell
# Install dependencies
cmd /c "npm install"

# Start dev server
cmd /c "npm start"

# Build for production
cmd /c "npm run build"
```

## 🎯 What's Implemented

✅ **Backend (Django REST)**
- Dataset model with auto-pruning (last 5 per user)
- CSV parsing & analytics with Pandas
- PDF report generation with ReportLab
- Token authentication
- CORS enabled for frontend
- All API endpoints working

✅ **Frontend (React)**
- Scientific glassmorphism theme
- Landing page with features
- Login with error handling
- Dashboard with KPIs + Bar chart
- Drag & drop CSV upload
- Upload history (last 5)
- PDF download
- Protected routes
- Toast notifications
- Fully responsive

## 🔧 Troubleshooting

**PowerShell Script Execution Error:**
- Use `cmd /c "npm ..."` instead of direct `npm` commands

**Backend Port Already in Use:**
- Kill process on port 8000 or use: `python manage.py runserver 8001`

**Frontend Port Already in Use:**
- Vite will auto-suggest alternative port (e.g., 3001)

**CORS Errors:**
- Ensure backend is running on port 8000
- Check Vite proxy config in `vite.config.js`

## 📊 Expected Analytics Output

For `sample_data.csv`:
- Total Equipment: 10
- Avg Flowrate: ~188.3
- Avg Pressure: ~8.9
- Avg Temperature: ~154.7
- Equipment Types: Pump (2), Reactor (2), Heat Exchanger (2), Compressor (1), Valve (2), Tank (1)

## 🎨 Theme Colors

- Background: Deep violet/slate gradient
- Cards: Semi-transparent glass (white/10)
- Accent: Purple-400 to Pink-400 gradient
- Text: White with varying opacity
