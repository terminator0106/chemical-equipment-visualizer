import { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import GlassCard from './GlassCard';

const AnimatedKPICard = ({ title, value, unit = '', icon, color = 'cyan', trend }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const controls = useAnimation();

    useEffect(() => {
        // Count-up animation with smoother easing
        const duration = 2000;
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
        cyan: {
            bg: 'from-cyan-500/20 via-cyan-400/10 to-transparent',
            border: 'border-cyan-500/30 hover:border-cyan-400/50',
            icon: 'text-cyan-400',
            glow: 'shadow-cyan-500/20',
            accent: 'from-cyan-500 to-cyan-600'
        },
        teal: {
            bg: 'from-teal-500/20 via-teal-400/10 to-transparent',
            border: 'border-teal-500/30 hover:border-teal-400/50',
            icon: 'text-teal-400',
            glow: 'shadow-teal-500/20',
            accent: 'from-teal-500 to-teal-600'
        },
        blue: {
            bg: 'from-blue-500/20 via-blue-400/10 to-transparent',
            border: 'border-blue-500/30 hover:border-blue-400/50',
            icon: 'text-blue-400',
            glow: 'shadow-blue-500/20',
            accent: 'from-blue-500 to-blue-600'
        },
        emerald: {
            bg: 'from-emerald-500/20 via-emerald-400/10 to-transparent',
            border: 'border-emerald-500/30 hover:border-emerald-400/50',
            icon: 'text-emerald-400',
            glow: 'shadow-emerald-500/20',
            accent: 'from-emerald-500 to-emerald-600'
        },
    };

    const config = colorClasses[color] || colorClasses.cyan;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
            className={`relative overflow-hidden rounded-2xl backdrop-blur-xl 
                       bg-gradient-to-br ${config.bg} border-2 ${config.border}
                       p-6 group hover:shadow-2xl ${config.glow} transition-all duration-500`}
        >
            {/* Animated background gradient on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className={`absolute inset-0 bg-gradient-to-br ${config.bg} animate-pulse`}></div>
            </div>

            {/* Floating particles effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className={`absolute top-4 right-4 w-20 h-20 rounded-full bg-gradient-to-br ${config.bg} blur-2xl`}
                />
            </div>

            <div className="relative z-10">
                {/* Icon with hover animation */}
                <motion.div
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className={`text-5xl mb-3 ${config.icon} filter drop-shadow-lg`}
                >
                    {icon}
                </motion.div>

                {/* Title */}
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 
                               group-hover:text-gray-300 transition-colors duration-300">
                    {title}
                </h3>

                {/* Value with smooth animation */}
                <div className="flex items-baseline gap-2">
                    <motion.span
                        animate={controls}
                        className="text-4xl font-black text-white tracking-tight"
                    >
                        {displayValue.toFixed(2)}
                    </motion.span>
                    {unit && (
                        <span className="text-xl font-medium text-gray-400 group-hover:text-gray-300 transition-colors">
                            {unit}
                        </span>
                    )}
                </div>

                {/* Trend indicator if provided */}
                {trend && (
                    <div className={`mt-3 text-sm font-semibold ${trend > 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                        {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
                    </div>
                )}

                {/* Bottom accent line with animation */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className={`h-1 mt-4 rounded-full bg-gradient-to-r ${config.accent}`}
                />
            </div>

            {/* Corner accent glow */}
            <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full 
                           bg-gradient-to-br ${config.bg} opacity-20 group-hover:opacity-30 
                           blur-2xl transition-opacity duration-500`}></div>
        </motion.div>
    );
};

export default AnimatedKPICard;
