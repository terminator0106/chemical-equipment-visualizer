import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import GlassCard from './GlassCard';

const ChartGrid = ({ summary }) => {
    if (!summary) return null;

    // Prepare data for Equipment Type Distribution (Bar Chart)
    const typeDistData = Object.entries(summary.equipment_type_distribution || {}).map(
        ([name, value]) => ({
            name,
            count: value,
        })
    );

    // Prepare data for Pie Chart
    const pieData = typeDistData.map((item, index) => ({
        ...item,
        fill: ['#3b82f6', '#06b6d4', '#14b8a6', '#10b981', '#8b5cf6'][index % 5],
    }));

    // Overall average metrics data
    const overallMetricsData = [
        { name: 'Flowrate', value: summary.average_flowrate || 0 },
        { name: 'Pressure', value: summary.average_pressure || 0 },
        { name: 'Temperature', value: summary.average_temperature || 0 },
    ];

    // Average metrics per equipment type (multi-bar chart)
    const avgMetricsPerType = Object.entries(summary.avg_metrics_per_type || {}).map(
        ([type, metrics]) => ({
            type,
            flowrate: metrics.avg_flowrate || 0,
            pressure: metrics.avg_pressure || 0,
            temperature: metrics.avg_temperature || 0,
        })
    );

    // Radar chart data (normalized metrics)
    const maxFlowrate = summary.average_flowrate || 1;
    const maxPressure = summary.average_pressure || 1;
    const maxTemp = summary.average_temperature || 1;
    const maxValue = Math.max(maxFlowrate, maxPressure, maxTemp) || 1;

    const radarData = [
        {
            metric: 'Flowrate',
            value: (summary.average_flowrate || 0) / maxValue * 100,
            actual: summary.average_flowrate || 0
        },
        {
            metric: 'Pressure',
            value: (summary.average_pressure || 0) / maxValue * 100,
            actual: summary.average_pressure || 0
        },
        {
            metric: 'Temperature',
            value: (summary.average_temperature || 0) / maxValue * 100,
            actual: summary.average_temperature || 0
        },
    ];

    const COLORS = ['#3b82f6', '#06b6d4', '#14b8a6', '#10b981', '#8b5cf6'];

    const chartConfig = {
        style: {
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
        },
    };

    const tooltipStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(229, 231, 235, 0.8)',
        borderRadius: '12px',
        padding: '12px',
        color: '#111827',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    };

    const darkTooltipStyle = {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(71, 85, 105, 0.8)',
        borderRadius: '12px',
        padding: '12px',
        color: '#f1f5f9',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
    };

    // Detect dark mode
    const isDark = document.documentElement.classList.contains('dark');
    const currentTooltipStyle = isDark ? darkTooltipStyle : tooltipStyle;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart - Equipment Type Distribution */}
            <GlassCard className="p-6 backdrop-blur-xl">
                <h3 className="text-xl font-semibold mb-4 text-gray-100">
                    Equipment Type Distribution
                </h3>
                <ResponsiveContainer width="100%" height={450}>
                    <BarChart data={typeDistData} margin={{ top: 10, right: 20, left: 10, bottom: 70 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(71, 85, 105, 0.3)' : '#e5e7eb'} />
                        <XAxis
                            dataKey="name"
                            stroke={isDark ? '#9ca3af' : '#6b7280'}
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            interval={0}
                            tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }}
                        />
                        <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }} {...chartConfig} />
                        <Tooltip
                            contentStyle={currentTooltipStyle}
                            cursor={{ fill: isDark ? 'rgba(6, 182, 212, 0.1)' : 'rgba(59, 130, 246, 0.05)' }}
                        />
                        <Bar dataKey="count" fill={isDark ? '#06b6d4' : '#3b82f6'} radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </GlassCard>

            {/* Pie Chart - Equipment Share */}
            <GlassCard className="p-6 backdrop-blur-xl">
                <h3 className="text-xl font-semibold mb-4 text-gray-100">
                    Equipment Share by Type
                </h3>
                <ResponsiveContainer width="100%" height={450}>
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => entry.name}
                            outerRadius={130}
                            innerRadius={75}
                            fill="#8884d8"
                            dataKey="count"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={currentTooltipStyle}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </GlassCard>

            {/* Multi-Bar Chart - Average Metrics per Equipment Type */}
            {avgMetricsPerType.length > 0 && (
                <GlassCard className="p-6 lg:col-span-2 backdrop-blur-xl">
                    <h3 className="text-xl font-semibold mb-4 text-gray-100">
                        Average Metrics per Equipment Type
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={avgMetricsPerType}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(71, 85, 105, 0.3)' : '#e5e7eb'} />
                            <XAxis dataKey="type" stroke={isDark ? '#9ca3af' : '#6b7280'} tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }} {...chartConfig} />
                            <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }} {...chartConfig} />
                            <Tooltip contentStyle={currentTooltipStyle} />
                            <Legend
                                wrapperStyle={{ paddingTop: '20px', color: isDark ? '#f1f5f9' : '#111827' }}
                                iconType="circle"
                            />
                            <Bar dataKey="flowrate" fill="#06b6d4" name="Avg Flowrate" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="pressure" fill="#14b8a6" name="Avg Pressure" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="temperature" fill="#3b82f6" name="Avg Temperature" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </GlassCard>
            )}

            {/* Bar Chart - Overall Average Metrics */}
            <GlassCard className="p-6 backdrop-blur-xl">
                <h3 className="text-xl font-semibold mb-4 text-gray-100">
                    Overall Average Metrics
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={overallMetricsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(71, 85, 105, 0.3)' : '#e5e7eb'} />
                        <XAxis dataKey="name" stroke={isDark ? '#9ca3af' : '#6b7280'} tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }} {...chartConfig} />
                        <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }} {...chartConfig} />
                        <Tooltip
                            contentStyle={currentTooltipStyle}
                            cursor={{ fill: isDark ? 'rgba(6, 182, 212, 0.1)' : 'rgba(59, 130, 246, 0.05)' }}
                        />
                        <Bar dataKey="value" fill={isDark ? '#06b6d4' : '#3b82f6'} radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </GlassCard>

            {/* Radar Chart - Equipment Performance Profile */}
            <GlassCard className="p-6 backdrop-blur-xl">
                <h3 className="text-xl font-semibold mb-4 text-gray-100">
                    Equipment Performance Profile
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                        <PolarGrid stroke={isDark ? 'rgba(71, 85, 105, 0.5)' : '#e5e7eb'} />
                        <PolarAngleAxis
                            dataKey="metric"
                            stroke={isDark ? '#9ca3af' : '#6b7280'}
                            tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                        />
                        <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            stroke={isDark ? '#9ca3af' : '#6b7280'}
                            tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }}
                        />
                        <Radar
                            name="Metrics"
                            dataKey="value"
                            stroke={isDark ? '#06b6d4' : '#3b82f6'}
                            fill={isDark ? '#06b6d4' : '#3b82f6'}
                            fillOpacity={0.3}
                            strokeWidth={2}
                        />
                        <Tooltip
                            contentStyle={currentTooltipStyle}
                            formatter={(value, name, props) => [
                                `${props.payload.actual.toFixed(2)} (${value.toFixed(1)}%)`,
                                'Value'
                            ]}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </GlassCard>
        </div>
    );
};

export default ChartGrid;
