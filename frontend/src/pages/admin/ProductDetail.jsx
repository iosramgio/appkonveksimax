import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import { formatCurrency, formatDate } from '../../utils/formatter';
import Button from '../../components/common/Button';

const ProductDetail = () => {
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
        showNotification('Gagal memuat detail produk', 'error');
        navigate('/admin/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, api, showNotification, navigate]);

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
        <div className="text-center text-red-500">
          Produk tidak ditemukan
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Detail Produk</h1>
        <div className="flex gap-3">
          <Button
            label="Kembali"
            variant="outline"
            onClick={() => navigate('/admin/products')}
          />
          <Button
            label="Edit Produk"
            onClick={() => navigate(`/admin/products/edit/${id}`)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Images */}
          <div>
            <h2 className="text-lg font-medium mb-4">Gambar Produk</h2>
            <div className="grid grid-cols-2 gap-4">
              {product.images && product.images.length > 0 ? (
                product.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={`${product.name} - ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))
              ) : (
                <div className="col-span-2 text-center text-gray-500">
                  Tidak ada gambar
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h2 className="text-lg font-medium mb-4">Informasi Produk</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Produk</label>
                <div className="mt-1 text-gray-900">{product.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">SKU</label>
                <div className="mt-1 text-gray-900">{product.sku}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Kategori</label>
                <div className="mt-1 text-gray-900">{product.category || '-'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Harga Dasar</label>
                <div className="mt-1 text-gray-900">{formatCurrency(product.basePrice)}</div>
              </div>
              {product.dozenPrice && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Harga Per Lusin</label>
                  <div className="mt-1 text-gray-900">{formatCurrency(product.dozenPrice)}</div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    product.availability 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.availability ? 'Tersedia' : 'Tidak Tersedia'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal Dibuat</label>
                <div className="mt-1 text-gray-900">{formatDate(product.createdAt)}</div>
              </div>
              {product.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                  <div className="mt-1 text-gray-900 whitespace-pre-wrap">{product.description}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Product Details */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sizes */}
          <div>
            <h3 className="text-lg font-medium mb-4">Ukuran</h3>
            <div className="space-y-2">
              {product.sizes && product.sizes.length > 0 ? (
                product.sizes.map((size, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-900">{size.size}</span>
                    <span className="text-gray-600">
                      {size.additionalPrice > 0 ? `+${formatCurrency(size.additionalPrice)}` : '-'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">Tidak ada ukuran</div>
              )}
            </div>
          </div>

          {/* Colors */}
          <div>
            <h3 className="text-lg font-medium mb-4">Warna</h3>
            <div className="space-y-2">
              {product.colors && product.colors.length > 0 ? (
                product.colors.map((color, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.code }}
                    />
                    <span className="text-gray-900">{color.name}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">Tidak ada warna</div>
              )}
            </div>
          </div>

          {/* Materials */}
          <div>
            <h3 className="text-lg font-medium mb-4">Bahan</h3>
            <div className="space-y-2">
              {product.materials && product.materials.length > 0 ? (
                product.materials.map((material, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-900">{material.name}</span>
                    <span className="text-gray-600">
                      {material.additionalPrice > 0 ? `+${formatCurrency(material.additionalPrice)}` : '-'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">Tidak ada bahan</div>
              )}
            </div>
          </div>
        </div>

        {/* SKUs and Inventory */}
        {product.skus && product.skus.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">SKU dan Stok</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ukuran</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warna</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bahan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Lusin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {product.skus.map((sku, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sku.sku}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sku.size}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sku.color}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sku.material}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(sku.price)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(sku.dozenPrice)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sku.inventory}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Informasi Tambahan</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Biaya Kustomisasi</label>
                <div className="mt-1 text-gray-900">{formatCurrency(product.customizationFee || 0)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Waktu Produksi</label>
                <div className="mt-1 text-gray-900">{product.productionTime || 7} hari</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Diskon</label>
                <div className="mt-1 text-gray-900">{product.discount || 0}%</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Produk Unggulan</label>
                <div className="mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    product.featured 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.featured ? 'Ya' : 'Tidak'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 