import React from 'react';
import { formatCurrency } from '../../utils/formatter';

const ProductionStats = ({ stats }) => {
  // Fallback for stats if it's null or undefined
  const safeStats = stats || {};

  // Buat logika baru untuk menghitung "Pesanan Selesai" dari pesanan "Siap Kirim"
  const totalInProgress = safeStats.inProgressOrders || 0;
  const totalCompletedProduction = safeStats.completedOrders || 0; // Pesanan "Selesai Produksi"
  const totalReadyToShip = safeStats.readyToShipOrders || 0; // Pesanan "Siap Kirim"
  
  // Gabungkan "Siap Kirim" ke dalam "Selesai" untuk tampilan di dashboard
  const totalCompleted = totalReadyToShip || 0;
  
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
      label: 'Pesanan Selesai & Siap Kirim',
      value: totalCompleted,
      total: relevantTotalForProgress,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green',
      description: 'Produksi selesai',
      showProgress: true
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
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statItems.map((item, index) => {
        const itemValue = item.value || 0;
        const itemTotal = item.total || 1; // Default total to 1 if not provided
        const percentage = Math.min(100, Math.round((itemValue / itemTotal) * 100));
        const displayPercentage = isNaN(percentage) ? 0 : percentage; // Handle NaN explicitly

        return (
          <div 
            key={index} 
            className={`bg-white rounded-lg shadow-sm border-l-4 border-${item.color}-500 hover:shadow-md transition duration-300 p-6`}
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-full bg-${item.color}-100 text-${item.color}-600`}>
                {item.icon}
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{item.label}</p>
                <p className="text-xl font-semibold text-gray-900">{item.value}</p>
                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                
                {item.showProgress && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-${item.color}-500 h-2 rounded-full`} 
                        style={{ 
                          width: `${displayPercentage}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-right mt-1 text-gray-500">
                      {displayPercentage}% dari total
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductionStats; 