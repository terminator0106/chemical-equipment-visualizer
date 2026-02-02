# Chemical Equipment Parameter Visualizer

A modern hybrid web application for analyzing and visualizing chemical equipment performance data.

## 🚀 Quick Start

### Backend Setup (Django REST API)

```bash
cd backend

# Install dependencies (already done if you ran the setup)
pip install djangorestframework django-cors-headers pandas reportlab

# Create a superuser for testing
python manage.py createsuperuser

# Run the backend server
python manage.py runserver
```

The backend will be available at: `http://127.0.0.1:8000`

### Frontend Setup (React)

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will be available at: `http://localhost:3000`

## 📝 Testing the Application

### 1. Create a Test User

```bash
cd backend
python manage.py createsuperuser
# Follow prompts to create username/password
```

### 2. Login

- Navigate to `http://localhost:3000`
- Click "Login" or "Get Started"
- Enter your credentials

### 3. Upload Sample Data

- Use the included `sample_data.csv` file in the root directory
- Go to Upload page
- Drag & drop or click to browse
- View instant analytics on Dashboard

### 4. Test All Features

✅ View KPIs (Total Equipment, Averages)
✅ Interactive Bar Chart
✅ Download PDF Report
✅ Upload History (max 5 datasets)
✅ Navigate between pages

## 🎨 Features

- **Scientific Glassmorphism Theme** - Modern gradient background with glass-like cards
- **Real-Time Analytics** - Instant CSV processing with Pandas
- **Interactive Charts** - Equipment type distribution with Chart.js
- **PDF Reports** - Downloadable professional reports
- **Token Authentication** - Secure API access
- **Responsive Design** - Works on all screen sizes
- **CORS Enabled** - Ready for desktop (PyQt5) integration

## 📁 Project Structure

```
chemical-equipment-visualizer/
├── backend/                 # Django REST API
│   ├── api/
│   │   ├── models.py       # Dataset model
│   │   ├── views.py        # API endpoints
│   │   ├── serializers.py  # DRF serializers
│   │   ├── urls.py         # API routes
│   │   └── utils.py        # Analytics & PDF utilities
│   └── backend/
│       ├── settings.py     # Django settings
│       └── urls.py         # Main URL config
│
├── frontend/               # React Web App
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API integration
│   │   └── App.jsx        # Main app component
│   └── package.json
│
└── sample_data.csv        # Test data
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login/` | User authentication |
| POST | `/api/upload/` | Upload CSV file |
| GET | `/api/summary/<id>/` | Get dataset summary |
| GET | `/api/history/` | Get last 5 uploads |
| GET | `/api/report/<id>/` | Download PDF report |

## 🧪 Sample CSV Format

```csv
Equipment Name,Type,Flowrate,Pressure,Temperature
Pump-1,Pump,120,5.2,110
Reactor-1,Reactor,200,15.5,250
```

Required columns:
- Equipment Name
- Type
- Flowrate (numeric)
- Pressure (numeric)
- Temperature (numeric)

## 🛠️ Tech Stack

**Backend:**
- Django 5.2
- Django REST Framework
- Pandas (data analytics)
- ReportLab (PDF generation)
- SQLite database

**Frontend:**
- React 18
- Vite (build tool)
- Tailwind CSS (styling)
- Chart.js (visualization)
- Axios (API calls)
- React Router (navigation)

## 🔒 Authentication

The app uses token-based authentication. After login, the token is stored in `localStorage` and automatically included in all API requests.

## 📊 Analytics Computed

For each uploaded CSV:
- Total equipment count
- Average flowrate
- Average pressure
- Average temperature
- Equipment type distribution (count per type)

## 🎯 Hackathon Ready

This project is designed to be:
- ✅ Simple to set up and run
- ✅ Clean, readable code
- ✅ Professional UI/UX
- ✅ Fully functional backend and frontend
- ✅ Ready for demo and presentation

## 📄 License

MIT
