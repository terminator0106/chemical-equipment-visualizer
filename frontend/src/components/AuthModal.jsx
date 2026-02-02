import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Update mode when initialMode changes
    useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);

    // Form states
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const resetForm = () => {
        setEmailOrUsername('');
        setPassword('');
        setName('');
        setConfirmPassword('');
        setLoading(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!emailOrUsername || !password) {
            toast.error('Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            const data = await authAPI.login(emailOrUsername, password);
            localStorage.setItem('authToken', data.token);
            toast.success('Welcome back!');
            handleClose();
            navigate('/dashboard');
        } catch (error) {
            const message = error.response?.data?.detail || 'Login failed';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!name || !emailOrUsername || !password || !confirmPassword) {
            toast.error('Please fill all fields');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const data = await authAPI.signup({
                name,
                email: emailOrUsername,
                password,
                confirm_password: confirmPassword,
            });
            localStorage.setItem('authToken', data.token);
            toast.success('Account created!');
            handleClose();
            navigate('/dashboard');
        } catch (error) {
            const resp = error.response?.data;
            const message =
                resp?.detail || resp?.email?.[0] || resp?.password?.[0] || 'Signup failed';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="modal-overlay"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md"
                    >
                        <div className="glass-card p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl -z-10" />

                            {/* Header */}
                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-bold mb-2 text-gray-100">
                                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                                </h2>
                                <p className="text-gray-400">
                                    {mode === 'login'
                                        ? 'Sign in to access your dashboard'
                                        : 'Join us to start analyzing equipment data'}
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
                                {mode === 'signup' && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-300">Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="glass-input w-full"
                                            placeholder="Your full name"
                                            disabled={loading}
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-300">
                                        {mode === 'signup' ? 'Email' : 'Email or Username'}
                                    </label>
                                    <input
                                        type="text"
                                        value={emailOrUsername}
                                        onChange={(e) => setEmailOrUsername(e.target.value)}
                                        className="glass-input w-full"
                                        placeholder={mode === 'signup' ? 'you@company.com' : 'Enter email or username'}
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="glass-input w-full"
                                        placeholder="••••••••"
                                        disabled={loading}
                                    />
                                </div>

                                {mode === 'signup' && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-300">
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="glass-input w-full"
                                            placeholder="••••••••"
                                            disabled={loading}
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full glass-button disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                                >
                                    {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                                </button>
                            </form>

                            {/* Toggle Mode */}
                            <div className="mt-6 text-center text-sm text-gray-400">
                                {mode === 'login' ? (
                                    <>
                                        Don't have an account?{' '}
                                        <button
                                            onClick={() => setMode('signup')}
                                            className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                                        >
                                            Sign up
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        Already have an account?{' '}
                                        <button
                                            onClick={() => setMode('login')}
                                            className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                                        >
                                            Login
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;
