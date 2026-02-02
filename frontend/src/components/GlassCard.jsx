import { motion } from 'framer-motion';

const GlassCard = ({ children, hover = false, className = '', ...props }) => {
    return (
        <motion.div
            whileHover={hover ? { y: -4, scale: 1.02 } : {}}
            className={`${hover ? 'glass-card-hover' : 'glass-card'} ${className}`}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
