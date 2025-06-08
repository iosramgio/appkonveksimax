import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductForm from '../../components/products/ProductForm';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import Button from '../../components/common/Button';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const { showNotification } = useNotification();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.product);
      } catch (error) {
        console.error('Error fetching product:', error);
        showNotification('Gagal memuat data produk', 'error');
        navigate('/admin/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      console.log('Submitting form data:', formData);
      
      // Create FormData object for file uploads
      const submitData = new FormData();

      // Append all product data
      Object.keys(formData).forEach(key => {
        if (key === 'images') {
          // Handle images separately
          const existingImages = formData.images.filter(image => !(image instanceof File));
          const newImages = formData.images.filter(image => image instanceof File);
          
          // Append existing images as JSON string
          if (existingImages.length > 0) {
            submitData.append('existingImages', JSON.stringify(existingImages));
          }
          
          // Append new images as files
          newImages.forEach(image => {
            submitData.append('images', image);
          });
        } else if (Array.isArray(formData[key])) {
          // Convert arrays to JSON strings
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (typeof formData[key] === 'boolean') {
          // Convert boolean to string
          submitData.append(key, formData[key].toString());
        } else if (formData[key] !== undefined && formData[key] !== null) {
          // Only append if value is not undefined or null
          submitData.append(key, formData[key]);
        }
      });

      console.log('FormData contents:');
      for (let pair of submitData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // Send update request
      const response = await api.put(`/products/${id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data) {
        showNotification('Produk berhasil diperbarui', 'success');
        navigate('/admin/products');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal memperbarui produk';
      showNotification(errorMessage, 'error');
      
      // Log detailed error information
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Produk tidak ditemukan</p>
          <Button
            label="Kembali ke Daftar Produk"
            variant="secondary"
            onClick={() => navigate('/admin/products')}
            className="mt-4"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Produk</h1>
        <p className="mt-1 text-sm text-gray-500">
          Edit informasi produk dan simpan perubahan
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <ProductForm
          product={product}
          onSubmit={handleSubmit}
          isEditing={true}
        />
      </div>
    </div>
  );
};

export default EditProduct; 