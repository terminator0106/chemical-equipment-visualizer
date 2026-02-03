import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedKPICard from '../components/AnimatedKPICard';
import ChartPanel from '../components/ChartPanel';
import FloatingButton from '../components/FloatingButton';
import LoadingSpinner from '../components/LoadingSpinner';
import GlassCard from '../components/GlassCard';
import { datasetAPI } from '../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [csvData, setCsvData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [datasetId, setDatasetId] = useState(null);
    const [rowLimit, setRowLimit] = useState(null); // null = all rows
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.summary) {
            setSummary(location.state.summary);
            setDatasetId(location.state.dataset_id);
            loadCSVData(location.state.dataset_id, rowLimit);
        } else {
            loadLatestDataset();
        }
    }, [location.state]);

    useEffect(() => {
        if (datasetId) {
            loadDataWithLimit(datasetId, rowLimit);
        }
    }, [rowLimit]);

    const loadDataWithLimit = async (id, limit) => {
        setLoading(true);
        try {
            const [summaryResponse, csvResponse] = await Promise.all([
                datasetAPI.getSummary(id, limit),
                datasetAPI.getCSVData(id, limit)
            ]);
            setSummary(summaryResponse.summary);
            setCsvData(csvResponse.data || []);
        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const loadCSVData = async (id, limit) => {
        try {
            const response = await datasetAPI.getCSVData(id, limit);
            setCsvData(response.data || []);
        } catch (error) {
            console.error('Failed to load CSV data:', error);
        }
    };

    const loadLatestDataset = async () => {
        setLoading(true);
        try {
            const history = await datasetAPI.getHistory();
            if (history && history.length > 0) {
                const latest = history[0];
                setDatasetId(latest.id);
                await loadDataWithLimit(latest.id, rowLimit);
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

    const totalRows = summary?.total_equipment || 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pt-20 sm:pt-24 pb-16 sm:pb-24">
            {/* Premium Header with gradient */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 sm:mb-10"
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-2 sm:mb-3 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 
                                     bg-clip-text text-transparent">
                            Analytics Dashboard
                        </h1>
                        <p className="text-gray-400 text-base sm:text-lg font-light">
                            Real-time insights from your chemical equipment data • {summary.total_equipment} devices monitored
                        </p>
                    </div>
                    <div className="text-5xl sm:text-7xl filter drop-shadow-2xl">
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

            {/* Charts */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-10"
            >
                <ChartPanel summary={summary} />
            </motion.div>

            {/* CSV Data Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-10"
            >
                <GlassCard className="p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-100">Dataset Preview</h2>
                            <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-gray-400 text-sm font-medium">Show rows:</label>
                            <select
                                value={rowLimit || 'all'}
                                onChange={(e) => setRowLimit(e.target.value === 'all' ? null : parseInt(e.target.value))}
                                className="bg-gray-800/50 text-gray-200 border border-gray-700 rounded-lg px-4 py-2 
                                         focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                                         cursor-pointer hover:bg-gray-800 transition-colors"
                            >
                                <option value="all">All ({totalRows})</option>
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="px-4 py-3 text-left text-sm font-bold text-cyan-400">Equipment Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-bold text-cyan-400">Type</th>
                                    <th className="px-4 py-3 text-left text-sm font-bold text-cyan-400">Flowrate</th>
                                    <th className="px-4 py-3 text-left text-sm font-bold text-cyan-400">Pressure</th>
                                    <th className="px-4 py-3 text-left text-sm font-bold text-cyan-400">Temperature</th>
                                </tr>
                            </thead>
                            <tbody>
                                {csvData.length > 0 ? (
                                    csvData.map((row, idx) => (
                                        <motion.tr
                                            key={idx}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.01 }}
                                            className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                                        >
                                            <td className="px-4 py-3 text-sm text-gray-300">{row.equipment_name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-300">
                                                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs font-medium">
                                                    {row.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-300">{row.flowrate.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-300">{row.pressure.toFixed(2)} PSI</td>
                                            <td className="px-4 py-3 text-sm text-gray-300">{row.temperature.toFixed(2)} °F</td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                                            No data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {csvData.length > 0 && (
                        <div className="mt-4 text-sm text-gray-400 text-center">
                            Showing {csvData.length} of {totalRows} rows
                        </div>
                    )}
                </GlassCard>
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
