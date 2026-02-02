import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import History from './pages/History';

function App() {
    return (
        <Router>
            <div className="min-h-screen">
                <Navbar />

                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Protected Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/upload"
                        element={
                            <ProtectedRoute>
                                <Upload />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/history"
                        element={
                            <ProtectedRoute>
                                <History />
                            </ProtectedRoute>
                        }
                    />

                    {/* Catch all - redirect to landing */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                {/* Toast Notifications */}
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                    toastStyle={{
                        background: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                />
            </div>
        </Router>
    );
}

export default App;
