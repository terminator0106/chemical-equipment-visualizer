import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !email || !password || !confirmPassword) {
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
                email,
                password,
                confirm_password: confirmPassword,
            });

            localStorage.setItem('authToken', data.token);
            toast.success('Account created!');
            navigate('/dashboard');
        } catch (error) {
            const resp = error.response?.data;
            const message =
                resp?.detail ||
                resp?.email?.[0] ||
                resp?.password?.[0] ||
                resp?.confirm_password?.[0] ||
                'Signup failed. Please try again.';
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
                    <h2 className="text-2xl font-semibold text-white/90">Create Account</h2>
                    <p className="text-white/60 mt-2">Sign up to start analyzing your data</p>
                </div>

                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="glass-input w-full"
                                placeholder="Your name"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="glass-input w-full"
                                placeholder="you@company.com"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="glass-input w-full"
                                placeholder="Minimum 8 characters"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="glass-input w-full"
                                placeholder="Re-enter password"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full glass-button disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-white/70">
                        Already have an account?{' '}
                        <Link to="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
