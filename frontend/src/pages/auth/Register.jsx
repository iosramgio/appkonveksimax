import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import RegisterForm from '../../components/auth/RegisterForm';
import { toast } from 'react-toastify';

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true);
      const result = await register(values);
      
      if (result.success) {
        toast.success('Registrasi berhasil! Silakan login.');
        navigate('/login');
      } else {
        toast.error(result.message || 'Registrasi gagal');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Terjadi kesalahan saat registrasi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-50 to-rose-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Logo Side - Left */}
        <div className="bg-gradient-to-b from-[#620000] to-[#8B0000] md:w-5/12 p-8 flex flex-col items-center justify-center text-white">
          <div className="mb-8">
            <div className="h-24 w-24 mx-auto rounded-full bg-white flex items-center justify-center">
              <svg className="h-16 w-16 text-[#620000]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Konveksi App</h1>
          <p className="text-center text-red-100 mb-8">Solusi terbaik untuk bisnis konveksi Anda</p>
          <div className="mt-4 p-6 bg-red-900/20 rounded-lg">
            <p className="text-sm italic text-red-100">"Sistem manajemen konveksi yang memudahkan semua proses bisnis Anda dari pesanan hingga pengiriman."</p>
          </div>
        </div>
        
        {/* Registration Form - Right */}
        <div className="md:w-7/12 p-8 md:p-10">
          <div className="max-w-md mx-auto">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                Daftar Akun Baru
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Isi formulir di bawah untuk membuat akun baru
              </p>
            </div>
            
            <RegisterForm onSubmit={handleSubmit} isLoading={isLoading} />
            
            <div className="text-center md:text-left mt-6">
              <p className="text-sm text-gray-600">
                Sudah punya akun?{' '}
                <Link to="/login" className="font-medium text-[#620000] hover:text-[#8B0000] transition-colors">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 