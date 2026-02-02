import { motion } from 'framer-motion';

const GlassCard = ({ children, hover = false, className = '', variant = 'default', ...props }) => {
    const baseClass = hover ? 'glass-card-hover' : 'glass-card';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={hover ? { y: -4, scale: 1.02 } : { y: -2 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
            className={`${baseClass} backdrop-blur-2xl bg-white/5 rounded-2xl border-2 border-white/10 
                       shadow-2xl hover:shadow-cyan-500/20 hover:border-cyan-500/30 
                       transition-all duration-500 relative overflow-hidden ${className}`}
            {...props}
        >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent 
                          pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-500"></div>

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};

export default GlassCard;
