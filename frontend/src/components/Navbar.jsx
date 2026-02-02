import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../services/api';
import AuthModal from './AuthModal';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthenticated = authAPI.isAuthenticated();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        authAPI.logout();
        navigate('/');
    };

    const openAuthModal = (mode) => {
        setAuthMode(mode);
        setAuthModalOpen(true);
    };

    // Hide navbar on old auth pages (backward compatibility)
    if (location.pathname === '/login' || location.pathname === '/signup') {
        return null;
    }

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled
                        ? 'bg-slate-900/80 backdrop-blur-xl shadow-lg border-b border-slate-700/50'
                        : 'bg-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <Link
                            to={isAuthenticated ? '/dashboard' : '/'}
                            className="text-2xl font-bold gradient-text hover:scale-105 transition-transform"
                        >
                            ChemViz Analytics
                        </Link>

                        {/* Navigation Links */}
                        <div className="flex items-center gap-6">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className="text-gray-300 hover:text-cyan-400 transition-colors font-medium"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/upload"
                                        className="text-gray-300 hover:text-cyan-400 transition-colors font-medium"
                                    >
                                        Upload
                                    </Link>
                                    <Link
                                        to="/history"
                                        className="text-gray-300 hover:text-cyan-400 transition-colors font-medium"
                                    >
                                        History
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="glass-button-outline text-sm py-2 px-5"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => openAuthModal('login')}
                                        className="text-gray-300 hover:text-cyan-400 transition-colors font-medium"
                                    >
                                        Login
                                    </button>
                                    <button
                                        onClick={() => openAuthModal('signup')}
                                        className="glass-button text-sm py-2 px-5"
                                    >
                                        Sign Up
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Auth Modal */}
            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                initialMode={authMode}
            />
        </>
    );
};

export default Navbar;
