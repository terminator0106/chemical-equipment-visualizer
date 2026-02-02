import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedKPICard from '../components/AnimatedKPICard';
import ChartGrid from '../components/ChartGrid';
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
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-5xl font-bold mb-3 text-gray-100 font-heading">Analytics Dashboard</h1>
                <p className="text-gray-400 text-lg">
                    Real-time insights from your chemical equipment data
                </p>
            </motion.div>

            {/* KPI Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
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
                    className="mb-8"
                >
                    <h2 className="text-2xl font-semibold mb-4 text-gray-100">Key Insights</h2>
                    <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-3 gap-4">
                        {insights.map((insight, index) => (
                            <InsightCard key={index} {...insight} />
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Charts */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
            >
                <h2 className="text-2xl font-semibold mb-4 text-gray-100">Visualizations</h2>
                <ChartGrid summary={summary} />
            </motion.div>

            {/* Floating Action Buttons */}
            {datasetId && (
                <FloatingButton onClick={handleDownloadPDF} icon="📄">
                    Download Report
                </FloatingButton>
            )}
        </div>
    );
};

export default Dashboard;
