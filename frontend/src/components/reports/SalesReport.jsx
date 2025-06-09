import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import Table from '../common/Table';
import Button from '../common/Button';
import { formatDate, formatCurrency } from '../../utils/formatter';
import SalesChart from '../dashboard/SalesChart';

const SalesReport = ({ 
  period = 'monthly', 
  startDate: initialStartDate,
  endDate: initialEndDate,
  canExport = false 
}) => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    overallSummary: null,
    summaryForSelectedPeriod: null
  });
  const [chartData, setChartData] = useState([]);
  const [tableDetailsData, setTableDetailsData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [dateRange, setDateRange] = useState({
    startDate: initialStartDate || getDefaultStartDate(period),
    endDate: initialEndDate || new Date().toISOString().split('T')[0]
  });
  
  const api = useApi();
  const { showNotification } = useNotification();
  
  useEffect(() => {
    if (initialStartDate && initialEndDate) {
      setDateRange({ startDate: initialStartDate, endDate: initialEndDate });
    }
  }, [initialStartDate, initialEndDate]);
  
  useEffect(() => {
    setSelectedPeriod(period);
  }, [period]);
  
  useEffect(() => {
    if (!initialStartDate || !initialEndDate) {
      const today = new Date();
      const endDateString = today.toISOString().split('T')[0];
      const startDateString = getDefaultStartDate(selectedPeriod);
      
      setDateRange({
        startDate: startDateString,
        endDate: endDateString
      });
    }
  }, [selectedPeriod, initialStartDate, initialEndDate]);

  useEffect(() => {
    fetchReportData(selectedPeriod, dateRange.startDate, dateRange.endDate);
  }, [selectedPeriod, dateRange.startDate, dateRange.endDate]);
  
  function getDefaultStartDate(periodType) {
    const today = new Date();
    let startDate = new Date(today);
    
    if (periodType === 'weekly') {
      // Mengambil tanggal awal minggu (Senin) dari minggu ini
      const day = today.getDay(); // Use standard UTC day
      const diff = day === 0 ? 6 : day - 1; 
      startDate.setDate(today.getDate() - diff);
    } else if (periodType === 'monthly') {
      startDate.setDate(today.getDate() - 29); // 30 days including today
    } else if (periodType === 'yearly') {
      startDate.setFullYear(today.getFullYear() - 1);
    }
    
    return startDate.toISOString().split('T')[0];
  }
  
  const fetchReportData = async (currentUISelectedPeriod, currentUIStartDate, currentUIEndDate) => {
    setLoading(true);
    console.log("[SalesReport] Fetching report with UI period:", currentUISelectedPeriod, 
      "startDate:", currentUIStartDate, 
      "endDate:", currentUIEndDate,
      "current time:", new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
    );
    
    try {
      const response = await api.get(`/reports/sales?period=${currentUISelectedPeriod}&startDate=${currentUIStartDate}&endDate=${currentUIEndDate}`);
      
      if (response.data && response.data.report) {
        const backendReport = response.data.report;
        
        setReportData({
          overallSummary: backendReport.overallSummary || {
            allTimeTotalSales: 0, allTimeTotalOrders: 0, allTimeAverageOrderValue: 0,
            fixedSalesGrowthPercentage: 0, fixedOrdersGrowthPercentage: 0, fixedAovGrowthPercentage: 0,
            growthPeriodDescription: 'N/A'
          },
          summaryForSelectedPeriod: backendReport.summaryForSelectedPeriod || {}
        });
        
        let timelineDataSource = [];
        if (currentUISelectedPeriod === 'yearly' && backendReport.yearlySales) {
          timelineDataSource = backendReport.yearlySales;
        } else if (currentUISelectedPeriod === 'monthly' && backendReport.monthlySales) {
          timelineDataSource = backendReport.monthlySales;
        } else if (backendReport.dailySales) {
          timelineDataSource = backendReport.dailySales;
        }

        console.log(`[SalesReport] Period: ${currentUISelectedPeriod}, RawTimelineDataSource from backend:`, timelineDataSource);

        const transformedForChart = timelineDataSource.map(item => {
          let date;
          if (currentUISelectedPeriod === 'yearly') {
            date = item.bulan;
          } else if (currentUISelectedPeriod === 'monthly' || currentUISelectedPeriod === 'weekly') {
            if (currentUISelectedPeriod === 'weekly') {
              // Format tanggal dengan timezone Asia/Jakarta
              const itemDate = new Date(item.tanggal);
              const jakartaDate = new Date(itemDate.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
              const formattedDate = jakartaDate.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });
              date = `${item.hari}, ${formattedDate}`;
            } else {
              const dateObj = new Date(item.tanggal);
              const jakartaDate = new Date(dateObj.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
              date = jakartaDate.toLocaleDateString('id-ID', { 
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });
            }
          }

          return {
            date: date,
            dailyRevenue: item.totalPenjualan,
            dailyOrderCount: item.jumlahOrder
          };
        }).filter(item => item.dailyRevenue !== undefined && item.dailyOrderCount !== undefined);

        console.log(`[SalesReport] Period: ${currentUISelectedPeriod}, TransformedForChart:`, transformedForChart);
        setChartData(transformedForChart);

        const transformedForTable = timelineDataSource.map(item => ({
          tanggal: item.tanggal,
          hari: item.hari,
          bulan: item.bulan,
          totalPenjualan: item.totalPenjualan,
          jumlahOrder: item.jumlahOrder,
          rataRataNilaiPesanan: item.jumlahOrder > 0 ? item.totalPenjualan / item.jumlahOrder : 0
        }));
        setTableDetailsData(transformedForTable);
      } else {
        setReportData({ overallSummary: null, summaryForSelectedPeriod: null });
        setChartData([]);
        setTableDetailsData([]);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      showNotification('Gagal memuat laporan penjualan', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const columns = [
    {
      header: 'Tanggal',
      accessor: 'tanggal',
      cell: (row) => {
        if (selectedPeriod === 'yearly') {
          return row.bulan || 'N/A';
        }
        if (!row.tanggal) return 'N/A';
        const date = new Date(row.tanggal);
        const correctedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        const dayName = row.hari;
        const formattedDate = correctedDate.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        return `${dayName}, ${formattedDate}`;
      }
    },
    { header: 'Total Penjualan', accessor: 'totalPenjualan', cell: (row) => formatCurrency(row.totalPenjualan || 0) },
    { header: 'Jumlah Pesanan', accessor: 'jumlahOrder', cell: (row) => row.jumlahOrder || 0 },
    { header: 'Rata-rata Nilai Pesanan', accessor: 'rataRataNilaiPesanan', cell: (row) => formatCurrency(row.rataRataNilaiPesanan || 0) }
  ];
  
  const handleExport = async () => {
    try {
      const response = await api.get(
        `/reports/sales?period=${selectedPeriod}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&exportFormat=excel`, 
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan-penjualan-${selectedPeriod}-${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification('Laporan berhasil diunduh', 'success');
    } catch (error) {
      console.error('Error exporting sales report:', error);
      showNotification('Gagal mengunduh laporan', 'error');
    }
  };
  
  const renderPeriodSelector = () => {
    if (initialStartDate && initialEndDate) return null;
    
    return (
      <div className="flex rounded-md shadow-sm">
        <button
          onClick={() => setSelectedPeriod('weekly')}
          className={`px-3 py-1 text-sm rounded-l-md ${
            selectedPeriod === 'weekly'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Mingguan
        </button>
        <button
          onClick={() => setSelectedPeriod('monthly')}
          className={`px-3 py-1 text-sm ${
            selectedPeriod === 'monthly'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Bulanan
        </button>
        <button
          onClick={() => setSelectedPeriod('yearly')}
          className={`px-3 py-1 text-sm rounded-r-md ${
            selectedPeriod === 'yearly'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tahunan
        </button>
      </div>
    );
  };
  
  const overallSummary = reportData.overallSummary;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-medium">Laporan Penjualan</h2>
          {renderPeriodSelector()}
        </div>
        
        {canExport && (
          <Button
            label="Export Excel"
            variant="outline"
            onClick={handleExport}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            }
          />
        )}
      </div>
      
      {loading ? (
        <div className="animate-pulse space-y-4"></div>
      ) : overallSummary ? (
        <>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Total Penjualan (Keseluruhan)</h3>
                <p className="text-2xl font-semibold mt-2">{formatCurrency(overallSummary.allTimeTotalSales)}</p>
                {overallSummary.fixedSalesGrowthPercentage !== undefined && (
                  <div className={`text-sm mt-1 ${overallSummary.fixedSalesGrowthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {overallSummary.fixedSalesGrowthPercentage >= 0 ? '+' : ''}
                    {overallSummary.fixedSalesGrowthPercentage}% {overallSummary.growthPeriodDescription}
                  </div>
                )}
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Total Pesanan (Keseluruhan)</h3>
                <p className="text-2xl font-semibold mt-2">{overallSummary.allTimeTotalOrders}</p>
                {overallSummary.fixedOrdersGrowthPercentage !== undefined && (
                  <div className={`text-sm mt-1 ${overallSummary.fixedOrdersGrowthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {overallSummary.fixedOrdersGrowthPercentage >= 0 ? '+' : ''}
                    {overallSummary.fixedOrdersGrowthPercentage}% {overallSummary.growthPeriodDescription}
                  </div>
                )}
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Rata-rata Nilai Pesanan (Keseluruhan)</h3>
                <p className="text-2xl font-semibold mt-2">{formatCurrency(overallSummary.allTimeAverageOrderValue)}</p>
                {overallSummary.fixedAovGrowthPercentage !== undefined && (
                  <div className={`text-sm mt-1 ${overallSummary.fixedAovGrowthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {overallSummary.fixedAovGrowthPercentage >= 0 ? '+' : ''}
                    {overallSummary.fixedAovGrowthPercentage}% {overallSummary.growthPeriodDescription}
                  </div>
                )}
              </div>
            </div>
            
            <SalesChart data={chartData} period={selectedPeriod} />
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium mb-4">Detail Penjualan ({selectedPeriod === 'weekly' ? 'Mingguan' : selectedPeriod === 'monthly' ? 'Bulanan' : 'Tahunan'})</h3>
            <Table columns={columns} data={tableDetailsData} loading={loading} pagination={false} />
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">Tidak ada data yang tersedia untuk periode yang dipilih atau ringkasan umum.</p>
        </div>
      )}
    </div>
  );
};

export default SalesReport;