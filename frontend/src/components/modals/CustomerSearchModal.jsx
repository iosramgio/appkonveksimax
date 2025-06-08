import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import InputField from '../forms/InputField';
import Button from '../common/Button';

const CustomerSearchModal = ({ isOpen, onClose, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const api = useApi();
  
  useEffect(() => {
    if (isOpen && searchQuery.length >= 3) {
      searchCustomers();
    }
  }, [searchQuery, isOpen]);
  
  const searchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/customers/search?q=${encodeURIComponent(searchQuery)}`);
      setCustomers(response.data);
    } catch (error) {
      console.error('Error searching customers:', error);
      setError('Gagal mencari data pelanggan');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Cari Pelanggan</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-6">
          <InputField
            label="Cari berdasarkan nama atau nomor telepon"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Minimal 3 karakter..."
          />
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Mencari pelanggan...</p>
            </div>
          ) : customers.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {customers.map((customer) => (
                <div
                  key={customer._id}
                  className="py-3 px-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                  onClick={() => onSelect(customer)}
                >
                  <div>
                    <h3 className="font-medium">{customer.name}</h3>
                    <p className="text-sm text-gray-600">
                      {customer.phone}
                      {customer.email && ` • ${customer.email}`}
                    </p>
                    {customer.address && (
                      <p className="text-sm text-gray-500 mt-1">
                        {customer.address}
                      </p>
                    )}
                  </div>
                  <Button
                    label="Pilih"
                    variant="secondary"
                    size="sm"
                  />
                </div>
              ))}
            </div>
          ) : searchQuery.length >= 3 ? (
            <div className="text-center py-4 text-gray-600">
              Tidak ada pelanggan yang ditemukan
            </div>
          ) : (
            <div className="text-center py-4 text-gray-600">
              Masukkan minimal 3 karakter untuk mencari
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button
            label="Tutup"
            variant="secondary"
            onClick={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerSearchModal; 