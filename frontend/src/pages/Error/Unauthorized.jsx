import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
          Akses Ditolak
        </h2>
        <p className="text-gray-600 mb-8">
          Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
        
        <div className="flex flex-col space-y-4">
          <Link to="/">
            <Button
              label="Kembali ke Beranda"
              fullWidth={true}
            />
          </Link>
          
          <Link to="/login">
            <Button
              label="Login dengan Akun Lain"
              variant="outline"
              fullWidth={true}
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;