import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../../components/products/ProductCard';
import ProductFilter from '../../components/products/ProductFilter';
import Button from '../../components/common/Button';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Products = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  
  const api = useApi();
  const { showNotification } = useNotification();

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
    
    // Parse query parameters from URL
    const queryParams = new URLSearchParams(location.search);
    const categoryParam = queryParams.get('category');
    const searchParam = queryParams.get('search');
    const minPriceParam = queryParams.get('minPrice');
    const maxPriceParam = queryParams.get('maxPrice');
    const inStockParam = queryParams.get('inStock');
    const featuredParam = queryParams.get('featured');
    const sortParam = queryParams.get('sort') || 'newest';
    const pageParam = parseInt(queryParams.get('page')) || 1;
    
    // Update state based on URL parameters
    const initialFilters = {};
    if (categoryParam) initialFilters.category = categoryParam;
    if (searchParam) initialFilters.search = searchParam;
    if (minPriceParam) initialFilters.minPrice = minPriceParam;
    if (maxPriceParam) initialFilters.maxPrice = maxPriceParam;
    if (inStockParam) initialFilters.inStock = inStockParam;
    if (featuredParam) initialFilters.featured = featuredParam;
    
    setFilters(initialFilters);
    setSortOption(sortParam);
    setCurrentPage(pageParam);
  }, [location.search]);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/products', { 
          params: { 
            ...filters, 
            page: currentPage,
            sort: sortOption
          } 
        });
        setProducts(response.data.products);
        setTotalPages(response.data.pagination.pages);
        setTotalProducts(response.data.pagination.total);
      } catch (error) {
        console.error('Error fetching products:', error);
        showNotification('Gagal memuat produk', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchCategories = async () => {
      try {
        const response = await api.get('/products/categories');
        setCategories(response.data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        showNotification('Gagal memuat kategori', 'error');
      }
    };
    
    fetchProducts();
    fetchCategories();
  }, [filters, currentPage, sortOption]);
  
  const handleFilterChange = (newFilters) => {
    // Update URL with new filters
    const queryParams = new URLSearchParams();
    
    // Add all filter parameters to URL
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        queryParams.set(key, value);
      }
    });
    
    // Add sort parameter if not default
    if (sortOption !== 'newest') {
      queryParams.set('sort', sortOption);
    }
    
    // Navigate to filtered URL
    navigate(`/products?${queryParams.toString()}`);
    
    // Update state
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  const handleSortChange = (e) => {
    const newSortOption = e.target.value;
    setSortOption(newSortOption);
    
    // Update URL with new sort option
    const queryParams = new URLSearchParams(location.search);
    if (newSortOption !== 'newest') {
      queryParams.set('sort', newSortOption);
    } else {
      queryParams.delete('sort');
    }
    navigate(`/products?${queryParams.toString()}`);
  };
  
  const handlePageChange = (page) => {
    // Update URL with new page
    const queryParams = new URLSearchParams(location.search);
    if (page > 1) {
      queryParams.set('page', page);
    } else {
      queryParams.delete('page');
    }
    navigate(`/products?${queryParams.toString()}`);
    
    setCurrentPage(page);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Function to render pagination with ellipsis for many pages
  const renderPagination = () => {
    const pages = [];
    
    if (totalPages <= 7) {
      // Less than 7 pages, show all
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // More than 7 pages, show with ellipsis
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show current page and neighbors
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  // Calculate if any filters are applied
  const hasActiveFilters = Object.keys(filters).length > 0;
  
  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Aesthetic Hero Header */}
      <div className="relative bg-gradient-to-r from-[#620000]/95 to-[#7A0000]/95 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10" 
          style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23FFFFFF" fill-opacity="0.3" fill-rule="evenodd"/%3E%3C/svg%3E")',
            backgroundSize: '100px 100px'
          }}
        ></div>

        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full filter blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full filter blur-3xl opacity-50 transform -translate-x-1/2 translate-y-1/2"></div>

        {/* Content container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16 relative">
          <div className="max-w-3xl" data-aos="fade-right">
            <div className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full mb-4">
              <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
              <span className="text-white/90 text-xs font-light tracking-wider uppercase">Koleksi Produk</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
              Temukan Produk <span className="font-light">Berkualitas</span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg md:text-xl font-light max-w-2xl">
              Jelajahi berbagai pilihan produk konveksi premium kami dengan beragam pilihan material dan ukuran sesuai kebutuhan Anda.
            </p>
            
            {/* Breadcrumb */}
            <nav className="mt-6 flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link to="/" className="text-white/70 hover:text-white transition-colors text-sm flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    Home
                  </Link>
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/50" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white text-sm font-medium">Produk</span>
                </li>
              </ol>
            </nav>
          </div>
          
          {/* Abstract shapes */}
          <div className="absolute right-10 bottom-5 hidden lg:block" data-aos="fade-left">
            <div className="flex space-x-3">
              <div className="w-24 h-24 border border-white/20 rounded-lg transform rotate-12"></div>
              <div className="w-16 h-16 border border-white/20 rounded-full transform -translate-y-10"></div>
              <div className="w-20 h-20 border border-white/20 rounded-lg transform -rotate-6 translate-y-6"></div>
            </div>
          </div>
        </div>
        
        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-neutral-50" style={{ 
          clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 85% 60%, 70% 35%, 55% 65%, 40% 30%, 25% 70%, 10% 40%, 0 60%)'
        }}></div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Mobile Filter Toggle - Enhanced */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between text-gray-700 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-[#620000]/10 flex items-center justify-center text-[#620000] mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium">Filter & Pencarian</span>
            </div>
            <div className="flex items-center">
              {hasActiveFilters && (
                <span className="bg-[#620000] text-white text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center mr-3">
                  {Object.keys(filters).length}
                </span>
              )}
              <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-transform duration-300 ${showFilters ? 'transform rotate-180' : ''}`}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 text-gray-500" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar - Mobile First - Enhanced */}
          <div className={`lg:w-1/4 ${showFilters || 'hidden lg:block'}`}>
            <div data-aos="fade-right" className="sticky top-4">
              <ProductFilter
                onFilter={handleFilterChange}
                categories={categories}
                initialFilters={filters}
              />
              
              {/* Featured Promo Card - Added */}
              <div className="mt-6 bg-gradient-to-br from-[#620000] to-[#7A0000] rounded-xl overflow-hidden shadow-lg hidden lg:block">
                <div className="p-6 text-white relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full transform translate-x-6 -translate-y-6"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full transform -translate-x-4 translate-y-4"></div>
                  
                  <h3 className="font-semibold text-xl mb-2 relative">Butuh Produk Custom?</h3>
                  <p className="text-white/80 text-sm mb-4 relative">
                    Dapatkan penawaran khusus untuk pesanan dalam jumlah besar
                  </p>
                  <a 
                    href="https://wa.me/6288214606269"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-white text-[#620000] rounded-lg text-sm font-medium hover:bg-white/90 transition-colors relative"
                  >
                    Hubungi Kami
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Products Content */}
          <div className="lg:w-3/4">
            {/* Sort and Results Summary - Enhanced */}
            <div className="bg-white p-5 rounded-xl shadow-sm mb-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#620000]/10 flex items-center justify-center text-[#620000] mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 font-medium">
                    {loading ? (
                      'Mencari produk...'
                    ) : (
                      <span>Menampilkan <span className="text-[#620000]">{products.length}</span> dari <span className="text-[#620000]">{totalProducts}</span> produk</span>
                    )}
                  </p>
                </div>
                
                <div className="flex items-center">
                  <label htmlFor="sort" className="text-gray-600 mr-3 whitespace-nowrap font-medium">Urutkan:</label>
                  <select
                    id="sort"
                    value={sortOption}
                    onChange={handleSortChange}
                    className="border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#620000] focus:border-[#620000] bg-gray-50 text-gray-700"
                  >
                    <option value="newest">Terbaru</option>
                    <option value="price_low">Harga Terendah</option>
                    <option value="price_high">Harga Tertinggi</option>
                    <option value="name_asc">Nama A-Z</option>
                    <option value="name_desc">Nama Z-A</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Products Grid - Enhanced */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse border border-gray-100">
                    <div className="h-52 bg-gray-200"></div>
                    <div className="p-5">
                      <div className="h-4 bg-gray-200 rounded-full w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded-full w-1/2 mb-4"></div>
                      <div className="h-10 bg-gray-200 rounded-full w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {products.map((product, index) => (
                    <div key={product._id} data-aos="fade-up" data-aos-delay={index % 3 * 100} className="transition-all duration-300 hover:-translate-y-1">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
                
                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <nav className="flex items-center" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-l-lg border border-gray-300 ${
                          currentPage === 1
                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-[#620000]'
                        } transition-colors`}
                        aria-label="Previous Page"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {renderPagination().map((page, index) => (
                        page === '...' ? (
                          <span 
                            key={`ellipsis-${index}`} 
                            className="px-4 py-2 border-t border-b border-gray-300 bg-white text-gray-700"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 border-t border-b border-gray-300 ${
                              currentPage === page
                                ? 'bg-[#620000] text-white font-medium'
                                : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-[#620000]'
                            } transition-colors`}
                          >
                            {page}
                          </button>
                        )
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 rounded-r-lg border border-gray-300 ${
                          currentPage === totalPages
                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-[#620000]'
                        } transition-colors`}
                        aria-label="Next Page"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100" data-aos="fade-up">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#620000]/10 flex items-center justify-center text-[#620000]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Tidak ada produk ditemukan</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Tidak ada produk yang sesuai dengan filter Anda. Silakan coba kriteria pencarian lain.
                </p>
                <button
                  onClick={() => handleFilterChange({})}
                  className="inline-flex items-center px-4 py-2 border border-[#620000] text-[#620000] bg-white rounded-lg hover:bg-[#620000]/5 transition-colors font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Filter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Custom Order CTA Section - Enhanced */}
      <div className="bg-gradient-to-r from-[#620000] to-[#7A0000] py-16 px-6 mt-16 relative overflow-hidden">
        {/* Decorative patterns */}
        <div className="absolute inset-0 opacity-10" 
          style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23FFFFFF" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }}
        ></div>
        
        <div className="absolute -top-8 -right-8 w-64 h-64 bg-white/5 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-white/5 rounded-full filter blur-3xl"></div>
        
        <div className="container mx-auto max-w-5xl relative">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-8" data-aos="fade-up">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full mb-4">
                <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                <span className="text-white/90 text-xs font-light tracking-wider uppercase">Kustomisasi Produk</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Tidak menemukan yang Anda cari?</h2>
              <p className="text-white/80 text-lg max-w-xl font-light">
                Kami menyediakan layanan kustomisasi sesuai dengan kebutuhan spesifik Anda dengan harga terbaik dan kualitas premium.
              </p>
            </div>
            <div className="md:flex-shrink-0 flex justify-center">
              <a
                href="https://wa.me/6288214606269"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center whitespace-nowrap bg-white text-[#620000] px-8 py-4 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#FFFFFF]/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.273.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12.04 2C6.52 2 2.03 6.51 2.03 12.05c0 1.97.57 3.91 1.64 5.56L2 22l4.5-1.17c1.59.94 3.39 1.44 5.23 1.44 5.52 0 10.01-4.51 10.01-10.06.02-5.55-4.48-10.05-9.98-10.06H12.04zm0 1.5c4.66-.01 8.45 3.78 8.46 8.44.01 4.66-3.77 8.46-8.43 8.47-1.65 0-3.25-.47-4.63-1.37l-.53-.33-.57.15-1.68.43.44-1.65.16-.58-.34-.55c-.97-1.56-1.47-3.35-1.46-5.19 0-4.67 3.8-8.47 8.46-8.48l.12.01z"/>
                </svg>
                <span className="relative">
                  Pesan Kustom
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#620000] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Contact Floating Button - Enhanced */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <a
          href="https://wa.me/6289602865414"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-[#620000] rounded-full shadow-xl hover:bg-[#7A0000] transition-all duration-300 hover:scale-110 relative"
          title="Chat via WhatsApp"
        >
          <span className="absolute -top-10 right-0 bg-white text-[#620000] text-xs font-medium py-1.5 px-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 whitespace-nowrap hidden sm:block">
            Hubungi Kami
            <span className="absolute bottom-0 right-4 w-2 h-2 bg-white transform rotate-45 translate-y-1"></span>
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.273.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          <span className="absolute w-full h-full rounded-full border-2 border-white/30 animate-ping"></span>
        </a>
      </div>
      
      {/* Back to top button - Enhanced */}
      <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50 hidden md:block">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-[#620000]/20 hover:scale-110"
          title="Kembali ke atas"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-[#620000] group-hover:-translate-y-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Products;