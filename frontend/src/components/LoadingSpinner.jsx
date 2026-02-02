import { motion } from 'framer-motion';

const LoadingSpinner = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
            {/* Animated icon */}
            <motion.div
                animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="text-8xl filter drop-shadow-2xl"
            >
                ⚗️
            </motion.div>

            {/* Pulsing rings */}
            <div className="relative w-32 h-32">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="absolute inset-0 rounded-full border-4 border-cyan-500/30"
                        animate={{
                            scale: [1, 2, 2],
                            opacity: [1, 0.5, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.4,
                            ease: "easeOut"
                        }}
                    />
                ))}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 rounded-full border-4 border-transparent border-t-cyan-500 border-r-blue-500"
                    />
                </div>
            </div>

            {/* Loading text */}
            <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"
            >
                Loading...
            </motion.p>
        </div>
    );
};

export default LoadingSpinner;
