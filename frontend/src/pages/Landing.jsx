import { useState } from 'react';
import { motion } from 'framer-motion';
import AuthModal from '../components/AuthModal';
import GlassCard from '../components/GlassCard';

const Landing = () => {
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('signup');

    const openAuth = (mode) => {
        setAuthMode(mode);
        setAuthModalOpen(true);
    };

    const features = [
        {
            icon: '🌐',
            title: 'Hybrid Platform',
            description: 'Seamless Web and Desktop interfaces for maximum flexibility'
        },
        {
            icon: '⚡',
            title: 'Real-Time Analytics',
            description: 'Instant processing and visualization of equipment data'
        },
        {
            icon: '📊',
            title: 'Advanced Insights',
            description: 'AI-powered analytics with multiple chart types and trends'
        },
        {
            icon: '📄',
            title: 'PDF Reporting',
            description: 'Generate professional reports with one click'
        }
    ];

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Floating Orbs */}
            <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl float-animation" />
            <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl float-animation" style={{ animationDelay: '2s' }} />

            {/* Rotating Decorative Objects - Zig-Zag Pattern */}
            {/* Top Left - Microscope */}
            <motion.div
                animate={{
                    y: [0, -15, 0],
                    rotate: [0, -8, 8, 0]
                }}
                transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-32 left-10 md:left-20 text-6xl md:text-7xl filter drop-shadow-2xl opacity-70"
            >
                🔬
            </motion.div>

            {/* Middle Right - Test Tube */}
            <motion.div
                animate={{
                    y: [0, -18, 0],
                    rotate: [0, 10, -10, 0]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
                className="absolute top-1/3 right-10 md:right-24 text-6xl md:text-7xl filter drop-shadow-2xl opacity-70"
            >
                🧪
            </motion.div>

            {/* Bottom Left - Atom */}
            <motion.div
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, -12, 12, 0]
                }}
                transition={{
                    duration: 9,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                className="absolute bottom-40 left-16 md:left-32 text-6xl md:text-7xl filter drop-shadow-2xl opacity-70"
            >
                ⚛️
            </motion.div>

            {/* Hero Section */}
            <div className="relative min-h-screen flex items-center justify-center px-6 pt-20">
                <div className="max-w-6xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Premium animated icon */}
                        <motion.div
                            animate={{
                                y: [0, -20, 0],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="text-8xl mb-8 inline-block filter drop-shadow-2xl"
                        >
                            ⚗️
                        </motion.div>

                        <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
                            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Chemical Equipment
                            </span>
                            <br />
                            <span className="text-gray-100">Analytics Platform</span>
                        </h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
                        >
                            Transform raw equipment data into <span className="text-cyan-400 font-semibold">actionable insights</span> with
                            real-time analytics, intelligent visualizations, and comprehensive reporting.
                        </motion.p>

                        <div className="flex gap-6 justify-center mb-20">
                            <button
                                onClick={() => openAuth('login')}
                                className="glass-button text-lg px-10 py-4"
                            >
                                Get Started →
                            </button>
                        </div>
                    </motion.div>

                    {/* Feature Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="grid md:grid-cols-4 gap-6 mt-20"
                    >
                        {features.map((feature, index) => (
                            <GlassCard key={index} hover className="p-6 backdrop-blur-xl">
                                <div className="text-5xl mb-4">{feature.icon}</div>
                                <h3 className="text-lg font-semibold mb-2 text-gray-100">{feature.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </GlassCard>
                        ))}
                    </motion.div>

                    {/* Desktop App Download Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="mt-16"
                    >
                        <GlassCard className="p-8 md:p-10 backdrop-blur-xl border-2 border-cyan-500/20">
                            <div className="grid md:grid-cols-2 gap-8 items-center">
                                <div className="text-left">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-4">
                                        <span className="text-2xl">💻</span>
                                        <span className="text-sm font-bold text-cyan-400">Desktop Application</span>
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-black mb-4 text-gray-100">
                                        Work <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Offline</span>
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed mb-6">
                                        Download our powerful desktop application for Windows. Access all features offline with enhanced performance and native system integration.
                                    </p>
                                    <ul className="space-y-3 mb-6">
                                        <li className="flex items-center gap-3 text-gray-300">
                                            <svg className="w-5 h-5 text-cyan-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm">Offline access to all analytics features</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-gray-300">
                                            <svg className="w-5 h-5 text-cyan-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm">Native Windows performance</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-gray-300">
                                            <svg className="w-5 h-5 text-cyan-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm">Seamless data synchronization</span>
                                        </li>
                                    </ul>
                                    <motion.a
                                        href="/downloads/ChemVizDesktop.exe"
                                        download
                                        whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(34, 211, 238, 0.4)' }}
                                        whileTap={{ scale: 0.95 }}
                                        className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white
                                                 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500
                                                 shadow-2xl shadow-cyan-500/40
                                                 transition-all duration-300 border-2 border-cyan-400/30"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download for Windows
                                    </motion.a>
                                    <p className="text-xs text-gray-500 mt-4">
                                        Version 1.0.0 • Windows 10/11 • ~50MB
                                    </p>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur-3xl"></div>
                                    <motion.div
                                        animate={{
                                            y: [0, -10, 0],
                                        }}
                                        transition={{
                                            duration: 4,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-cyan-500/20"
                                    >
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-3">
                                                <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="h-2 bg-cyan-500/30 rounded w-3/4"></div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="h-20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20"></div>
                                                <div className="h-20 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20"></div>
                                            </div>
                                            <div className="h-24 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20"></div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            </div>

            {/* Tech Stack Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="py-12 px-6"
            >
                <div className="max-w-7xl mx-auto">
                    <GlassCard className="p-8 text-center backdrop-blur-xl">
                        <h3 className="text-lg font-semibold mb-6 text-gray-300">
                            Powered By Modern Technology
                        </h3>
                        <div className="flex justify-center gap-8 text-sm text-gray-400 flex-wrap">
                            <span className="hover:text-cyan-400 transition-colors cursor-default">React.js</span>
                            <span className="hover:text-cyan-400 transition-colors cursor-default">Django REST</span>
                            <span className="hover:text-cyan-400 transition-colors cursor-default">Pandas</span>
                            <span className="hover:text-cyan-400 transition-colors cursor-default">Recharts</span>
                            <span className="hover:text-cyan-400 transition-colors cursor-default">Tailwind CSS</span>
                            <span className="hover:text-cyan-400 transition-colors cursor-default">Framer Motion</span>
                        </div>
                    </GlassCard>
                </div>
            </motion.div>

            {/* Professional Footer */}
            <footer className="relative border-t border-white/10 bg-slate-950/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        {/* Brand Column */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                    ChemViz Analytics
                                </h3>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                                Advanced chemical equipment analytics platform providing real-time insights,
                                intelligent visualizations, and comprehensive reporting for industrial operations.
                            </p>
                            <div className="flex gap-4 mt-6">
                                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                </a>
                            </div>
                        </div>

                        {/* Product Column */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-100 mb-4 uppercase tracking-wider">Product</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Features</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Analytics</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Reporting</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Integration</a></li>
                            </ul>
                        </div>

                        {/* Company Column */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-100 mb-4 uppercase tracking-wider">Company</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">About Us</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Privacy Policy</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Terms of Service</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Contact</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-white/10">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-gray-500 text-sm">
                                © 2026 ChemViz Analytics. All rights reserved.
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>Built with</span>
                                <span className="text-red-400">❤</span>
                                <span>for the chemical industry</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Auth Modal */}
            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                initialMode={authMode}
            />
        </div>
    );
};

export default Landing;
