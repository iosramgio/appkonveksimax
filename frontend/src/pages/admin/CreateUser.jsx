import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserForm from '../../components/users/UserForm';
import { useApi } from '../../hooks/useApi';
import { toast } from 'react-toastify';

const CreateUser = () => {
  const navigate = useNavigate();
  const api = useApi();

  const handleSubmit = async (userData) => {
    try {
      const response = await api.post('/users/create', userData);
      
      if (response.data) {
        toast.success('User berhasil ditambahkan');
        navigate('/admin/users');
      } else {
        toast.error(response.message || 'Gagal menambahkan user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat menambahkan user';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tambah User Baru</h1>
          <p className="mt-2 text-sm text-gray-600">
            Isi form di bawah ini untuk menambahkan user baru ke dalam sistem
          </p>
        </div>
        
        <UserForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default CreateUser; 