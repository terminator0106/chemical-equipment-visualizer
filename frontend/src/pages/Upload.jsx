import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { datasetAPI } from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const Upload = () => {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.name.endsWith('.csv')) {
            setFile(droppedFile);
            toast.success('File selected successfully!');
        } else {
            toast.error('Please upload a CSV file');
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.name.endsWith('.csv')) {
            setFile(selectedFile);
        } else {
            toast.error('Please select a CSV file');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a file first');
            return;
        }

        setLoading(true);
        try {
            const result = await datasetAPI.upload(file);
            toast.success('File uploaded successfully!');

            navigate('/dashboard', {
                state: {
                    summary: result.summary,
                    dataset_id: result.dataset_id,
                },
            });
        } catch (error) {
            const message = error.response?.data?.detail || 'Upload failed. Please check your file format.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-24">
            {/* Decorative background orbs */}
            <div className="fixed top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-float" />
            <div className="fixed bottom-20 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-float" style={{ animationDelay: '2s' }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-3xl"
            >
                <div className="text-center mb-10">
                    <div className="text-7xl mb-6 inline-block filter drop-shadow-2xl">
                        📤
                    </div>
                    <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        Upload Dataset
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Upload your chemical equipment data for <span className="text-cyan-400 font-semibold">instant analytics</span>
                    </p>
                </div>

                <GlassCard className="p-10 backdrop-blur-xl relative overflow-hidden">
                    {/* Decorative gradients */}
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none" />

                    {/* Drag & Drop Area */}
                    <motion.div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`
                            relative border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer
                            transition-all duration-300 backdrop-blur-sm
                            ${isDragging
                                ? 'border-cyan-400 bg-cyan-500/20 scale-[1.02] shadow-2xl shadow-cyan-500/50'
                                : 'border-slate-600 hover:border-cyan-400 hover:bg-white/5'
                            }
                        `}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        <motion.div
                            animate={isDragging ? { scale: 1.2, rotate: 5 } : { scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className="text-7xl mb-6"
                        >
                            📁
                        </motion.div>

                        {file ? (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                            >
                                <div className="text-3xl font-black mb-3 text-emerald-400 flex items-center justify-center gap-3">
                                    <span className="text-4xl">✓</span>
                                    File Selected
                                </div>
                                <div className="text-gray-200 mb-2 text-xl font-semibold">{file.name}</div>
                                <div className="text-base text-gray-400 font-medium">
                                    {(file.size / 1024).toFixed(2)} KB
                                </div>
                            </motion.div>
                        ) : (
                            <>
                                <div className="text-3xl font-black mb-3 text-gray-100">
                                    Drag & Drop CSV File
                                </div>
                                <div className="text-gray-400 mb-2 text-lg">or click to browse</div>
                                <div className="text-sm text-gray-500 font-medium">
                                    Accepted format: <span className="text-cyan-400">.csv</span>
                                </div>
                            </>
                        )}
                    </motion.div>

                    {/* Premium Format Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 
                                 border-2 border-slate-600/30 backdrop-blur-xl"
                    >
                        <div className="flex items-start gap-4">
                            <span className="text-3xl">📋</span>
                            <div className="text-sm text-gray-300 flex-1">
                                <p className="font-bold mb-2 text-lg text-gray-100">Required Columns:</p>
                                <div className="flex flex-wrap gap-2">
                                    {['Equipment Name', 'Type', 'Flowrate', 'Pressure', 'Temperature'].map((col) => (
                                        <span key={col} className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 
                                                                   border border-cyan-500/30 text-xs font-semibold">
                                            {col}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Upload Button */}
                    {loading ? (
                        <div className="mt-8">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: '0 20px 60px rgba(34, 211, 238, 0.4)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleUpload}
                            disabled={!file || loading}
                            className="w-full mt-8 px-10 py-5 rounded-2xl font-black text-white text-lg
                                     bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500
                                     shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/60
                                     transition-all duration-300 border-2 border-cyan-400/30
                                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                                     flex items-center justify-center gap-3"
                        >
                            <span>{loading ? 'Uploading...' : 'Upload and Analyze'}</span>
                            <span className="text-2xl">→</span>
                        </motion.button>
                    )}
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default Upload;
