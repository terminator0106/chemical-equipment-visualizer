import { motion } from 'framer-motion';

const FloatingButton = ({ onClick, children, icon, className = '' }) => {
    return (
        <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{
                scale: 1.1,
                boxShadow: '0 20px 60px rgba(34, 211, 238, 0.6)'
            }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`fixed bottom-8 right-8 z-40 px-8 py-4 rounded-2xl font-bold text-white
                       bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 
                       shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/60
                       border-2 border-cyan-400/30 flex items-center gap-3
                       transition-all duration-300 ${className}`}
        >
            {icon && (
                <span className="text-2xl">
                    {icon}
                </span>
            )}
            <span className="text-lg">{children || 'Download Report'}</span>
        </motion.button>
    );
};

export default FloatingButton;
