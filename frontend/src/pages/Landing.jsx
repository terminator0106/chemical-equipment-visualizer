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
        <div className="min-h-screen relative">
            {/* Floating Orbs */}
            <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl float-animation" />
            <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl float-animation" style={{ animationDelay: '2s' }} />

            {/* Hero Section */}
            <div className="relative min-h-screen flex items-center justify-center px-6 pt-20">
                <div className="max-w-6xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
                            <span className="gradient-text">Chemical Equipment</span>
                            <br />
                            <span className="text-gray-100">Analytics Platform</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                            Transform raw equipment data into actionable insights with
                            real-time analytics, intelligent visualizations, and comprehensive reporting.
                        </p>

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
                </div>
            </div>

            {/* Tech Stack Section */}
            <motion.footer
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
            </motion.footer>

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
