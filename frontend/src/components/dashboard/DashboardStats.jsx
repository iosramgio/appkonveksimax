import React from 'react';
import { formatCurrency } from '../../utils/formatter';

const DashboardStats = ({ stats }) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 sm:mb-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white p-4 sm:p-6 rounded-lg shadow-md animate-pulse">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const {
    totalSales = 0,
    salesGrowth = 0,
    totalOrders = 0,
    ordersGrowth = 0,
    averageOrderValue = 0,
    pendingOrders = 0,
    completedOrders = 0,
    topProducts = [],
    monthlySales = [],
  } = stats;
  
  const getGrowthIndicator = (growth, periodText = "dari periode lalu") => {
    const growthValue = Number(growth) || 0;
    let textClass = 'text-gray-600';
    let icon = null;
    let prefix = growthValue > 0 ? '+' : '';

    if (growthValue > 0) {
      textClass = 'text-green-600';
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
        </svg>
      );
    } else if (growthValue < 0) {
      textClass = 'text-red-600';
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
        </svg>
      );
      prefix = '';
    }
    
    return (
      <span className={`ml-2 ${textClass} flex items-center text-xs sm:text-sm`}>
        {icon}
        {prefix}{growthValue}%
        <span className="ml-1 text-gray-500">{periodText}</span>
      </span>
    );
  };
  
  const statCards = [
    {
      title: 'Total Penjualan',
      value: formatCurrency(totalSales || 0),
      icon: (
        <div className="p-2 sm:p-3 rounded-full bg-blue-100 text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ),
      growth: salesGrowth,
      growthPeriodText: "dari 30 hari lalu"
    },
    {
      title: 'Total Pesanan',
      value: totalOrders || 0,
      icon: (
        <div className="p-2 sm:p-3 rounded-full bg-green-100 text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
      ),
      growth: ordersGrowth,
      growthPeriodText: "dari 30 hari lalu"
    },
    {
      title: 'Pesanan Pending',
      value: pendingOrders || 0,
      icon: (
        <div className="p-2 sm:p-3 rounded-full bg-yellow-100 text-yellow-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
      )
    },
    {
      title: 'Rata-rata Pesanan',
      value: formatCurrency(averageOrderValue || 0),
      suffixLabel: '/ pesanan',
      icon: (
        <div className="p-2 sm:p-3 rounded-full bg-purple-100 text-purple-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </div>
      )
    }
  ];
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 sm:mb-6">
      {statCards.map((card, index) => (
        <div key={index} className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            {card.icon}
            <div className="ml-4">
              <p className="text-xs sm:text-sm text-gray-500">{card.title}</p>
              <div className="flex items-baseline">
                <h2 className="text-base sm:text-xl font-semibold">{card.value}</h2>
                {card.growth !== undefined && getGrowthIndicator(card.growth, card.growthPeriodText)}
                {card.suffixLabel && (
                  <span className="ml-1 text-gray-500 text-xs sm:text-sm self-end">
                    {card.suffixLabel}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;