import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../services/api';
import AuthModal from './AuthModal';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
                transition={{ type: 'spring', stiffness: 100 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                    ? 'bg-slate-900/80 backdrop-blur-2xl shadow-2xl shadow-cyan-500/10 border-b border-cyan-500/20'
                    : 'bg-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* Logo with animation */}
                        <Link to={isAuthenticated ? '/dashboard' : '/'}>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 sm:gap-3 group"
                            >
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 
                                                 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:via-blue-300 
                                                 group-hover:to-purple-300 transition-all duration-300">
                                        ChemViz Analytics
                                    </h1>
                                    <p className="text-xs text-gray-500 font-medium tracking-wide">Advanced Data Insights</p>
                                </div>
                            </motion.div>
                        </Link>

                        {/* Navigation */}
                        <div className="flex items-center gap-2 sm:gap-6">
                            {isAuthenticated ? (
                                <>
                                    {/* Desktop Navigation Links */}
                                    <div className="hidden lg:flex items-center gap-2 bg-white/5 backdrop-blur-xl rounded-2xl p-1.5 
                                                  border border-white/10 shadow-xl">
                                        {[
                                            { to: '/dashboard', label: 'Dashboard', icon: '📊' },
                                            { to: '/upload', label: 'Upload', icon: '📤' },
                                            { to: '/history', label: 'History', icon: '📚' }
                                        ].map((link) => (
                                            <Link key={link.to} to={link.to}>
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className={`px-4 sm:px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 
                                                              flex items-center gap-2 ${location.pathname === link.to
                                                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50'
                                                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                                                        }`}
                                                >
                                                    <span className="text-lg">{link.icon}</span>
                                                    <span className="hidden sm:inline">{link.label}</span>
                                                </motion.div>
                                            </Link>
                                        ))}
                                    </div>

                                    {/* Mobile Menu Button */}
                                    <button
                                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                        className="lg:hidden p-2 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10"
                                    >
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    </button>

                                    {/* Logout Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)' }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleLogout}
                                        className="hidden sm:block px-4 sm:px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-red-500 to-pink-500 
                                                 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 
                                                 transition-all duration-300 border border-red-400/30 text-sm sm:text-base"
                                    >
                                        Logout
                                    </motion.button>
                                </>
                            ) : (
                                <>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => openAuthModal('login')}
                                        className="hidden sm:block text-gray-300 hover:text-white font-semibold transition-colors px-3 sm:px-4 py-2"
                                    >
                                        Login
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(34, 211, 238, 0.4)' }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => openAuthModal('signup')}
                                        className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 
                                                 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 
                                                 transition-all duration-300 border border-cyan-400/30 text-sm sm:text-base"
                                    >
                                        Sign Up
                                    </motion.button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isAuthenticated && mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="lg:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-xl"
                    >
                        <div className="px-4 py-4 space-y-2">
                            {[
                                { to: '/dashboard', label: 'Dashboard', icon: '📊' },
                                { to: '/upload', label: 'Upload', icon: '📤' },
                                { to: '/history', label: 'History', icon: '📚' }
                            ].map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <div className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 
                                                  flex items-center gap-3 ${location.pathname === link.to
                                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        <span className="text-xl">{link.icon}</span>
                                        <span>{link.label}</span>
                                    </div>
                                </Link>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-3 rounded-xl font-bold bg-gradient-to-r from-red-500 to-pink-500 
                                         text-white transition-all duration-300 text-center"
                            >
                                Logout
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Bottom glow effect */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
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
