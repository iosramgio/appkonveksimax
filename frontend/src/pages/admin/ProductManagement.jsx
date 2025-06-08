import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { formatCurrency, formatDate } from '../../utils/formatter';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('');
  const [categories, setCategories] = useState([]);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const api = useApi();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  
  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      let url = `/products?page=${page}&limit=10`;
      
      // Add search and filters to URL if they exist
      if (searchTerm) url += `&search=${searchTerm}`;
      if (filterCategory) url += `&category=${filterCategory}`;
      if (filterAvailability) url += `&availability=${filterAvailability}`;
      if (sortField) url += `&sortField=${sortField}&sortOrder=${sortDirection}`;
      
      const response = await api.get(url);
      setProducts(response.data.products);
      setTotalPages(response.data.pagination.pages);
      setCurrentPage(response.data.pagination.page);
    } catch (error) {
      console.error('Error fetching products:', error);
      showNotification('Gagal memuat daftar produk', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories');
      if (response.data && response.data.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);
  
  // Add listener for navigation events
  useEffect(() => {
    const handleFocus = () => {
      fetchProducts(currentPage);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [currentPage]);
  
  useEffect(() => {
    // When search or filters change, reset to page 1
    fetchProducts(1);
  }, [searchTerm, filterCategory, filterAvailability, sortField, sortDirection]);
  
  const handlePageChange = (page) => {
    fetchProducts(page);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(1);
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterAvailability('');
    fetchProducts(1);
  };
  
  const handleSortChange = (field, direction) => {
    setSortField(field);
    setSortDirection(direction);
  };
  
  const handleDeleteClick = (productId) => {
    const product = products.find(p => p._id === productId);
    setProductToDelete(product);
    setShowDeleteModal(true);
  };
  
  const handleViewDetails = (productId) => {
    navigate(`/admin/products/${productId}`);
  };
  
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    try {
      await api.delete(`/products/${productToDelete._id}`);
      showNotification(`Produk ${productToDelete.name} berhasil dihapus`, 'success');
      
      // Refresh product list
      fetchProducts(currentPage);
    } catch (error) {
      console.error('Error deleting product:', error);
      showNotification('Gagal menghapus produk', 'error');
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };
  
  const toggleProductAvailability = async (productId, currentStatus) => {
    try {
      await api.put(`/products/${productId}/availability`, {
        availability: !currentStatus
      });
      
      // Update local state
      setProducts(products.map(product => {
        if (product._id === productId) {
          return { ...product, availability: !currentStatus };
        }
        return product;
      }));
      
      showNotification('Status produk berhasil diubah', 'success');
    } catch (error) {
      console.error('Error toggling product availability:', error);
      showNotification('Gagal mengubah status produk', 'error');
    }
  };
  
  const columns = [
    {
      header: 'Produk',
      accessor: 'name',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center">
          {row.images && row.images[0] ? (
            <img 
              src={row.images[0].url} 
              alt={row.name} 
              className="w-16 h-16 object-cover rounded-md mr-3"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-md mr-3 flex items-center justify-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div>
            <Link to={`/admin/products/${row._id}`} className="font-medium text-blue-600 hover:text-blue-800 hover:underline">
              {row.name}
            </Link>
            <div className="text-sm text-gray-500">
              SKU: {row.sku || '-'}
            </div>
            {row.stock !== undefined && (
              <div className={`text-sm ${parseInt(row.stock) < 10 ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                Stok: {row.stock}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Harga',
      accessor: 'basePrice',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-medium">{formatCurrency(row.basePrice)}</div>
          {row.dozenPrice && (
            <div className="text-sm text-gray-500">
              Per Lusin: {formatCurrency(row.dozenPrice)}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Kategori',
      accessor: 'category',
      sortable: true,
      cell: (row) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
          {row.category || '-'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'availability',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
          row.availability 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.availability ? 'Tersedia' : 'Tidak Tersedia'}
        </span>
          <button
            onClick={() => toggleProductAvailability(row._id, row.availability)}
            className={`p-1 rounded-full ${
              row.availability 
                ? 'text-green-600 hover:bg-green-50' 
                : 'text-red-600 hover:bg-red-50'
            }`}
            title={row.availability ? 'Nonaktifkan produk' : 'Aktifkan produk'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
        </div>
      )
    },
    {
      header: 'Tanggal Dibuat',
      accessor: 'createdAt',
      sortable: true,
      cell: (row) => (
        <div className="text-sm">
          {formatDate(row.createdAt)}
        </div>
      )
    },
    {
      header: 'Aksi',
      accessor: '_id',
      sortable: false,
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewDetails(row._id)}
            className="p-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
            title="Lihat Detail"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </button>
          <Link
            to={`/admin/products/edit/${row._id}`}
            className="p-1.5 bg-yellow-50 text-yellow-600 rounded-full hover:bg-yellow-100"
            title="Edit Produk"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </Link>
          <button
            onClick={() => handleDeleteClick(row._id)}
            className="p-1.5 bg-red-50 text-red-600 rounded-full hover:bg-red-100"
            title="Hapus Produk"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )
    }
  ];
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-semibold text-gray-800">Manajemen Produk</h1>
        <Link to="/admin/products/create">
          <Button 
            label="Tambah Produk" 
              variant="primary"
              size="medium"
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            }
          />
        </Link>
      </div>
      
        {/* Search and Filter bar */}
        <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Cari Produk</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="search"
                    name="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari berdasarkan nama produk, SKU..."
                    className="pl-10 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  id="category"
                  name="category"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="">Semua Kategori</option>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <option key={category._id} value={category.name}>
                        {category.name} ({category.productCount})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Loading kategori...</option>
                  )}
                </select>
              </div>
              
              <div>
                <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="availability"
                  name="availability"
                  value={filterAvailability}
                  onChange={(e) => setFilterAvailability(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="">Semua Status</option>
                  <option value="true">Tersedia</option>
                  <option value="false">Tidak Tersedia</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                label="Reset"
                variant="outline" 
                onClick={handleClearFilters}
                disabled={loading}
              />
              <Button
                type="submit"
                label="Cari"
                variant="primary"
                isLoading={loading}
                disabled={loading}
                icon={!loading && (
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                )}
              />
            </div>
          </form>
        </div>
        
        {/* Product stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Produk</p>
                <p className="text-2xl font-semibold">{loading ? '...' : products.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Produk Tersedia</p>
                <p className="text-2xl font-semibold">{loading ? '...' : products.filter(p => p.availability).length}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Produk Tidak Tersedia</p>
                <p className="text-2xl font-semibold">{loading ? '...' : products.filter(p => !p.availability).length}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Kategori</p>
                <p className="text-2xl font-semibold">{loading ? '...' : categories.length}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
        <Table
          columns={columns}
          data={products}
          loading={loading}
              emptyMessage="Tidak ada produk ditemukan"
              striped={true}
              hoverEffect={true}
              dense={false}
              onSortChange={handleSortChange}
        />
          </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
                size="md"
                variant="rounded"
                maxPageLinks={5}
            />
          </div>
        )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Konfirmasi Hapus Produk"
        size="sm"
      >
        <div className="p-6">
          {productToDelete && (
            <div className="flex items-center mb-4">
              {productToDelete.images && productToDelete.images[0] ? (
                <img 
                  src={productToDelete.images[0].url} 
                  alt={productToDelete.name} 
                  className="w-16 h-16 object-cover rounded-md mr-3"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-md mr-3 flex items-center justify-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div>
                <h3 className="font-medium">{productToDelete.name}</h3>
                <p className="text-sm text-gray-500">SKU: {productToDelete.sku || '-'}</p>
              </div>
            </div>
          )}
          
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Tindakan ini tidak dapat dibatalkan. Produk ini akan dihapus permanen dari sistem.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button
              label="Batal"
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            />
            <Button
              label="Hapus Produk"
              variant="danger"
              onClick={handleDeleteConfirm}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductManagement;