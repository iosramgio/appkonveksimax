import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserList from '../../components/users/UserList';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToUpdateStatus, setUserToUpdateStatus] = useState(null);
  const [newStatus, setNewStatus] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const api = useApi();
  const { showNotification } = useNotification();
  
  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get(`/users?page=${page}&limit=10`);
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.pages);
      setCurrentPage(response.data.pagination.page);
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('Gagal memuat daftar user', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, [refreshKey]);
  
  const handlePageChange = (page) => {
    fetchUsers(page);
  };
  
  const handleDeleteClick = (userId) => {
    const user = users.find(u => u._id === userId);
    setUserToDelete(user);
    setShowDeleteModal(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      await api.delete(`/users/${userToDelete._id}`);
      showNotification(`User ${userToDelete.name} berhasil dihapus`, 'success');
      
      // Refresh user list
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('Gagal menghapus user', 'error');
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };
  
  const handleStatusChange = (userId, newActiveStatus) => {
    const user = users.find(u => u._id === userId);
    if (!user) return;
    
    setUserToUpdateStatus(user);
    setNewStatus(newActiveStatus);
    setShowStatusModal(true);
  };
  
  const handleStatusConfirm = async () => {
    if (!userToUpdateStatus) return;
    
    try {
      await api.patch(`/users/${userToUpdateStatus._id}/status`, {
        isActive: newStatus
      });
      
      const statusText = newStatus ? 'aktif' : 'nonaktif';
      showNotification(`Status user ${userToUpdateStatus.name} diubah menjadi ${statusText}`, 'success');
      
      // Refresh user list
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error updating user status:', error);
      showNotification('Gagal mengubah status user', 'error');
    } finally {
      setShowStatusModal(false);
      setUserToUpdateStatus(null);
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Kelola data pengguna sistem dan atur hak akses mereka
                </p>
              </div>
              <Button
                label="Tambah User"
                onClick={() => navigate('/admin/users/create')}
                variant="primary"
                size="medium"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                }
                className="shadow-sm"
              />
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <UserList 
              users={users}
              loading={loading}
              onDelete={handleDeleteClick}
              onPageChange={handlePageChange}
              totalPages={totalPages}
              currentPage={currentPage}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Users
                    </dt>
                    <dd>
                      <div className="text-lg font-bold text-gray-900">
                        {loading ? '...' : users.length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      User Aktif
                    </dt>
                    <dd>
                      <div className="text-lg font-bold text-gray-900">
                        {loading ? '...' : users.filter(user => user.isActive).length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      User Nonaktif
                    </dt>
                    <dd>
                      <div className="text-lg font-bold text-gray-900">
                        {loading ? '...' : users.filter(user => !user.isActive).length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      User Baru (30d)
                    </dt>
                    <dd>
                      <div className="text-lg font-bold text-gray-900">
                        {loading ? '...' : users.filter(user => {
                          const thirtyDaysAgo = new Date();
                          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                          return new Date(user.createdAt) >= thirtyDaysAgo;
                        }).length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Konfirmasi Hapus User"
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-center bg-red-50 rounded-full w-12 h-12 mx-auto mb-4">
            <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Hapus User</h3>
            <p className="mt-2 text-sm text-gray-500">
              Apakah Anda yakin ingin menghapus user <span className="font-semibold text-gray-700">{userToDelete?.name}</span>?
              <br />Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button
              label="Batal"
              variant="light"
              onClick={() => setShowDeleteModal(false)}
              className="w-full sm:w-auto"
            />
            <Button
              label="Hapus"
              variant="danger"
              onClick={handleDeleteConfirm}
              className="w-full sm:w-auto"
            />
          </div>
        </div>
      </Modal>

      {/* Status Change Confirmation Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Konfirmasi Ubah Status User"
        size="md"
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-center rounded-full w-12 h-12 mx-auto mb-4" 
            style={{ backgroundColor: newStatus ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
            {newStatus ? (
              <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {newStatus ? 'Aktifkan User' : 'Nonaktifkan User'}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Apakah Anda yakin ingin {newStatus ? 'mengaktifkan' : 'menonaktifkan'} user <span className="font-semibold text-gray-700">{userToUpdateStatus?.name}</span>?
              <br />
              {newStatus 
                ? 'User akan bisa login kembali ke sistem dan mengakses fitur sesuai role-nya.' 
                : 'User tidak akan bisa login ke sistem sampai diaktifkan kembali.'}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button
              label="Batal"
              variant="light"
              onClick={() => setShowStatusModal(false)}
              className="w-full sm:w-auto"
            />
            <Button
              label="Konfirmasi"
              variant={newStatus ? "success" : "danger"}
              onClick={handleStatusConfirm}
              className="w-full sm:w-auto"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;