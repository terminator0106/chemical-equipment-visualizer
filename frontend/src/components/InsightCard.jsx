import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

const InsightCard = ({ title, description, status = 'normal', icon }) => {
    const statusClass = {
        normal: 'status-normal',
        warning: 'status-warning',
        critical: 'status-critical',
    }[status];

    return (
        <GlassCard hover className="p-5 backdrop-blur-xl">
            <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{icon}</div>
                <span className={statusClass}>{status}</span>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-100">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        </GlassCard>
    );
};

export default InsightCard;
