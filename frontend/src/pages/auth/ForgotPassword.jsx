import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import InputField from '../../components/forms/InputField';
import Button from '../../components/common/Button';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  
  const api = useApi();
  const { showNotification } = useNotification();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      showNotification('Email wajib diisi', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      showNotification('Tautan reset password telah dikirim ke email Anda', 'success');
    } catch (error) {
      console.error('Forgot password error:', error);
      showNotification(
        error.response?.data?.message || 'Gagal mengirim tautan reset password. Silakan coba lagi.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Lupa Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Masukkan email Anda untuk menerima tautan reset password
          </p>
        </div>
        
        {sent ? (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Tautan reset password telah dikirim ke email Anda. Silakan periksa kotak masuk Anda.
                </p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Kembali ke halaman login
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="mb-4">
                <InputField
                  label="Email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email"
                  required
                />
              </div>
            </div>
            
            <div>
              <Button
                type="submit"
                label="Kirim Tautan Reset Password"
                isLoading={loading}
                fullWidth={true}
              />
            </div>
            
            <div className="text-center">
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Kembali ke halaman login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;