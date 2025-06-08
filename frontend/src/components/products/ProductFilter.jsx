import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatter';
import InputField from '../forms/InputField';
import SelectField from '../forms/SelectField';

const ProductFilter = ({ onFilter, categories, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    featured: false
  });

  // Initialize filters based on props
  useEffect(() => {
    setFilters({
      search: initialFilters.search || '',
      category: initialFilters.category || '',
      minPrice: initialFilters.minPrice || '',
      maxPrice: initialFilters.maxPrice || '',
      inStock: initialFilters.inStock === 'true' || false,
      featured: initialFilters.featured === 'true' || false
    });
  }, [initialFilters]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create a copy of filters and format values properly
    const cleanedFilters = {};
    Object.entries(filters).forEach(([key, value]) => {
      // Only include non-empty values
      if (value === '' || value === false) return;
      
      // Convert boolean values to strings for URL parameters
      if (typeof value === 'boolean') {
        cleanedFilters[key] = String(value);
      } else {
        cleanedFilters[key] = value;
      }
    });
    
    onFilter(cleanedFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      featured: false
    };
    setFilters(resetFilters);
    onFilter({});
  };

  // Immediately submit when a checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    const updatedFilters = {
      ...filters,
      [name]: checked
    };
    setFilters(updatedFilters);
    
    // Create cleaned filters for submission
    const cleanedFilters = {};
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value === '' || value === false) return;
      cleanedFilters[key] = typeof value === 'boolean' ? String(value) : value;
    });
    
    onFilter(cleanedFilters);
  };

  // Active filter count
  const activeFilterCount = Object.values(filters).filter(value => 
    value !== '' && value !== false
  ).length;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-[#620000] to-[#7A0000] px-5 py-4 flex justify-between items-center">
        <h3 className="font-medium text-lg text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
          Filter Produk
        </h3>
        {activeFilterCount > 0 && (
          <span className="bg-white text-[#620000] text-xs font-semibold px-2.5 py-1.5 rounded-full">
            {activeFilterCount}
          </span>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="p-5">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Cari Produk</label>
            <div className="relative">
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleChange}
                placeholder="Nama produk..."
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#620000] focus:border-[#620000] bg-gray-50 text-gray-700"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 -mx-5 px-5 py-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#620000] focus:border-[#620000] bg-white text-gray-700"
            >
              <option value="">Semua Kategori</option>
              {(categories || []).map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-[#620000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Rentang Harga
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="sr-only">Harga Minimum</label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleChange}
                  placeholder="Min"
                  min="0"
                  className="w-full rounded-lg border border-gray-200 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#620000] focus:border-[#620000] bg-gray-50 text-gray-700"
                />
              </div>
              <div>
                <label className="sr-only">Harga Maksimum</label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleChange}
                  placeholder="Max"
                  min="0"
                  className="w-full rounded-lg border border-gray-200 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#620000] focus:border-[#620000] bg-gray-50 text-gray-700"
                />
              </div>
            </div>
            
            {filters.minPrice && filters.maxPrice && (
              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <span className="block w-3 h-0.5 bg-[#620000]/40 mr-1.5"></span>
                Harga: {formatCurrency(filters.minPrice)} - {formatCurrency(filters.maxPrice)}
              </p>
            )}
          </div>
          
          <div className="bg-gray-50 -mx-5 px-5 py-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-[#620000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Status
            </h4>
            <div className="space-y-2.5">
              <label className="flex items-center p-2 hover:bg-white rounded-lg transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  name="inStock"
                  checked={filters.inStock}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-[#620000] focus:ring-[#620000] border-gray-300 rounded"
                />
                <span className="ml-2.5 text-sm text-gray-700">Tersedia</span>
              </label>
              <label className="flex items-center p-2 hover:bg-white rounded-lg transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={filters.featured}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-[#620000] focus:ring-[#620000] border-gray-300 rounded"
                />
                <span className="ml-2.5 text-sm text-gray-700">Produk Unggulan</span>
              </label>
            </div>
          </div>
          
          {/* Active filters display */}
          {activeFilterCount > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-[#620000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Filter Aktif
                </h4>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-medium text-[#620000] hover:text-[#7A0000] flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Reset Semua
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-lg flex items-center">
                    <span className="mr-1.5">Cari:</span>
                    <span className="font-medium">{filters.search}</span>
                  </span>
                )}
                {filters.category && categories.length > 0 && (
                  <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-lg flex items-center">
                    <span className="mr-1.5">Kategori:</span>
                    <span className="font-medium">{categories.find(c => c._id === filters.category)?.name || 'Selected'}</span>
                  </span>
                )}
                {filters.minPrice && (
                  <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-lg flex items-center">
                    <span className="mr-1.5">Min:</span>
                    <span className="font-medium">{formatCurrency(filters.minPrice)}</span>
                  </span>
                )}
                {filters.maxPrice && (
                  <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-lg flex items-center">
                    <span className="mr-1.5">Max:</span>
                    <span className="font-medium">{formatCurrency(filters.maxPrice)}</span>
                  </span>
                )}
                {filters.inStock && (
                  <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-lg flex items-center">
                    <span className="font-medium">Tersedia</span>
                  </span>
                )}
                {filters.featured && (
                  <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-lg flex items-center">
                    <span className="font-medium">Unggulan</span>
                  </span>
                )}
              </div>
            </div>
          )}
          
          <div>
            <button
              type="submit"
              className="w-full bg-[#620000] text-white py-2.5 px-4 rounded-lg hover:bg-[#7A0000] transition-colors font-medium flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Terapkan Filter
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductFilter;