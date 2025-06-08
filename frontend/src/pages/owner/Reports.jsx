import React, { useState } from 'react';
import SalesReport from '../../components/reports/SalesReport';
import Button from '../../components/common/Button';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  
  function getDefaultStartDate(periodType) {
    const today = new Date();
    let startDate = new Date();
    
    if (periodType === 'weekly') {
      startDate.setDate(today.getDate() - 6);
    } else if (periodType === 'monthly') {
      startDate.setDate(today.getDate() - 29);
    } else if (periodType === 'yearly') {
      startDate.setDate(today.getDate() - 364);
    }
    
    return startDate.toISOString().split('T')[0];
  }
  
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };
  
  const currentStartDate = getDefaultStartDate(selectedPeriod);
  const currentEndDate = new Date().toISOString().split('T')[0];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Laporan</h1>
      
      <div className="bg-white rounded-lg shadow-lg mb-8 overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center px-5 py-2.5 font-medium rounded-md bg-blue-600 text-white shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Laporan Penjualan
            </div>
          </div>
        </div>
        
        <div className="p-6 border-b bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-2">
                Periode
              </label>
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => handlePeriodChange('weekly')}
                  className={`px-4 py-2 text-sm rounded-l-md transition-all w-full justify-center ${
                    selectedPeriod === 'weekly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Mingguan
                </button>
                <button
                  onClick={() => handlePeriodChange('monthly')}
                  className={`px-4 py-2 text-sm transition-all w-full justify-center ${
                    selectedPeriod === 'monthly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Bulanan
                </button>
                <button
                  onClick={() => handlePeriodChange('yearly')}
                  className={`px-4 py-2 text-sm rounded-r-md transition-all w-full justify-center ${
                    selectedPeriod === 'yearly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Tahunan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <SalesReport 
          period={selectedPeriod} 
          startDate={currentStartDate}
          endDate={currentEndDate}
          canExport={true} 
        />
      </div>
    </div>
  );
};

export default Reports;