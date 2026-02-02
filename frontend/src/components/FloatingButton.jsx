import { motion } from 'framer-motion';

const FloatingButton = ({ onClick, children, icon, className = '' }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`floating-button flex items-center gap-2 shadow-xl shadow-cyan-500/20 hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 ${className}`}
        >
            {icon && <span className="text-xl">{icon}</span>}
            {children}
        </motion.button>
    );
};

export default FloatingButton;
