import { useState } from 'react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import GlassCard from './GlassCard';

const ChartPanel = ({ summary }) => {
    const [activeChart, setActiveChart] = useState(0);

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

    const isDark = document.documentElement.classList.contains('dark');
    const currentTooltipStyle = isDark ? darkTooltipStyle : tooltipStyle;

    const charts = [
        {
            id: 0,
            title: 'Equipment Type Distribution',
            icon: '📊',
            component: (
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
                        <Bar
                            dataKey="count"
                            fill={isDark ? '#06b6d4' : '#3b82f6'}
                            radius={[8, 8, 0, 0]}
                            onClick={(data, index) => {
                                console.log('Bar clicked:', data);
                            }}
                            style={{ cursor: 'pointer' }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 1,
            title: 'Equipment Share by Type',
            icon: '🥧',
            component: (
                <div>
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
                                onClick={(data, index) => {
                                    toast.info(`${data.name}: ${data.count} items`);
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        style={{ outline: 'none' }}
                                    />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={currentTooltipStyle} />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                formatter={(value, entry, index) => (
                                    <span style={{ color: isDark ? '#f1f5f9' : '#111827' }}>
                                        {value}
                                    </span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )
        },
        {
            id: 2,
            title: 'Average Metrics per Equipment Type',
            icon: '📈',
            component: avgMetricsPerType.length > 0 ? (
                <ResponsiveContainer width="100%" height={450}>
                    <BarChart data={avgMetricsPerType}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(71, 85, 105, 0.3)' : '#e5e7eb'} />
                        <XAxis dataKey="type" stroke={isDark ? '#9ca3af' : '#6b7280'} tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }} {...chartConfig} />
                        <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }} {...chartConfig} />
                        <Tooltip contentStyle={currentTooltipStyle} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px', color: isDark ? '#f1f5f9' : '#111827' }}
                            iconType="circle"
                        />
                        <Bar
                            dataKey="flowrate"
                            fill="#06b6d4"
                            name="Avg Flowrate"
                            radius={[8, 8, 0, 0]}
                            onClick={(data) => console.log('Flowrate clicked:', data)}
                            style={{ cursor: 'pointer' }}
                        />
                        <Bar
                            dataKey="pressure"
                            fill="#14b8a6"
                            name="Avg Pressure"
                            radius={[8, 8, 0, 0]}
                            onClick={(data) => console.log('Pressure clicked:', data)}
                            style={{ cursor: 'pointer' }}
                        />
                        <Bar
                            dataKey="temperature"
                            fill="#3b82f6"
                            name="Avg Temperature"
                            radius={[8, 8, 0, 0]}
                            onClick={(data) => console.log('Temperature clicked:', data)}
                            style={{ cursor: 'pointer' }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-[450px] text-gray-400">No data available</div>
        },
        {
            id: 3,
            title: 'Equipment Metrics Trend',
            icon: '📉',
            component: (
                <ResponsiveContainer width="100%" height={450}>
                    <LineChart data={avgMetricsPerType}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(71, 85, 105, 0.3)' : '#e5e7eb'} />
                        <XAxis
                            dataKey="type"
                            stroke={isDark ? '#9ca3af' : '#6b7280'}
                            tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
                            {...chartConfig}
                        />
                        <YAxis
                            stroke={isDark ? '#9ca3af' : '#6b7280'}
                            tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
                            {...chartConfig}
                        />
                        <Tooltip contentStyle={currentTooltipStyle} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px', color: isDark ? '#f1f5f9' : '#111827' }}
                            iconType="circle"
                        />
                        <Line
                            type="monotone"
                            dataKey="flowrate"
                            stroke="#06b6d4"
                            name="Avg Flowrate"
                            strokeWidth={3}
                            dot={{ fill: '#06b6d4', strokeWidth: 2, r: 5, cursor: 'pointer' }}
                            activeDot={{ r: 8, onClick: (e, payload) => console.log('Flowrate point clicked:', payload) }}
                        />
                        <Line
                            type="monotone"
                            dataKey="pressure"
                            stroke="#14b8a6"
                            name="Avg Pressure"
                            strokeWidth={3}
                            dot={{ fill: '#14b8a6', strokeWidth: 2, r: 5, cursor: 'pointer' }}
                            activeDot={{ r: 8, onClick: (e, payload) => console.log('Pressure point clicked:', payload) }}
                        />
                        <Line
                            type="monotone"
                            dataKey="temperature"
                            stroke="#3b82f6"
                            name="Avg Temperature"
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5, cursor: 'pointer' }}
                            activeDot={{ r: 8, onClick: (e, payload) => console.log('Temperature point clicked:', payload) }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 4,
            title: 'Equipment Performance Profile',
            icon: '🔄',
            component: (
                <ResponsiveContainer width="100%" height={450}>
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
            )
        }
    ];

    return (
        <div>
            {/* Header with title and selector buttons */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                <div>
                    <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                        Visualizations
                    </h2>
                    <p className="text-gray-500 text-sm">Interactive data exploration</p>
                </div>

                {/* Chart selector buttons */}
                <div className="flex flex-wrap gap-3">
                    {charts.map((chart) => (
                        <button
                            key={chart.id}
                            onClick={() => setActiveChart(chart.id)}
                            className={`group relative px-5 py-3 rounded-xl font-bold transition-all duration-300 
                                      flex items-center gap-2.5 overflow-hidden ${activeChart === chart.id
                                    ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white shadow-2xl shadow-cyan-500/40 scale-105'
                                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10 hover:border-cyan-500/30'
                                }`}
                        >
                            {/* Animated background on active */}
                            {activeChart === chart.id && (
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 
                                              animate-pulse opacity-50 blur-xl"></div>
                            )}

                            <span className={`text-xl relative z-10 transition-transform duration-300 
                                           ${activeChart === chart.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                                {chart.icon}
                            </span>
                            <span className="hidden sm:inline relative z-10 text-sm font-bold tracking-wide">
                                {chart.title.split(' ')[0]}
                            </span>

                            {/* Hover glow effect */}
                            {activeChart !== chart.id && (
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-xl"></div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Active chart display */}
            <GlassCard className="p-8 backdrop-blur-2xl border-2 border-white/10 hover:border-cyan-500/30 
                                 transition-all duration-500 shadow-2xl hover:shadow-cyan-500/20">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-100 mb-1">
                            {charts[activeChart].title}
                        </h3>
                        <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></div>
                    </div>
                    <span className="text-5xl filter drop-shadow-lg">{charts[activeChart].icon}</span>
                </div>
                {charts[activeChart].component}
            </GlassCard>
        </div>
    );
};

export default ChartPanel;
