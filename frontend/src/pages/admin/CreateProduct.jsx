import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../../components/products/ProductForm.jsx';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth';
import { PRODUCTS } from '../../constants/api';

const CreateProduct = () => {
  const navigate = useNavigate();
  const api = useApi();
  const { showNotification } = useNotification();
  const { user, isAuthenticated } = useAuth();

  // Check if user is admin
  React.useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      showNotification('Anda harus login sebagai admin untuk menambah produk', 'error');
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate, showNotification]);

  const handleSubmit = async (productData) => {
    try {
      console.log('Submitting product data:', productData);

      // Create FormData object for file uploads
      const formData = new FormData();

      // Append all product data
      Object.keys(productData).forEach(key => {
        if (key === 'images') {
          // Handle images separately
          productData.images.forEach(image => {
            if (image instanceof File) {
              formData.append('images', image);
            } else if (image.url) {
              formData.append('existingImages', JSON.stringify({
                url: image.url,
                public_id: image.public_id
              }));
            }
          });
        } else if (Array.isArray(productData[key])) {
          // Convert arrays to JSON strings
          formData.append(key, JSON.stringify(productData[key]));
        } else {
          formData.append(key, productData[key]);
        }
      });

      // Send create request
      const response = await api.post(PRODUCTS, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Server response:', response);

      if (response.data) {
        showNotification('Produk berhasil ditambahkan', 'success');
        // Navigate to admin products page
        navigate('/admin/products');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      const errorMessage = error.response?.data?.message || 'Gagal menambahkan produk';
      showNotification(errorMessage, 'error');
      throw error; // Re-throw the error to be handled by the form
    }
  };

  // Don't render the form if user is not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Tambah Produk Baru</h1>
      </div>
      
      <ProductForm onSubmit={handleSubmit} />
    </div>
  );
};

export default CreateProduct; 