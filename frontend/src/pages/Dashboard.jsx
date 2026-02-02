import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedKPICard from '../components/AnimatedKPICard';
import ChartPanel from '../components/ChartPanel';
import InsightCard from '../components/InsightCard';
import FloatingButton from '../components/FloatingButton';
import LoadingSpinner from '../components/LoadingSpinner';
import GlassCard from '../components/GlassCard';
import { datasetAPI } from '../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [datasetId, setDatasetId] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.summary) {
            setSummary(location.state.summary);
            setDatasetId(location.state.dataset_id);
        } else {
            loadLatestDataset();
        }
    }, [location.state]);

    const loadLatestDataset = async () => {
        setLoading(true);
        try {
            const history = await datasetAPI.getHistory();
            if (history && history.length > 0) {
                const latest = history[0];
                setSummary(latest.summary);
                setDatasetId(latest.id);
            }
        } catch (error) {
            console.error('Failed to load latest dataset:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!datasetId) return;
        try {
            await datasetAPI.downloadReport(datasetId);
            toast.success('Report downloaded successfully!');
        } catch (error) {
            toast.error('Failed to download report');
        }
    };

    const getInsights = () => {
        if (!summary) return [];

        const insights = [];
        const avgPressure = summary.average_pressure || 0;
        const avgTemp = summary.average_temperature || 0;
        const totalEquipment = summary.total_equipment || 0;

        if (avgPressure > 10) {
            insights.push({
                title: 'High Pressure Detected',
                description: `Average pressure of ${avgPressure.toFixed(2)} PSI exceeds normal operating range. Consider inspection.`,
                status: 'warning',
                icon: '⚠️',
            });
        }

        if (avgTemp > 200) {
            insights.push({
                title: 'Elevated Temperature',
                description: `System running at ${avgTemp.toFixed(2)}°F. Monitor for thermal stress.`,
                status: 'critical',
                icon: '🔥',
            });
        } else {
            insights.push({
                title: 'Temperature Normal',
                description: 'All equipment operating within safe temperature ranges.',
                status: 'normal',
                icon: '✅',
            });
        }

        insights.push({
            title: 'Equipment Fleet Status',
            description: `${totalEquipment} pieces of equipment actively monitored. All systems operational.`,
            status: 'normal',
            icon: '🏭',
        });

        return insights;
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
                <LoadingSpinner />
            </div>
        );
    }

    if (!summary) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto px-6 py-8 pt-24"
            >
                <GlassCard className="p-16 text-center backdrop-blur-xl">
                    <div className="text-8xl mb-6">📊</div>
                    <h2 className="text-3xl font-bold mb-4 text-gray-100">No Data Available</h2>
                    <p className="text-gray-400 mb-8 text-lg">
                        Upload a CSV file to unlock powerful analytics and insights
                    </p>
                    <button onClick={() => navigate('/upload')} className="premium-button text-lg px-8 py-4">
                        Upload CSV File
                    </button>
                </GlassCard>
            </motion.div>
        );
    }

    const insights = getInsights();

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 pt-24 pb-24">
            {/* Premium Header with gradient */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-6xl font-black mb-3 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 
                                     bg-clip-text text-transparent">
                            Analytics Dashboard
                        </h1>
                        <p className="text-gray-400 text-lg font-light">
                            Real-time insights from your chemical equipment data • {summary.total_equipment} devices monitored
                        </p>
                    </div>
                    <div className="text-7xl filter drop-shadow-2xl">
                        📊
                    </div>
                </div>
                {/* Accent line */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.3, duration: 1 }}
                    className="h-1 mt-4 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
                />
            </motion.div>

            {/* KPI Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
            >
                <AnimatedKPICard
                    title="Total Equipment"
                    value={summary.total_equipment || 0}
                    icon="🏭"
                    color="cyan"
                />
                <AnimatedKPICard
                    title="Avg Flowrate"
                    value={summary.average_flowrate || 0}
                    unit="units"
                    icon="💧"
                    color="teal"
                />
                <AnimatedKPICard
                    title="Avg Pressure"
                    value={summary.average_pressure || 0}
                    unit="psi"
                    icon="⚙️"
                    color="blue"
                />
                <AnimatedKPICard
                    title="Avg Temperature"
                    value={summary.average_temperature || 0}
                    unit="°F"
                    icon="🌡️"
                    color="emerald"
                />
            </motion.div>

            {/* Insights Section */}
            {insights.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-10"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-3xl font-black text-gray-100">AI Insights</h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {insights.map((insight, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 + idx * 0.1 }}
                            >
                                <InsightCard {...insight} />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Charts */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-10"
            >
                <ChartPanel summary={summary} />
            </motion.div>

            {/* Floating Action Button */}
            {datasetId && (
                <FloatingButton onClick={handleDownloadPDF} icon="📥">
                    Download Report
                </FloatingButton>
            )}
        </div>
    );
};

export default Dashboard;
