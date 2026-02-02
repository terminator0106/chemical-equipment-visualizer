import { motion } from 'framer-motion';

const InsightCard = ({ title, description, status = 'normal', icon }) => {
    const statusConfig = {
        normal: {
            bg: 'from-emerald-500/10 via-teal-500/5 to-transparent',
            border: 'border-emerald-500/30',
            badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
            glow: 'shadow-emerald-500/20',
            iconColor: 'text-emerald-400',
        },
        warning: {
            bg: 'from-amber-500/10 via-yellow-500/5 to-transparent',
            border: 'border-amber-500/30',
            badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
            glow: 'shadow-amber-500/20',
            iconColor: 'text-amber-400',
        },
        critical: {
            bg: 'from-red-500/10 via-pink-500/5 to-transparent',
            border: 'border-red-500/30',
            badge: 'bg-red-500/20 text-red-300 border-red-500/40',
            glow: 'shadow-red-500/20',
            iconColor: 'text-red-400',
        },
    };

    const config = statusConfig[status] || statusConfig.normal;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={`relative overflow-hidden rounded-2xl backdrop-blur-xl 
                       bg-gradient-to-br ${config.bg} border-2 ${config.border}
                       p-6 group hover:shadow-2xl ${config.glow} transition-all duration-500`}
        >
            {/* Animated background pulse */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className={`absolute inset-0 bg-gradient-to-br ${config.bg} animate-pulse`}></div>
            </div>

            {/* Floating orb effect */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full 
                          bg-gradient-to-br from-white/5 to-transparent blur-2xl 
                          group-hover:scale-150 transition-transform duration-700"></div>

            <div className="relative z-10">
                {/* Icon and Status Badge */}
                <div className="flex items-center justify-between mb-4">
                    <motion.div
                        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.2 }}
                        transition={{ duration: 0.5 }}
                        className={`text-4xl ${config.iconColor} filter drop-shadow-lg`}
                    >
                        {icon}
                    </motion.div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider 
                                    ${config.badge} border-2 backdrop-blur-sm`}>
                        {status}
                    </span>
                </div>

                {/* Title */}
                <h4 className="text-lg font-bold text-gray-100 mb-2 group-hover:text-white transition-colors">
                    {title}
                </h4>

                {/* Description */}
                <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                    {description}
                </p>

                {/* Bottom accent line */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className={`h-0.5 mt-4 rounded-full bg-gradient-to-r ${config.bg}`}
                />
            </div>

            {/* Corner glow */}
            <div className={`absolute -bottom-6 -left-6 w-24 h-24 rounded-full 
                           bg-gradient-to-br ${config.bg} opacity-30 blur-2xl 
                           group-hover:opacity-50 transition-opacity duration-500`}></div>
        </motion.div>
    );
};

export default InsightCard;
