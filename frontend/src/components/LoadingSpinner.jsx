const LoadingSpinner = () => {
    return (
        <div className="flex justify-center items-center py-12">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
