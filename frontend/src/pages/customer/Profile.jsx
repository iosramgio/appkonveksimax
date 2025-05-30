import React, { useState, useEffect } from 'react';
import InputField from '../../components/forms/InputField';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    totalOrders: 0,
    activeOrders: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const api = useApi();
  const { showNotification } = useNotification();
  
  useEffect(() => {
    const fetchUserStats = async () => {
      setStatsLoading(true);
      try {
        // Fetch data dari dashboard customer untuk mendapatkan statistik pesanan
        const response = await api.get('/dashboard/customer');
        setUserStats({
          totalOrders: response.data.stats.totalOrders || 0,
          activeOrders: response.data.stats.activeOrders || 0
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
        showNotification('Gagal memuat statistik pengguna', 'error');
      } finally {
        setStatsLoading(false);
      }
    };
    
    fetchUserStats();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      showNotification('Konfirmasi password tidak sesuai', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare data for update
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      };
      
      // Add password info if changing password
      if (formData.currentPassword && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }
      
      // Call API to update profile
      await updateProfile(updateData);
      
      // Reset password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      
      showNotification('Profil berhasil diperbarui', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification(
        error.response?.data?.message || 'Gagal memperbarui profil',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Profil Saya</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Informasi Personal</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Nama Lengkap"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  
                  <InputField
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Nomor Telepon"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <hr className="my-6" />
                
                <h3 className="font-medium">Ubah Password</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Kosongkan form ini jika tidak ingin mengubah password
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Password Saat Ini"
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Password Baru"
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                  
                  <InputField
                    label="Konfirmasi Password Baru"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    label="Simpan Perubahan"
                    loading={loading}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Ringkasan Akun</h2>
            </div>
            
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xl">
                  {user?.name.charAt(0).toUpperCase() || 'C'}
                </div>
                <div className="ml-4">
                  <h3 className="font-medium">{user?.name}</h3>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Membership</span>
                  <span className="font-medium">Customer</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Pesanan</span>
                  {statsLoading ? (
                    <span className="font-medium">
                      <div className="w-6 h-4 bg-gray-200 animate-pulse rounded"></div>
                    </span>
                  ) : (
                    <span className="font-medium">{userStats.totalOrders}</span>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Pesanan Aktif</span>
                  {statsLoading ? (
                    <span className="font-medium">
                      <div className="w-6 h-4 bg-gray-200 animate-pulse rounded"></div>
                    </span>
                  ) : (
                    <span className="font-medium">{userStats.activeOrders}</span>
                  )}
                </div>
                
                <hr className="my-4" />
                
                <div className="mt-4">
                  <Link 
                    to="/customer/orders" 
                    className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Lihat Semua Pesanan
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;