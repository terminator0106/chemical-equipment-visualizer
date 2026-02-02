import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ChartPanel = ({ equipmentTypeDistribution }) => {
    if (!equipmentTypeDistribution || Object.keys(equipmentTypeDistribution).length === 0) {
        return (
            <div className="glass-card p-8 text-center text-white/60">
                No equipment type data available
            </div>
        );
    }

    const data = {
        labels: Object.keys(equipmentTypeDistribution),
        datasets: [
            {
                label: 'Equipment Count',
                data: Object.values(equipmentTypeDistribution),
                backgroundColor: 'rgba(167, 139, 250, 0.6)',
                borderColor: 'rgba(167, 139, 250, 1)',
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: 'rgba(255, 255, 255, 0.9)',
                    font: {
                        size: 14,
                    },
                },
            },
            title: {
                display: true,
                text: 'Equipment Type Distribution',
                color: 'rgba(255, 255, 255, 0.9)',
                font: {
                    size: 18,
                    weight: 'bold',
                },
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'rgba(255, 255, 255, 1)',
                bodyColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: 'rgba(167, 139, 250, 0.5)',
                borderWidth: 1,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    stepSize: 1,
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
            },
            x: {
                ticks: {
                    color: 'rgba(255, 255, 255, 0.7)',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
            },
        },
    };

    return (
        <div className="glass-card p-6">
            <div style={{ height: '400px' }}>
                <Bar data={data} options={options} />
            </div>
        </div>
    );
};

export default ChartPanel;
