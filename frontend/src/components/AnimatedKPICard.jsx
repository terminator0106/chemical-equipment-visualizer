import { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import GlassCard from './GlassCard';

const AnimatedKPICard = ({ title, value, unit = '', icon, color = 'cyan', trend }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const controls = useAnimation();

    useEffect(() => {
        // Count-up animation
        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = value / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setDisplayValue(value);
                clearInterval(timer);
            } else {
                setDisplayValue(current);
            }
        }, duration / steps);

        controls.start({
            scale: [1, 1.05, 1],
            transition: { duration: 0.5 }
        });

        return () => clearInterval(timer);
    }, [value, controls]);

    const colorClasses = {
        cyan: 'bg-blue-900/20 border-blue-700/50',
        teal: 'bg-teal-900/20 border-teal-700/50',
        emerald: 'bg-emerald-900/20 border-emerald-700/50',
        blue: 'bg-indigo-900/20 border-indigo-700/50',
    };

    const textColorClasses = {
        cyan: 'text-blue-400',
        teal: 'text-teal-400',
        emerald: 'text-emerald-400',
        blue: 'text-indigo-400',
    };

    const iconColorClasses = {
        cyan: 'from-blue-400/30 to-cyan-400/30',
        teal: 'from-teal-400/30 to-emerald-400/30',
        emerald: 'from-emerald-400/30 to-green-400/30',
        blue: 'from-indigo-400/30 to-blue-400/30',
    };

    return (
        <motion.div animate={controls}>
            <div className={`glass-card p-6 ${colorClasses[color]} border-2 backdrop-blur-xl relative overflow-hidden group`}>
                {/* Gradient Orb */}
                <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${iconColorClasses[color]} rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                        <div className="text-4xl filter drop-shadow-lg">{icon}</div>
                        {trend && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                                trend > 0 ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/40 text-red-400'
                            }`}>
                                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                            </span>
                        )}
                    </div>

                    <div className="text-sm text-gray-400 mb-2 font-medium uppercase tracking-wide">
                        {title}
                    </div>

                    <div className={`text-4xl font-bold font-mono ${textColorClasses[color]}`}>
                        {typeof value === 'number' ? displayValue.toFixed(2) : value}
                        {unit && <span className="text-lg text-gray-400 ml-1">{unit}</span>}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AnimatedKPICard;
