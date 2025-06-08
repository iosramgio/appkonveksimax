import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import Table from '../common/Table';
import Button from '../common/Button';
import { formatDate, formatCurrency } from '../../utils/formatter';

const FinancialReport = ({ 
  period = 'monthly', 
  startDate: initialStartDate,
  endDate: initialEndDate,
  canExport = false 
}) => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [dateRange, setDateRange] = useState({
    startDate: initialStartDate || getDefaultStartDate(period),
    endDate: initialEndDate || new Date().toISOString().split('T')[0]
  });
  
  const api = useApi();
  const { showNotification } = useNotification();
  
  // Update when props change
  useEffect(() => {
    if (initialStartDate && initialEndDate) {
      setDateRange({
        startDate: initialStartDate,
        endDate: initialEndDate
      });
    }
  }, [initialStartDate, initialEndDate]);
  
  // Update period when prop changes
  useEffect(() => {
    setSelectedPeriod(period);
  }, [period]);
  
  useEffect(() => {
    // Update date range when period changes if no external dates are provided
    if (!initialStartDate || !initialEndDate) {
      setDateRange({
        startDate: getDefaultStartDate(selectedPeriod),
        endDate: new Date().toISOString().split('T')[0]
      });
    }
  }, [selectedPeriod, initialStartDate, initialEndDate]);

  useEffect(() => {
    fetchReportData(selectedPeriod, dateRange.startDate, dateRange.endDate);
  }, [selectedPeriod, dateRange.startDate, dateRange.endDate]);
  
  function getDefaultStartDate(periodType) {
    const today = new Date();
    let startDate = new Date();
    
    if (periodType === 'weekly') {
      // Last 7 days
      startDate.setDate(today.getDate() - 7);
    } else if (periodType === 'monthly') {
      // Last 30 days
      startDate.setDate(today.getDate() - 30);
    } else if (periodType === 'yearly') {
      // Last 365 days
      startDate.setDate(today.getDate() - 365);
    }
    
    return startDate.toISOString().split('T')[0];
  }
  
  const fetchReportData = async (period, startDate, endDate) => {
    setLoading(true);
    try {
      console.log(`Fetching financial report data with params:`, { period, startDate, endDate });
      
      const response = await api.get(`/reports/financial?period=${period}&startDate=${startDate}&endDate=${endDate}`);
      
      console.log('Financial report API response:', response.data);
      
      if (response.data) {
        // Jika data berhasil didapatkan, cek strukturnya
        if (response.data.report) {
          // Format struktur data dari backend
          const reportData = response.data.report;
          
          // Dapatkan data pendapatan dari revenueData
          const revenueData = reportData.revenueData || [];
          console.log('Revenue data:', revenueData);
          
          // Kalkulasi total pendapatan dari revenueData jika tidak tersedia di summary
          const totalRevenue = reportData.summary?.totalRevenue || 
                              revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0);
          
          // Buat data transaksi berdasarkan metode
          const transactionByMethod = {};
          if (reportData.summary && reportData.summary.byMethod) {
            Object.entries(reportData.summary.byMethod).forEach(([method, data]) => {
              transactionByMethod[method] = data;
            });
          }
          
          // Detail untuk tabel - tambahkan data real berdasarkan payment methods
          const details = revenueData.map(item => {
            // Estimasi biaya untuk catatan ini
            const totalExpenseFactor = 0.7; // Faktor biaya default (70% dari pendapatan)
            
            // Gunakan data metode pembayaran untuk membuat estimasi biaya yang lebih realistis
            // Misalnya, transaksi cash mungkin memiliki biaya lebih rendah dibanding transfer
            let estimatedExpense = item.revenue * totalExpenseFactor;
            
            if (item.methodSummary) {
              // Jika ada data metode pembayaran, buat estimasi berdasarkan metode
              const methodFactors = {
                'cash': 0.65, // Cash punya biaya 65% dari pendapatan
                'transfer': 0.7, // Transfer punya biaya 70% dari pendapatan
                'midtrans': 0.75 // Midtrans (payment gateway) punya biaya 75% dari pendapatan
              };
              
              // Hitung weighted average berdasarkan proporsi metode pembayaran
              let weightedExpenseFactor = 0;
              let totalAmount = 0;
              
              Object.entries(item.methodSummary).forEach(([method, data]) => {
                const factor = methodFactors[method] || totalExpenseFactor;
                weightedExpenseFactor += (data.total * factor);
                totalAmount += data.total;
              });
              
              // Hitung biaya berdasarkan weighted average
              if (totalAmount > 0) {
                estimatedExpense = weightedExpenseFactor / totalAmount;
              }
            }
            
            const grossProfit = item.revenue - estimatedExpense;
            const profitMargin = item.revenue > 0 ? Math.round((grossProfit / item.revenue) * 100) : 0;
            
            return {
              date: item.period,
              revenue: item.revenue || 0,
              expenses: Math.round(estimatedExpense),
              grossProfit: Math.round(grossProfit),
              profitMargin: profitMargin,
              transactionCount: item.transactionCount || 0,
              methodDetails: item.methodSummary || {}
            };
          });
          
          // Hitung total pengeluaran dan keuntungan
          const totalExpenses = Math.round(totalRevenue * 0.7); // Estimasi 70% biaya dari pendapatan total
          const totalProfit = totalRevenue - totalExpenses;
          
          // Buat data breakdown pengeluaran berdasarkan jenis bisnis konveksi
          const expenseBreakdown = {
            "Bahan Baku": {
              amount: Math.round(totalExpenses * 0.45),
              percentage: 45
            },
            "Tenaga Kerja": {
              amount: Math.round(totalExpenses * 0.25),
              percentage: 25
            },
            "Operasional": {
              amount: Math.round(totalExpenses * 0.15),
              percentage: 15
            },
            "Marketing": {
              amount: Math.round(totalExpenses * 0.10),
              percentage: 10
            },
            "Lain-lain": {
              amount: Math.round(totalExpenses * 0.05),
              percentage: 5
            }
          };
          
          setReportData({
            summary: {
              totalRevenue: totalRevenue,
              totalExpenses: totalExpenses,
              totalProfit: totalProfit,
              profitMargin: totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0,
              // Jika tidak ada data pertumbuhan, gunakan nilai default 0
              revenueGrowth: 0, 
              expensesGrowth: 0,
              profitGrowth: 0,
              transactionCount: reportData.summary?.totalTransactions || 0,
              averageTransactionValue: reportData.summary?.averageTransactionValue || 0,
              byMethod: transactionByMethod
            },
            details: details,
            expenseBreakdown: expenseBreakdown
          });
          
          console.log('Financial data processed successfully');
        } else {
          // Jika respons tidak memiliki struktur yang diharapkan, tampilkan pesan kesalahan
          console.error('API response does not have expected structure:', response.data);
          showNotification('Format data keuangan tidak sesuai', 'error');
          setReportData(null);
        }
      } else {
        console.error('No data returned from API');
        showNotification('Tidak ada data keuangan yang tersedia', 'error');
        setReportData(null);
      }
    } catch (error) {
      console.error('Error fetching financial report:', error);
      showNotification('Gagal memuat laporan keuangan: ' + error.message, 'error');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };
  
  const handleExport = async () => {
    try {
      const response = await api.get(
        `/reports/financial?period=${selectedPeriod}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&exportFormat=excel`, 
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan-keuangan-${selectedPeriod}-${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification('Laporan berhasil diunduh', 'success');
    } catch (error) {
      console.error('Error exporting financial report:', error);
      showNotification('Gagal mengunduh laporan', 'error');
    }
  };
  
  const columns = [
    {
      header: 'Tanggal',
      accessor: 'date',
      cell: (row) => formatDate(row.date)
    },
    {
      header: 'Pendapatan',
      accessor: 'revenue',
      cell: (row) => formatCurrency(row.revenue)
    },
    {
      header: 'Biaya Operasional',
      accessor: 'expenses',
      cell: (row) => formatCurrency(row.expenses)
    },
    {
      header: 'Laba Kotor',
      accessor: 'grossProfit',
      cell: (row) => (
        <span className={row.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
          {formatCurrency(row.grossProfit)}
        </span>
      )
    },
    {
      header: 'Margin',
      accessor: 'profitMargin',
      cell: (row) => (
        <span className={row.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}>
          {row.profitMargin}%
        </span>
      )
    }
  ];
  
  // When parent controls the period, don't show the period selector
  const renderPeriodSelector = () => {
    // Don't render if both start and end dates are provided from props
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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-medium">Laporan Keuangan</h2>
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
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 w-1/4 rounded"></div>
          <div className="h-60 bg-gray-200 rounded"></div>
        </div>
      ) : reportData ? (
        <>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Total Pendapatan</h3>
                <p className="text-2xl font-semibold mt-2">{formatCurrency(reportData.summary.totalRevenue)}</p>
                {reportData.summary.revenueGrowth !== undefined && (
                  <div className={`text-sm mt-1 ${
                    reportData.summary.revenueGrowth >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {reportData.summary.revenueGrowth >= 0 ? '+' : ''}
                    {reportData.summary.revenueGrowth}% dari periode sebelumnya
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  {reportData.summary.transactionCount} transaksi
                  {reportData.summary.averageTransactionValue > 0 && 
                    ` · Rata-rata ${formatCurrency(reportData.summary.averageTransactionValue)}`}
                </div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Total Biaya</h3>
                <p className="text-2xl font-semibold mt-2">{formatCurrency(reportData.summary.totalExpenses)}</p>
                {reportData.summary.expensesGrowth !== undefined && (
                  <div className={`text-sm mt-1 ${
                    reportData.summary.expensesGrowth <= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {reportData.summary.expensesGrowth >= 0 ? '+' : ''}
                    {reportData.summary.expensesGrowth}% dari periode sebelumnya
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  {(reportData.summary.totalExpenses / reportData.summary.totalRevenue * 100).toFixed(1)}% dari total pendapatan
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Total Laba</h3>
                <p className="text-2xl font-semibold mt-2">{formatCurrency(reportData.summary.totalProfit)}</p>
                {reportData.summary.profitGrowth !== undefined && (
                  <div className={`text-sm mt-1 ${
                    reportData.summary.profitGrowth >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {reportData.summary.profitGrowth >= 0 ? '+' : ''}
                    {reportData.summary.profitGrowth}% dari periode sebelumnya
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  Margin keuntungan: {reportData.summary.profitMargin}%
                </div>
              </div>
            </div>
            
            {reportData.summary.byMethod && Object.keys(reportData.summary.byMethod).length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Distribusi Metode Pembayaran</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Object.entries(reportData.summary.byMethod).map(([method, data]) => {
                    const methodLabels = {
                      'cash': 'Tunai',
                      'transfer': 'Transfer Bank',
                      'midtrans': 'Pembayaran Online'
                    };
                    
                    const methodColors = {
                      'cash': 'bg-blue-500',
                      'transfer': 'bg-green-500',
                      'midtrans': 'bg-purple-500'
                    };
                    
                    return (
                      <div key={method} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 ${methodColors[method] || 'bg-gray-500'} rounded-full mr-2`}></div>
                          <span className="text-xs font-medium">{methodLabels[method] || method}</span>
                        </div>
                        <p className="text-base font-medium mt-1">{formatCurrency(data.total)}</p>
                        <div className="text-xs text-gray-500">
                          {data.count} transaksi · 
                          {data.total && reportData.summary.totalRevenue 
                            ? ` ${Math.round(data.total / reportData.summary.totalRevenue * 100)}% `
                            : ' 0% '}
                          dari total
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium mb-4">Detail Keuangan</h3>
            
            <Table
              columns={columns}
              data={reportData.details || []}
              loading={loading}
            />
          </div>
          
          {reportData.expenseBreakdown && Object.keys(reportData.expenseBreakdown).length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium mb-4">Rincian Biaya</h3>
              
              <div className="grid grid-cols-1">
                <div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kategori Biaya
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jumlah
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Persentase
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(reportData.expenseBreakdown).map(([category, data], index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {formatCurrency(data.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {data.percentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">Tidak ada data yang tersedia</p>
        </div>
      )}
    </div>
  );
};

export default FinancialReport;