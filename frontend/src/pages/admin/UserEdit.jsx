import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import Button from '../../components/common/Button';
import UserForm from '../../components/users/UserForm';

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const { showNotification } = useNotification();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/users/${id}`);
        // Transform the data to match the form structure
        const userData = {
          name: response.data.user.name || '',
          email: response.data.user.email || '',
          phone: response.data.user.phone || '',
          role: response.data.user.role || '',
          address: response.data.user.address || '',
          isActive: response.data.user.isActive !== undefined ? response.data.user.isActive : true,
        };
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
        showNotification('Gagal memuat data user', 'error');
        navigate('/admin/users');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      // Transform the data before sending to the server
      const updateData = {
        ...formData,
        isActive: formData.isActive
      };
      
      await api.patch(`/users/${id}`, updateData);
      showNotification('User berhasil diperbarui', 'success');
      navigate('/admin/users');
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification(error.response?.data?.message || 'Gagal memperbarui user', 'error');
      throw error; // Re-throw to let the form handle the error
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit User</h1>
        <Button
          label="Kembali"
          variant="outline"
          onClick={() => navigate('/admin/users')}
        />
      </div>

      {user && (
        <UserForm
          initialData={user}
          onSubmit={handleSubmit}
          submitLabel="Simpan Perubahan"
          isEditing={true}
        />
      )}
    </div>
  );
};

export default UserEdit; 