const KPICard = ({ title, value, unit = '', icon = '📊' }) => {
    return (
        <div className="kpi-card">
            <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{icon}</div>
            </div>
            <div className="text-sm text-white/70 mb-2">{title}</div>
            <div className="text-3xl font-bold">
                {typeof value === 'number' ? value.toFixed(2) : value}
                {unit && <span className="text-lg text-white/70 ml-1">{unit}</span>}
            </div>
        </div>
    );
};

export default KPICard;
