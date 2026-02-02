import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const Login = () => {
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!emailOrUsername || !password) {
            toast.error('Please enter email (or username) and password');
            return;
        }

        setLoading(true);
        try {
            const data = await authAPI.login(emailOrUsername, password);
            localStorage.setItem('authToken', data.token);
            toast.success('Login successful!');
            navigate('/dashboard');
        } catch (error) {
            const message = error.response?.data?.detail || 'Login failed. Please check your credentials.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="text-4xl font-bold gradient-text inline-block mb-4">
                        ChemViz Pro
                    </Link>
                    <h2 className="text-2xl font-semibold text-white/90">Welcome Back</h2>
                    <p className="text-white/60 mt-2">Sign in to access your dashboard</p>
                </div>

                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">
                                Email
                            </label>
                            <input
                                type="text"
                                value={emailOrUsername}
                                onChange={(e) => setEmailOrUsername(e.target.value)}
                                className="glass-input w-full"
                                placeholder="you@company.com"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="glass-input w-full"
                                placeholder="Enter your password"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full glass-button disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <div className="text-sm text-white/70 mb-3">
                            New here?{' '}
                            <Link to="/signup" className="text-purple-400 hover:text-purple-300 transition-colors">
                                Create an account
                            </Link>
                        </div>
                        <Link to="/" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
