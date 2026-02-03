import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { datasetAPI } from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const History = () => {
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const data = await datasetAPI.getHistory();
            setDatasets(data);
        } catch (error) {
            toast.error('Failed to load history');
        } finally {
            setLoading(false);
        }
    };

    const handleViewSummary = (dataset) => {
        navigate('/dashboard', {
            state: {
                summary: dataset.summary,
                dataset_id: dataset.id,
            },
        });
    };

    const handleDownloadReport = async (datasetId) => {
        try {
            await datasetAPI.downloadReport(datasetId);
            toast.success('Report downloaded successfully!');
        } catch (error) {
            toast.error('Failed to download report');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pt-20 sm:pt-24 pb-16 sm:pb-24">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 sm:mb-10"
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-2 sm:mb-3 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 
                                     bg-clip-text text-transparent">
                            Upload History
                        </h1>
                        <p className="text-gray-400 text-base sm:text-lg font-light">
                            View and manage your uploaded datasets • Last {datasets.length} uploads
                        </p>
                    </div>
                    <div className="text-5xl sm:text-7xl filter drop-shadow-2xl">
                        📚
                    </div>
                </div>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.3, duration: 1 }}
                    className="h-1 mt-4 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
                />
            </motion.div>

            {datasets.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <GlassCard className="p-20 text-center backdrop-blur-xl">
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="text-9xl mb-8 inline-block filter drop-shadow-2xl"
                        >
                            📂
                        </motion.div>
                        <h2 className="text-4xl font-black mb-4 text-gray-100">No Upload History</h2>
                        <p className="text-gray-400 mb-10 text-xl font-light">
                            You haven't uploaded any datasets yet
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(34, 211, 238, 0.4)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/upload')}
                            className="px-10 py-5 rounded-2xl font-black text-white text-lg
                                     bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500
                                     shadow-2xl shadow-cyan-500/40
                                     transition-all duration-300 border-2 border-cyan-400/30"
                        >
                            Upload Your First File
                        </motion.button>
                    </GlassCard>
                </motion.div>
            ) : (
                <div className="space-y-6">
                    {datasets.map((dataset, index) => (
                        <motion.div
                            key={dataset.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <GlassCard hover className="p-4 sm:p-8 backdrop-blur-xl relative overflow-hidden">
                                {/* Decorative gradient */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 
                                              rounded-full blur-3xl pointer-events-none"></div>

                                <div className="flex flex-col gap-4 sm:gap-6 relative z-10">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                                            <motion.span
                                                whileHover={{ rotate: [0, -10, 10, 0] }}
                                                transition={{ duration: 0.5 }}
                                                className="text-3xl sm:text-4xl filter drop-shadow-lg flex-shrink-0"
                                            >
                                                📊
                                            </motion.span>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xl sm:text-2xl font-black text-gray-100 mb-1 break-words">
                                                    {dataset.file_name.split('/').pop()}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-xs sm:text-sm text-gray-400">📅 {formatDate(dataset.uploaded_at)}</span>
                                                    <span className="px-2 sm:px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 
                                                                   border border-emerald-500/40 text-xs font-bold uppercase">
                                                        Active
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Premium Quick Stats */}
                                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                className="px-5 py-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 
                                                          border-2 border-blue-500/30 backdrop-blur-sm"
                                            >
                                                <div className="text-2xl font-black text-blue-400 mb-1">
                                                    {dataset.summary?.total_equipment || 0}
                                                </div>
                                                <div className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Equipment</div>
                                            </motion.div>
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                className="px-5 py-3 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-600/10 
                                                          border-2 border-teal-500/30 backdrop-blur-sm"
                                            >
                                                <div className="text-2xl font-black text-teal-400 mb-1">
                                                    {dataset.summary?.average_flowrate?.toFixed(1) || 0}
                                                </div>
                                                <div className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Avg Flow</div>
                                            </motion.div>
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                className="px-5 py-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 
                                                          border-2 border-indigo-500/30 backdrop-blur-sm"
                                            >
                                                <div className="text-2xl font-black text-indigo-400 mb-1">
                                                    {dataset.summary?.average_pressure?.toFixed(1) || 0}
                                                </div>
                                                <div className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Avg PSI</div>
                                            </motion.div>
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                className="px-5 py-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 
                                                          border-2 border-emerald-500/30 backdrop-blur-sm"
                                            >
                                                <div className="text-2xl font-black text-emerald-400 mb-1">
                                                    {dataset.summary?.average_temperature?.toFixed(1) || 0}°F
                                                </div>
                                                <div className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Avg Temp</div>
                                            </motion.div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 lg:min-w-[220px]">
                                        <motion.button
                                            whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(34, 211, 238, 0.4)' }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleViewSummary(dataset)}
                                            className="px-6 py-3 rounded-xl font-bold text-white text-sm w-full
                                                     bg-gradient-to-r from-cyan-500 to-blue-500
                                                     shadow-lg shadow-cyan-500/30
                                                     transition-all duration-300 border border-cyan-400/30"
                                        >
                                            View Analytics
                                        </motion.button>
                                        <button
                                            onClick={() => handleDownloadReport(dataset.id)}
                                            className="glass-button-outline text-sm py-3 w-full"
                                        >
                                            📄 Download PDF
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;
