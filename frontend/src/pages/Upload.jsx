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
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2 text-gray-100 font-heading">
                        Upload Dataset
                    </h1>
                    <p className="text-gray-400">
                        Upload your chemical equipment data for instant analytics
                    </p>
                </div>

                <GlassCard className="p-8 backdrop-blur-xl relative overflow-hidden">
                    {/* Decorative gradient */}
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl" />

                    {/* Drag & Drop Area */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
                            transition-all duration-300
                            ${isDragging
                                ? 'border-cyan-500 bg-cyan-500/10 scale-[1.02]'
                                : 'border-slate-600 hover:border-cyan-400 hover:bg-slate-800/50'
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
                            animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                            className="text-6xl mb-4"
                        >
                            📁
                        </motion.div>

                        {file ? (
                            <>
                                <div className="text-2xl font-semibold mb-2 text-emerald-400">
                                    ✓ File Selected
                                </div>
                                <div className="text-gray-200 mb-2 text-lg font-medium">{file.name}</div>
                                <div className="text-sm text-gray-400">
                                    {(file.size / 1024).toFixed(2)} KB
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-semibold mb-2 text-gray-100">
                                    Drag & Drop CSV File
                                </div>
                                <div className="text-gray-400 mb-2">or click to browse</div>
                                <div className="text-sm text-gray-500">
                                    Accepted format: .csv
                                </div>
                            </>
                        )}
                    </div>

                    {/* Inline Format Info */}
                    <div className="mt-6 p-4 rounded-xl bg-slate-800/50 border border-slate-600/50">
                        <div className="flex items-start gap-3">
                            <span className="text-xl">📋</span>
                            <div className="text-sm text-gray-300 flex-1">
                                <p className="font-medium mb-1">Required columns:</p>
                                <p className="text-gray-400">Equipment Name • Type • Flowrate • Pressure • Temperature</p>
                            </div>
                        </div>
                    </div>

                    {/* Upload Button */}
                    {loading ? (
                        <div className="mt-6">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <button
                            onClick={handleUpload}
                            disabled={!file || loading}
                            className="premium-button w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed text-base py-3"
                        >
                            {loading ? 'Uploading...' : 'Upload and Analyze →'}
                        </button>
                    )}
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default Upload;
