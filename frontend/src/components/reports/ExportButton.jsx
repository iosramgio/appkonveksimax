import React, { useState } from 'react';
import Button from '../common/Button';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';

const ExportButton = ({ 
  endpoint, 
  filename = 'export', 
  params = {}, 
  label = 'Export Excel',
  variant = 'outline'
}) => {
  const [loading, setLoading] = useState(false);
  const api = useApi();
  const { showNotification } = useNotification();
  
  const handleExport = async () => {
    setLoading(true);
    
    try {
      // Build query string from params
      const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
      
      const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
      
      const response = await api.get(fullEndpoint, { 
        responseType: 'blob' 
      });
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification('File berhasil diunduh', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showNotification('Gagal mengunduh file', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button
      label={label}
      variant={variant}
      onClick={handleExport}
      loading={loading}
      icon={
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      }
    />
  );
};

export default ExportButton;