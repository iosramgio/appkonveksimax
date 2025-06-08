import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Table from '../common/Table';
import Pagination from '../common/Pagination';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatter';

const UserList = ({ users, loading, onDelete, onPageChange, totalPages, currentPage, onStatusChange }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };
  
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map(user => user._id));
    } else {
      setSelectedUsers([]);
    }
  };
  
  const filteredUsers = users.filter(user => {
    // Filter by search term (name or email)
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by role
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    // Filter by status
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.isActive) || 
      (filterStatus === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });
  
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'cashier':
        return 'bg-green-100 text-green-800';
      case 'staff':
        return 'bg-blue-100 text-blue-800';
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'customer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };
  
  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'cashier':
        return 'Kasir';
      case 'staff':
        return 'Staf';
      case 'owner':
        return 'Owner';
      case 'customer':
        return 'Customer';
      default:
        return role;
    }
  };
  
  const handleStatusToggle = (userId, currentStatus) => {
    if (onStatusChange) {
      onStatusChange(userId, !currentStatus);
    }
  };
  
  const columns = [
    {
      header: (
        <div className="flex items-center">
          <input
            type="checkbox"
            onChange={handleSelectAll}
            checked={selectedUsers.length === users.length && users.length > 0}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
      ),
      accessor: '_id',
      cell: (row) => (
        <div className="flex items-center">
          <input
            type="checkbox"
            onChange={() => handleSelectUser(row._id)}
            checked={selectedUsers.includes(row._id)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
      ),
      width: '40px',
      hideOnMobile: true
    },
    {
      header: 'Nama',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {row.profileImage ? (
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={row.profileImage}
                alt={`${row.name}'s profile`}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-medium text-base">
                {row.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{row.name}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'No. Telepon',
      accessor: 'phone',
      cell: (row) => (
        <div className="text-sm text-gray-700">
          {row.phone || 
            <span className="text-gray-400 italic">Tidak tersedia</span>
          }
        </div>
      ),
      hideOnMobile: true
    },
    {
      header: 'Role',
      accessor: 'role',
      cell: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(row.role || '')}`}>
          {getRoleLabel(row.role || '')}
        </span>
      )
    },
    {
      header: 'Tanggal Dibuat',
      accessor: 'createdAt',
      cell: (row) => (
        <div className="text-sm text-gray-700">
          {row.createdAt ? formatDate(row.createdAt) : '-'}
        </div>
      ),
      hideOnMobile: true
    },
    {
      header: 'Status',
      accessor: 'isActive',
      cell: (row) => (
        <div className="flex items-center">
          <button
            onClick={() => handleStatusToggle(row._id, row.isActive)}
            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              row.isActive ? 'bg-green-500' : 'bg-gray-200'
            }`}
            role="switch"
            aria-checked={row.isActive}
            type="button"
          >
            <span className="sr-only">Toggle user status</span>
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                row.isActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            ></span>
          </button>
          <span className={`ml-2 text-xs font-medium ${row.isActive ? 'text-green-700' : 'text-gray-500'}`}>
            {row.isActive ? 'Aktif' : 'Nonaktif'}
          </span>
        </div>
      )
    },
    {
      header: 'Aksi',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <Link
            to={`/admin/users/${row._id}`}
            className="text-blue-500 hover:text-blue-700 transition-colors"
            title="Lihat Detail"
          >
            <div className="p-1.5 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </div>
          </Link>
          <Link
            to={`/admin/users/edit/${row._id}`}
            className="text-yellow-500 hover:text-yellow-700 transition-colors"
            title="Edit User"
          >
            <div className="p-1.5 bg-yellow-50 rounded-md hover:bg-yellow-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </div>
          </Link>
          <button
            onClick={() => onDelete(row._id)}
            className="text-red-500 hover:text-red-700 transition-colors"
            title="Hapus User"
          >
            <div className="p-1.5 bg-red-50 rounded-md hover:bg-red-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
        </div>
      )
    }
  ];
  
  return (
    <div>
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          {/* Search Box */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau email..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Role Filter */}
          <div className="w-full md:w-40">
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">Semua Role</option>
              <option value="admin">Admin</option>
              <option value="cashier">Kasir</option>
              <option value="staff">Staf</option>
              <option value="owner">Owner</option>
              <option value="customer">Customer</option>
            </select>
          </div>
          
          {/* Status Filter */}
          <div className="w-full md:w-40">
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">{selectedUsers.length} dipilih</span>
              <Button
                variant="danger"
                size="small"
                label="Hapus"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                }
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={columns}
          data={filteredUsers} 
          loading={loading}
          totalItems={filteredUsers.length}
          itemsPerPage={10}
          currentPage={currentPage}
          onPageChange={onPageChange}
          className="min-w-full divide-y divide-gray-200"
          striped={true}
          hoverEffect={true}
          emptyMessage="Tidak ada data user yang ditemukan"
        />
        
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 sm:px-6">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={onPageChange} 
              variant="rounded"
              maxPageLinks={5}
            />
          </div>
        )}
      </div>
      
      {users.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          Menampilkan {Math.min(filteredUsers.length, 10)} dari {filteredUsers.length} user
        </div>
      )}
    </div>
  );
};

export default UserList;