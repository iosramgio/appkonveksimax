import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-9xl font-extrabold text-[#620000] tracking-tight">
            404
          </h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Halaman Tidak Ditemukan
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Maaf, halaman yang Anda cari tidak dapat ditemukan.
          </p>
        </div>
        <div className="mt-8">
          <a 
            href="/"
            className="inline-block bg-[#620000] text-white px-6 py-2 rounded-md hover:bg-[#7A0000] transition-colors"
          >
            Kembali ke Beranda
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;