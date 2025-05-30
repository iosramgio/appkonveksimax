import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import Button from '../../components/common/Button';
import { formatDate } from '../../utils/formatter';
import { USERS } from '../../constants/api';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const { showNotification } = useNotification();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching user with ID:', id);
        const response = await api.get(`${USERS}/${id}`);
        console.log('API Response:', response);
        
        if (response?.data?.user) {
          const processedUser = {
            ...response.data.user,
            name: String(response.data.user.name || ''),
            email: String(response.data.user.email || ''),
            phone: String(response.data.user.phone || ''),
            address: String(response.data.user.address || ''),
            role: String(response.data.user.role || ''),
            isActive: Boolean(response.data.user.isActive),
            createdAt: response.data.user.createdAt,
            updatedAt: response.data.user.updatedAt
          };
          setUser(processedUser);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setError(error.message);
        showNotification(
          error.response?.data?.message || 'Gagal memuat data user',
          'error'
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  const handleDeactivate = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menonaktifkan user ini?')) {
      return;
    }

    try {
      await api.patch(`${USERS}/${id}/deactivate`);
      showNotification('User berhasil dinonaktifkan', 'success');
      navigate('/admin/users');
    } catch (error) {
      console.error('Error deactivating user:', error);
      showNotification(
        error.response?.data?.message || 'Gagal menonaktifkan user',
        'error'
      );
    }
  };

  const handleReactivate = async () => {
    if (!window.confirm('Apakah Anda yakin ingin mengaktifkan kembali user ini?')) {
      return;
    }

    try {
      await api.patch(`${USERS}/${id}/reactivate`);
      showNotification('User berhasil diaktifkan kembali', 'success');
      navigate('/admin/users');
    } catch (error) {
      console.error('Error reactivating user:', error);
      showNotification(
        error.response?.data?.message || 'Gagal mengaktifkan kembali user',
        'error'
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Warning!</strong>
          <span className="block sm:inline"> User tidak ditemukan</span>
        </div>
      </div>
    );
  }

  const getRoleLabel = (role) => {
    const roleLabels = {
      admin: 'Admin',
      cashier: 'Kasir',
      staff: 'Staff',
      owner: 'Owner',
      customer: 'Customer'
    };
    return roleLabels[role] || role;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Detail User</h1>
        <div className="space-x-2">
          <Button
            label="Kembali"
            variant="outline"
            onClick={() => navigate('/admin/users')}
          />
          {user.isActive ? (
            <Button
              label="Nonaktifkan"
              variant="danger"
              onClick={handleDeactivate}
            />
          ) : (
            <Button
              label="Aktifkan"
              variant="success"
              onClick={handleReactivate}
            />
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Informasi Pribadi</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Nama</label>
                <p className="mt-1">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="mt-1">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Nomor Telepon</label>
                <p className="mt-1">{user.phone || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Alamat</label>
                <p className="mt-1">{user.address || '-'}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Informasi Akun</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Role</label>
                <p className="mt-1">{getRoleLabel(user.role)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Status</label>
                <p className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Tanggal Dibuat</label>
                <p className="mt-1">{formatDate(user.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Terakhir Diperbarui</label>
                <p className="mt-1">{formatDate(user.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail; 