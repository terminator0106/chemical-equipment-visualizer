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
        <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-5xl font-bold mb-3 text-gray-100 font-heading">Upload History</h1>
                <p className="text-gray-400 text-lg">
                    View and manage your last 5 uploaded datasets
                </p>
            </motion.div>

            {datasets.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <GlassCard className="p-16 text-center backdrop-blur-xl">
                        <div className="text-8xl mb-6">📂</div>
                        <h2 className="text-3xl font-bold mb-4 text-gray-100">No Upload History</h2>
                        <p className="text-gray-400 mb-8 text-lg">
                            You haven't uploaded any datasets yet
                        </p>
                        <button
                            onClick={() => navigate('/upload')}
                            className="premium-button text-lg px-8 py-4"
                        >
                            Upload Your First File
                        </button>
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
                            <GlassCard hover className="p-6 backdrop-blur-xl">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-3xl">📊</span>
                                            <h3 className="text-xl font-semibold text-gray-100">
                                                {dataset.file_name.split('/').pop()}
                                            </h3>
                                            <span className="status-normal text-xs">
                                                Active
                                            </span>
                                        </div>

                                        <div className="text-sm text-gray-400 mb-4">
                                            📅 {formatDate(dataset.uploaded_at)}
                                        </div>

                                        {/* Quick Stats */}
                                        <div className="flex flex-wrap gap-3">
                                            <div className="px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
                                                <span className="text-blue-400 font-semibold">
                                                    {dataset.summary?.total_equipment || 0}
                                                </span>
                                                <span className="text-gray-400 ml-1 text-sm">Equipment</span>
                                            </div>
                                            <div className="px-4 py-2 rounded-lg bg-teal-500/10 border border-teal-500/30">
                                                <span className="text-teal-400 font-semibold">
                                                    {dataset.summary?.average_flowrate?.toFixed(1) || 0}
                                                </span>
                                                <span className="text-gray-400 ml-1 text-sm">Avg Flow</span>
                                            </div>
                                            <div className="px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                                                <span className="text-indigo-400 font-semibold">
                                                    {dataset.summary?.average_pressure?.toFixed(1) || 0}
                                                </span>
                                                <span className="text-gray-400 ml-1 text-sm">Avg Pressure</span>
                                            </div>
                                            <div className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                                                <span className="text-emerald-400 font-semibold">
                                                    {dataset.summary?.average_temperature?.toFixed(1) || 0}°F
                                                </span>
                                                <span className="text-gray-400 ml-1 text-sm">Avg Temp</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 lg:min-w-[200px]">
                                        <button
                                            onClick={() => handleViewSummary(dataset)}
                                            className="premium-button text-sm py-3 w-full"
                                        >
                                            View Analytics
                                        </button>
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
