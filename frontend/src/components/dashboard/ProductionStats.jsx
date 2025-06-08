import React from 'react';
import { formatCurrency } from '../../utils/formatter';

// Safelist warna untuk Tailwind
const safeColorClasses = {
  blue: 'border-blue-500 bg-blue-100 text-blue-600',
  yellow: 'border-yellow-500 bg-yellow-100 text-yellow-600',
  green: 'border-green-500 bg-green-100 text-green-600'
};

const ProductionStats = ({ stats }) => {
  // Fallback for stats if it's null or undefined
  const safeStats = stats || {};

  // Hitung total pesanan yang sudah selesai (Selesai Produksi + Siap Kirim)
  const totalInProgress = safeStats.inProgressOrders || 0;
  const totalCompletedProduction = safeStats.completedOrders || 0; // Pesanan "Selesai Produksi"
  const totalReadyToShip = safeStats.readyToShipOrders || 0; // Pesanan "Siap Kirim"
  
  // Total pesanan selesai adalah gabungan dari Selesai Produksi dan Siap Kirim
  const totalCompleted = totalCompletedProduction + totalReadyToShip;
  
  // Total untuk perhitungan persentase
  const relevantTotalForProgress = (totalInProgress + totalCompletedProduction + totalReadyToShip) || 1;

  const statItems = [
    {
      label: 'Total Pesanan Hari Ini',
      value: safeStats.newOrdersToday !== undefined ? safeStats.newOrdersToday : (safeStats.totalOrders || 0),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'blue',
      description: 'Pesanan baru hari ini'
    },
    {
      label: 'Dalam Proses',
      value: totalInProgress,
      total: relevantTotalForProgress,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'yellow',
      description: 'Sedang dikerjakan',
      showProgress: true
    },
    {
      label: 'Pesanan Selesai',
      value: totalCompleted,
      total: relevantTotalForProgress,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green',
      description: `Selesai Produksi (${totalCompletedProduction}) + Siap Kirim (${totalReadyToShip})`,
      showProgress: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statItems.map((item, index) => {
        const colorClasses = safeColorClasses[item.color];
        return (
          <div key={index} className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${colorClasses.split(' ')[0]}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700">{item.label}</h3>
              <div className={`p-3 rounded-full ${colorClasses.split(' ')[1]} ${colorClasses.split(' ')[2]}`}>
                {item.icon}
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-baseline">
                <p className="text-3xl font-semibold text-gray-800">{item.value}</p>
                {item.showProgress && (
                  <p className="ml-2 text-sm text-gray-500">
                    {((item.value / item.total) * 100).toFixed(0)}%
                  </p>
                )}
              </div>
              
              {item.description && (
                <p className="mt-1 text-sm text-gray-500">{item.description}</p>
              )}
              
              {item.showProgress && (
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-${item.color}-500 h-2 rounded-full`}
                    style={{ width: `${(item.value / item.total) * 100}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductionStats; 