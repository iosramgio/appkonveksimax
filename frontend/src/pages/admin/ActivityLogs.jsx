import React, { useState, useEffect } from 'react';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import SelectField from '../../components/forms/SelectField';
import { formatDate } from '../../utils/formatter';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  
  const api = useApi();
  const { success: showSuccess, error: showError } = useNotification();
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    // Extract unique modules from logs
    const extractModules = () => {
      if (logs && logs.length > 0) {
        const uniqueModules = [...new Set(logs.map(log => log.module).filter(Boolean))];
        setModules(uniqueModules);
      }
    };
    
    fetchUsers();
    return () => extractModules();
  }, [logs]);
  
  useEffect(() => {
    fetchLogs();
  }, [currentPage, actionFilter, userFilter, moduleFilter]);
  
  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = `/dashboard/activity-logs?page=${currentPage}&action=${actionFilter}&user=${userFilter}&limit=15`;
      
      if (moduleFilter !== 'all') {
        url += `&module=${moduleFilter}`;
      }
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      if (dateRange.start) {
        url += `&startDate=${dateRange.start}`;
      }
      
      if (dateRange.end) {
        url += `&endDate=${dateRange.end}`;
      }
      
      const response = await api.get(url);
      
      setLogs(response.data.logs);
      setTotalPages(response.data.pagination.pages);
      
      // Extract modules from new logs
      if (response.data.logs.length > 0 && modules.length === 0) {
        const uniqueModules = [...new Set(response.data.logs.map(log => log.module).filter(Boolean))];
        setModules(uniqueModules);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      showError('Gagal memuat log aktivitas');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs();
  };
  
  const handleReset = () => {
    setActionFilter('all');
    setUserFilter('all');
    setModuleFilter('all');
    setSearchQuery('');
    setDateRange({ start: '', end: '' });
    setCurrentPage(1);
  };
  
  const handleExport = async () => {
    try {
      setLoading(true);
      
      let url = `/dashboard/export-logs?action=${actionFilter}&user=${userFilter}`;
      
      if (moduleFilter !== 'all') {
        url += `&module=${moduleFilter}`;
      }
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      if (dateRange.start) {
        url += `&startDate=${dateRange.start}`;
      }
      
      if (dateRange.end) {
        url += `&endDate=${dateRange.end}`;
      }
      
      const response = await api.get(url, { responseType: 'blob' });
      
      // Create a download link
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `activity-logs-${formatDate(new Date())}.xlsx`;
      link.click();
      
      showSuccess('Log aktivitas berhasil diexport');
    } catch (error) {
      console.error('Error exporting logs:', error);
      showError('Gagal mengexport log aktivitas');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const handleActionFilterChange = (e) => {
    setActionFilter(e.target.value);
    setCurrentPage(1);
  };
  
  const handleUserFilterChange = (e) => {
    setUserFilter(e.target.value);
    setCurrentPage(1);
  };
  
  const handleModuleFilterChange = (e) => {
    setModuleFilter(e.target.value);
    setCurrentPage(1);
  };
  
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const getActionLabel = (action) => {
    switch (action) {
      case 'create_order':
        return 'Membuat Pesanan';
      case 'update_order':
        return 'Mengubah Pesanan';
      case 'update_status':
        return 'Mengubah Status';
      case 'payment':
        return 'Pembayaran';
      case 'create_user':
        return 'Membuat User';
      case 'update_user':
        return 'Mengubah User';
      case 'create_product':
        return 'Membuat Produk';
      case 'update_product':
        return 'Mengubah Produk';
      case 'view':
        return 'Melihat';
      case 'create':
        return 'Membuat';
      case 'update':
        return 'Mengubah';
      case 'delete':
        return 'Menghapus';
      case 'login':
        return 'Login';
      case 'logout':
        return 'Logout';
      case 'export':
        return 'Export Data';
      case 'import':
        return 'Import Data';
      case 'print':
        return 'Print';
      case 'download':
        return 'Download';
      case 'upload':
        return 'Upload';
      default:
        return action;
    }
  };
  
  const getActionColor = (action) => {
    switch (action) {
      case 'create':
      case 'create_order':
      case 'create_user':
      case 'create_product':
        return 'bg-green-100 text-green-800'; // Green for creation actions
      case 'update':
      case 'update_order':
      case 'update_user':
      case 'update_product':
      case 'update_status':
        return 'bg-blue-100 text-blue-800';   // Blue for update actions
      case 'delete':
        return 'bg-red-100 text-red-800';     // Red for delete actions
      case 'login':
      case 'logout':
        return 'bg-purple-100 text-purple-800'; // Purple for auth actions
      case 'payment':
        return 'bg-yellow-100 text-yellow-800'; // Yellow for payment actions
      case 'export':
      case 'import':
      case 'print':
      case 'download':
      case 'upload':
        return 'bg-indigo-100 text-indigo-800'; // Indigo for data transfer actions
      default:
        return 'bg-gray-100 text-gray-800';    // Gray for other actions
    }
  };
  
  const columns = [
    {
      key: 'timestamp',
      title: 'Waktu',
      render: (row) => formatDate(row.createdAt, true)
    },
    {
      key: 'user',
      title: 'User',
      render: (row) => row.user ? row.user.name : 'System'
    },
    {
      key: 'action',
      title: 'Aksi',
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(row.action)}`}>
          {getActionLabel(row.action)}
        </span>
      )
    },
    {
      key: 'description',
      title: 'Deskripsi',
      render: (row) => (
        <div className="max-w-md truncate">
          {row.description || '-'}
        </div>
      )
    },
    {
      key: 'module',
      title: 'Modul',
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {row.module || '-'}
        </span>
      )
    }
  ];
  
  const actionOptions = [
    { value: 'all', label: 'Semua Aksi' },
    { value: 'view', label: 'Melihat' },
    { value: 'create', label: 'Membuat' },
    { value: 'update', label: 'Mengubah' },
    { value: 'delete', label: 'Menghapus' },
    { value: 'create_order', label: 'Membuat Pesanan' },
    { value: 'update_order', label: 'Mengubah Pesanan' },
    { value: 'update_status', label: 'Mengubah Status' },
    { value: 'payment', label: 'Pembayaran' },
    { value: 'create_user', label: 'Membuat User' },
    { value: 'update_user', label: 'Mengubah User' },
    { value: 'create_product', label: 'Membuat Produk' },
    { value: 'update_product', label: 'Mengubah Produk' },
    { value: 'login', label: 'Login' },
    { value: 'logout', label: 'Logout' },
    { value: 'export', label: 'Export Data' },
    { value: 'import', label: 'Import Data' },
    { value: 'print', label: 'Print' },
    { value: 'download', label: 'Download' },
    { value: 'upload', label: 'Upload' }
  ];
  
  const userOptions = [
    { value: 'all', label: 'Semua User' },
    ...users.map(user => ({
      value: user._id,
      label: user.name
    }))
  ];
  
  const moduleOptions = [
    { value: 'all', label: 'Semua Modul' },
    ...modules.map(module => ({
      value: module,
      label: module
    }))
  ];
  
  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-semibold mb-4 md:mb-0">Log Aktivitas</h1>
        
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto">
          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            {isFilterExpanded ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
          </button>
          
          <button
            onClick={handleExport}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export
          </button>
        </div>
      </div>
      
      {isFilterExpanded && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <SelectField
                  label="Filter Aksi"
                  name="actionFilter"
                  value={actionFilter}
                  onChange={handleActionFilterChange}
                  options={actionOptions}
                />
              </div>
              <div>
                <SelectField
                  label="Filter User"
                  name="userFilter"
                  value={userFilter}
                  onChange={handleUserFilterChange}
                  options={userOptions}
                />
              </div>
              <div>
                <SelectField
                  label="Filter Modul"
                  name="moduleFilter"
                  value={moduleFilter}
                  onChange={handleModuleFilterChange}
                  options={moduleOptions}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  name="start"
                  value={dateRange.start}
                  onChange={handleDateRangeChange}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
                <input
                  type="date"
                  name="end"
                  value={dateRange.end}
                  onChange={handleDateRangeChange}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cari</label>
                <input
                  type="text"
                  placeholder="Cari berdasarkan deskripsi atau detail"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="flex-1 h-10 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  Cari
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 h-10 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Reset
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <Table
          columns={columns}
          data={logs}
          loading={loading}
          totalItems={logs.length}
          itemsPerPage={15}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          pagination={false}
          emptyMessage="Tidak ada log aktivitas yang ditemukan"
          striped={true}
          hoverEffect={true}
          dense={false}
        />
        
        <div className="p-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPageNumbers={true}
            maxPageLinks={5}
            size="md"
            variant="rounded"
          />
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;