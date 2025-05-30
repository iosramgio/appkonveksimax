import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  TimeSeriesScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { formatCurrency } from '../../utils/formatter';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  TimeSeriesScale
);

// Cobalah registrasi skala waktu secara lebih eksplisit (kadang membantu dengan bundler tertentu)
// Meskipun seharusnya tidak diperlukan jika impor adapter bekerja dengan benar.
// import {_adapters} from 'chart.js'; // Ini mungkin perlu jika kita mau set adapter secara manual
// import {DateFnsAdapter} from 'chartjs-adapter-date-fns'; // Ini biasanya tidak diekspos seperti ini
// _adapters._date.override(new DateFnsAdapter()); // Ini cara lama dan mungkin tidak berlaku

const SalesChart = ({ data = [] }) => {
  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: 'Total Penjualan (Rp)',
        data: data.map(item => item.dailyRevenue),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        yAxisID: 'y-revenue',
        tension: 0.4
      },
      {
        label: 'Jumlah Pesanan',
        data: data.map(item => item.dailyOrderCount),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        yAxisID: 'y-orders',
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.dataset.yAxisID === 'y-revenue') {
              label += formatCurrency(context.raw);
            } else {
              label += context.raw;
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'PP',
          displayFormats: {
            day: 'dd MMM'
          }
        },
        title: {
          display: true,
          text: 'Tanggal'
        }
      },
      'y-revenue': {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        },
        title: {
          display: true,
          text: 'Total Penjualan (Rp)'
        }
      },
      'y-orders': {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Jumlah Pesanan'
        }
      }
    }
  };

  return (
    <div className="h-96">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default SalesChart;