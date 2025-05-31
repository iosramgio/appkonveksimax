import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/products/ProductCard';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import AOS from 'aos';
import 'aos/dist/aos.css';
import CaraOrder from '../../components/common/CaraOrder';
import Model3D from '../../components/3d/Model3D';
import WhatsAppButton from '../../components/common/WhatsAppButton';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [categoryProducts, setCategoryProducts] = useState({});
  
  const api = useApi();
  const { showNotification } = useNotification();
  
  const testimonials = [
    {
      id: 1,
      name: "Budi Santoso",
      role: "Pemilik Event Organizer",
      content: "Kualitas produk sangat baik dan pengiriman tepat waktu. Pelanggan kami sangat puas dengan hasil yang konsisten.",
      image: "/assets/images/avatar1.jpg"
    },
    {
      id: 2,
      name: "Siti Rahayu",
      role: "Manajer Perusahaan",
      content: "Layanan kustomisasi yang luar biasa. Tim desain mereka sangat membantu dan hasilnya melebihi ekspektasi kami.",
      image: "/assets/images/avatar2.jpg" 
    },
    {
      id: 3,
      name: "Ahmad Fadli",
      role: "Pemilik Toko Retail",
      content: "Harga bersaing dengan kualitas premium. Sudah menjadi partner tetap untuk kebutuhan konveksi bisnis kami.",
      image: "/assets/images/avatar3.jpg"
    }
  ];
  
  useEffect(() => {
    // Remove AOS initialization from here since it's now handled globally
    
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          api.get('/products?featured=true&limit=8'),
          api.get('/products/categories')
        ]);
        
        setFeaturedProducts(productsResponse.data.products);
        setCategories(categoriesResponse.data.categories);
        
        // Fetch one product for each category to display its image
        const categoryIds = categoriesResponse.data.categories.map(cat => cat._id);
        const categoryProductsData = {};
        
        // Create an array of promises for parallel fetching
        const categoryPromises = categoryIds.map(categoryId => 
          api.get(`/products?category=${categoryId}&limit=1`)
            .then(response => {
              if (response.data.products && response.data.products.length > 0) {
                categoryProductsData[categoryId] = response.data.products[0];
              }
            })
            .catch(error => {
              console.error(`Error fetching products for category ${categoryId}:`, error);
            })
        );
        
        // Wait for all category product requests to complete
        await Promise.all(categoryPromises);
        setCategoryProducts(categoryProductsData);
      } catch (error) {
        console.error('Error fetching home data:', error);
        showNotification('Gagal memuat data', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHomeData();
    
    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="overflow-x-hidden font-sans">
      {/* Hero Section - Modern with 3D Model */}
      <div className="relative py-4 pb-8 sm:py-8 sm:pb-12 lg:py-12 lg:pb-16 lg:min-h-[85vh] flex items-center bg-gradient-to-br from-[#620000]/5 via-neutral-50 to-[#620000]/10 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5" 
          style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23620000" fill-opacity="0.2" fill-rule="evenodd"/%3E%3C/svg%3E")',
            backgroundSize: '100px 100px'
          }}
        ></div>

        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#620000]/5 rounded-full filter blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#620000]/5 rounded-full filter blur-3xl opacity-50 transform -translate-x-1/2 translate-y-1/2"></div>

        {/* Animated border lines - hidden on mobile */}
        <div className="absolute inset-8 lg:inset-12 pointer-events-none hidden sm:block">
          {/* Top line */}
          <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#8B0000]/50 to-transparent">
            <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r from-transparent via-[#620000]/70 to-transparent animate-pulse" style={{ animationDuration: '3s' }}></div>
          </div>
          
          {/* Bottom line */}
          <div className="absolute bottom-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#4A0000]/50 to-transparent">
            <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r from-transparent via-[#620000]/70 to-transparent animate-pulse" style={{ animationDuration: '3.5s' }}></div>
          </div>
          
          {/* Left line */}
          <div className="absolute left-0 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-[#8B0000]/50 to-transparent">
            <div className="absolute top-0 left-0 bottom-0 w-full bg-gradient-to-b from-transparent via-[#620000]/70 to-transparent animate-pulse" style={{ animationDuration: '4s' }}></div>
          </div>
          
          {/* Right line */}
          <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-[#4A0000]/50 to-transparent">
            <div className="absolute top-0 left-0 bottom-0 w-full bg-gradient-to-b from-transparent via-[#620000]/70 to-transparent animate-pulse" style={{ animationDuration: '3.7s' }}></div>
          </div>
          
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-[8%] h-[8%]">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-[#8B0000]/70 transform origin-left scale-x-0 animate-[expand_3s_ease-in-out_infinite_alternate]"></div>
            <div className="absolute top-0 left-0 w-0.5 h-full bg-[#8B0000]/70 transform origin-top scale-y-0 animate-[expand_3s_ease-in-out_infinite_alternate]"></div>
          </div>
          
          <div className="absolute top-0 right-0 w-[8%] h-[8%]">
            <div className="absolute top-0 right-0 w-full h-0.5 bg-[#4A0000]/70 transform origin-right scale-x-0 animate-[expand_3s_ease-in-out_infinite_alternate_0.3s]"></div>
            <div className="absolute top-0 right-0 w-0.5 h-full bg-[#4A0000]/70 transform origin-top scale-y-0 animate-[expand_3s_ease-in-out_infinite_alternate_0.3s]"></div>
          </div>
          
          <div className="absolute bottom-0 left-0 w-[8%] h-[8%]">
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#8B0000]/70 transform origin-left scale-x-0 animate-[expand_3s_ease-in-out_infinite_alternate_0.6s]"></div>
            <div className="absolute bottom-0 left-0 w-0.5 h-full bg-[#8B0000]/70 transform origin-bottom scale-y-0 animate-[expand_3s_ease-in-out_infinite_alternate_0.6s]"></div>
          </div>
          
          <div className="absolute bottom-0 right-0 w-[8%] h-[8%]">
            <div className="absolute bottom-0 right-0 w-full h-0.5 bg-[#4A0000]/70 transform origin-right scale-x-0 animate-[expand_3s_ease-in-out_infinite_alternate_0.9s]"></div>
            <div className="absolute bottom-0 right-0 w-0.5 h-full bg-[#4A0000]/70 transform origin-bottom scale-y-0 animate-[expand_3s_ease-in-out_infinite_alternate_0.9s]"></div>
          </div>
        </div>

        {/* Mobile-specific animated border - only visible on mobile */}
        <div className="absolute inset-0 pointer-events-none block sm:hidden">
          {/* Top line */}
          <div className="absolute top-4 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#8B0000]/50 to-transparent">
            <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r from-transparent via-[#620000]/70 to-transparent animate-pulse" style={{ animationDuration: '3s' }}></div>
          </div>
          
          {/* Left partial line - only extends halfway */}
          <div className="absolute left-4 top-4 h-[40%] w-px bg-gradient-to-b from-[#4A0000]/50 to-transparent">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#620000]/70 to-transparent animate-pulse" style={{ animationDuration: '4s' }}></div>
          </div>
          
          {/* Right partial line - only extends halfway */}
          <div className="absolute right-4 top-4 h-[40%] w-px bg-gradient-to-b from-[#8B0000]/50 to-transparent">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#620000]/70 to-transparent animate-pulse" style={{ animationDuration: '3.7s' }}></div>
          </div>
          
          {/* Corner accents */}
          <div className="absolute top-4 left-4 w-[12%] h-[12%]">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-[#8B0000]/70 transform origin-left scale-x-0 animate-[expand_3s_ease-in-out_infinite_alternate]"></div>
            <div className="absolute top-0 left-0 w-0.5 h-full bg-[#8B0000]/70 transform origin-top scale-y-0 animate-[expand_3s_ease-in-out_infinite_alternate]"></div>
          </div>
          
          <div className="absolute top-4 right-4 w-[12%] h-[12%]">
            <div className="absolute top-0 right-0 w-full h-0.5 bg-[#4A0000]/70 transform origin-right scale-x-0 animate-[expand_3s_ease-in-out_infinite_alternate_0.3s]"></div>
            <div className="absolute top-0 right-0 w-0.5 h-full bg-[#4A0000]/70 transform origin-top scale-y-0 animate-[expand_3s_ease-in-out_infinite_alternate_0.3s]"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-center sm:text-left max-w-xl mx-auto sm:mx-0 mb-2 sm:mb-4 lg:mb-0 px-3 sm:px-0" data-aos="fade-right">
              <div className="mb-3 sm:mb-4 flex justify-center sm:justify-start">
                <div className="h-1 w-10 sm:w-12 bg-[#8B0000]/90 mx-1"></div>
                <div className="h-1 w-4 sm:w-5 bg-[#4A0000]/60 mx-1"></div>
                <div className="h-1 w-7 sm:w-8 bg-[#620000]/80 mx-1"></div>
              </div>
              
              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#620000] mb-3 sm:mb-4 leading-tight">
                <span className="font-light">Kreasi Berkualitas</span><br />
                <span className="relative inline-block">
                  Untuk Bisnis Anda
                  <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#8B0000]/80 via-[#FFD700]/80 to-[#4A0000]/80"></span>
                </span>
              </h1>
              
              <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-xl font-light">
                Mewujudkan visi fashion Anda melalui layanan konveksi premium dengan standar kualitas terbaik dan harga kompetitif.
              </p>
            
              <div className="mt-5 sm:mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
                <Link 
                  to="/products" 
                  className="group px-5 sm:px-6 md:px-7 py-2.5 sm:py-3 bg-gradient-to-r from-[#620000] to-[#8B0000] text-white rounded-lg hover:from-[#8B0000] hover:to-[#620000] transition-all duration-300 shadow-xl hover:shadow-[#620000]/30 relative overflow-hidden font-medium text-sm sm:text-base md:text-lg"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Jelajahi Koleksi
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </Link>
                
                <a 
                  href="https://www.virtualthreads.io/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group px-5 sm:px-6 md:px-7 py-2.5 sm:py-3 bg-white text-[#620000] border border-[#620000] rounded-lg hover:bg-[#620000]/10 transition-all duration-300 relative overflow-hidden font-medium text-sm sm:text-base md:text-lg"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Buat desain disini
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </a>
              </div>
              
              {/* Trust Badges */}
              <div className="mt-5 sm:mt-6 md:mt-8 flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start">
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/60 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-sm">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-[#620000]/10 to-[#8B0000]/10 flex items-center justify-center text-[#620000]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-700 font-medium">Premium Quality</span>
                </div>
                
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/60 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-sm">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-[#620000]/10 to-[#4A0000]/10 flex items-center justify-center text-[#620000]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-700 font-medium">4.9/5 Rating</span>
                </div>
                
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/60 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-sm">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-[#620000]/10 to-[#8B0000]/10 flex items-center justify-center text-[#620000]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-700 font-medium">1200+ Clients</span>
                </div>
              </div>
            </div>
            
            {/* Right Column - 3D Model */}
            <div className="h-[350px] xs:h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px] w-full order-first lg:order-last mb-0 sm:mb-0 -mx-2 sm:mx-0" data-aos="fade-left">
              <div className="w-full h-full max-w-full mx-auto lg:max-w-[600px] lg:ml-auto scale-110 sm:scale-100 transform relative -left-4 sm:left-0 lg:-top-8 xl:-top-12">
                <Model3D />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Company Information Section with Video */}
      <div className="bg-white py-16 sm:py-20 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5" 
          style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23620000" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Video */}
            <div className="relative order-2 lg:order-1" data-aos="fade-right">
              <div className="relative">
                <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-[#620000]/10 rounded-lg"></div>
                <div className="absolute -top-6 -left-6 w-64 h-64 border-2 border-[#620000] rounded-lg"></div>
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  <video 
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster="/assets/images/MaxHero.png"
                  >
                    <source src="/assets/video/produksi1.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
              
              {/* Decorative elements - keeping these as well for additional effects */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#620000]/5 rounded-full filter blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-[#620000]/5 rounded-full filter blur-2xl"></div>
            </div>

            {/* Right Column - Company Information */}
            <div className="space-y-8 order-1 lg:order-2" data-aos="fade-left">
              <div>
                <div className="inline-block bg-[#620000]/10 px-3 py-1 rounded-full mb-3">
                  <span className="text-xs font-normal tracking-widest text-[#620000] uppercase">Tentang Kami</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-4">
                  Konveksi Berkualitas untuk Bisnis Anda
                </h2>
                <div className="w-20 h-0.5 bg-gradient-to-r from-[#620000]/70 to-[#7A0000]/70 mb-6"></div>
              </div>

              <div className="space-y-6 text-gray-600">
                <p className="text-sm sm:text-base font-light leading-relaxed">
                  Kami adalah konveksi yang berdedikasi untuk memberikan produk berkualitas tinggi dengan standar internasional. Dengan pengalaman lebih dari 10 tahun di industri konveksi, kami telah melayani berbagai klien dari berbagai sektor bisnis.
                </p>
                
                <p className="text-sm sm:text-base font-light leading-relaxed">
                  Fasilitas produksi kami dilengkapi dengan peralatan modern dan teknologi terkini, didukung oleh tim yang berpengalaman dan terampil. Setiap produk melalui proses quality control yang ketat untuk memastikan kualitas terbaik.
                </p>

                <p className="text-sm sm:text-base font-light leading-relaxed">
                  Kami menawarkan layanan kustomisasi lengkap, mulai dari desain hingga produksi massal. Dengan harga yang kompetitif dan pengiriman tepat waktu, kami berkomitmen untuk menjadi partner terpercaya dalam memenuhi kebutuhan konveksi bisnis Anda.
                </p>
              </div>

              <div className="pt-4">
                <Link 
                  to="/about" 
                  className="inline-flex items-center px-6 py-3 bg-[#620000] text-white rounded-lg hover:bg-[#7A0000] transition-all duration-300 group"
                >
                  <span>Pelajari Lebih Lanjut</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Keunggulan Kami Section */}
      <div className="bg-neutral-50 py-16 sm:py-20 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5" 
          style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23620000" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-center mb-12 sm:mb-16">
            <div className="text-center max-w-3xl" data-aos="fade-up">
            <div className="inline-block bg-[#620000]/10 px-3 py-1 rounded-full mb-3">
                <span className="text-xs font-normal tracking-widest text-[#620000] uppercase">Keunggulan Kami</span>
            </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-3">Mengapa Memilih Kami</h2>
              <p className="text-gray-600 text-sm sm:text-base mb-6 font-light">
                Nikmati berbagai keunggulan layanan kami untuk kebutuhan konveksi Anda
              </p>
              <div className="w-20 h-0.5 bg-gradient-to-r from-[#620000]/70 to-[#7A0000]/70 mx-auto"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 group hover:-translate-y-2 relative overflow-hidden" data-aos="fade-up" data-aos-delay="0">
              <div className="absolute inset-0 z-0">
                <img 
                  src="/assets/images/bg-cart/bahan-berkualitas.jpeg" 
                  alt="Kualitas Premium" 
                  className="w-full h-full object-cover opacity-10 group-hover:opacity-100 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#620000]/0 to-[#620000]/0 group-hover:from-[#620000]/60 group-hover:to-[#620000]/40 transition-all duration-300"></div>
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#620000]/90 to-[#7A0000]/90 group-hover:bg-white/20 group-hover:backdrop-blur-sm flex items-center justify-center text-white mb-4 transform group-hover:rotate-3 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
                <h3 className="text-lg font-normal text-gray-900 group-hover:text-white mb-2 transition-colors duration-300">Kualitas Premium</h3>
                <p className="text-gray-600 group-hover:text-white/90 text-sm font-light transition-colors duration-300">
                  Kami hanya menggunakan bahan berkualitas tinggi untuk menjamin kenyamanan dan ketahanan produk kami.
                </p>
                
                {/* Accent line */}
                <div className="mt-4 h-px w-12 bg-[#620000]/30 group-hover:bg-white/30 rounded-full group-hover:w-20 transition-all duration-300"></div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 group hover:-translate-y-2 relative overflow-hidden" data-aos="fade-up" data-aos-delay="100">
              <div className="absolute inset-0 z-0">
                <img 
                  src="/assets/images/bg-cart/harga-kompetitif.jpg" 
                  alt="Harga Kompetitif" 
                  className="w-full h-full object-cover opacity-10 group-hover:opacity-100 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#620000]/0 to-[#620000]/0 group-hover:from-[#620000]/60 group-hover:to-[#620000]/40 transition-all duration-300"></div>
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#620000]/90 to-[#7A0000]/90 group-hover:bg-white/20 group-hover:backdrop-blur-sm flex items-center justify-center text-white mb-4 transform group-hover:rotate-3 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
                <h3 className="text-lg font-normal text-gray-900 group-hover:text-white mb-2 transition-colors duration-300">Harga Kompetitif</h3>
                <p className="text-gray-600 group-hover:text-white/90 text-sm font-light transition-colors duration-300">
                  Dapatkan produk berkualitas dengan harga yang kompetitif. Tersedia diskon untuk pembelian dalam jumlah banyak.
                </p>
                
                {/* Accent line */}
                <div className="mt-4 h-px w-12 bg-[#620000]/30 group-hover:bg-white/30 rounded-full group-hover:w-20 transition-all duration-300"></div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 group hover:-translate-y-2 relative overflow-hidden" data-aos="fade-up" data-aos-delay="200">
              <div className="absolute inset-0 z-0">
                <img 
                  src="/assets/images/bg-cart/desain.jpg" 
                  alt="Kustomisasi Lengkap" 
                  className="w-full h-full object-cover opacity-10 group-hover:opacity-100 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#620000]/0 to-[#620000]/0 group-hover:from-[#620000]/60 group-hover:to-[#620000]/40 transition-all duration-300"></div>
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#620000]/90 to-[#7A0000]/90 group-hover:bg-white/20 group-hover:backdrop-blur-sm flex items-center justify-center text-white mb-4 transform group-hover:rotate-3 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
                <h3 className="text-lg font-normal text-gray-900 group-hover:text-white mb-2 transition-colors duration-300">Kustomisasi Lengkap</h3>
                <p className="text-gray-600 group-hover:text-white/90 text-sm font-light transition-colors duration-300">
                  Desain sesuai keinginan Anda. Kami menyediakan layanan desain khusus untuk memenuhi kebutuhan spesifik Anda.
                </p>
                
                {/* Accent line */}
                <div className="mt-4 h-px w-12 bg-[#620000]/30 group-hover:bg-white/30 rounded-full group-hover:w-20 transition-all duration-300"></div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 group hover:-translate-y-2 relative overflow-hidden" data-aos="fade-up" data-aos-delay="300">
              <div className="absolute inset-0 z-0">
                <img 
                  src="/assets/images/bg-cart/pengiriman.jpeg" 
                  alt="Pengiriman Cepat" 
                  className="w-full h-full object-cover opacity-10 group-hover:opacity-100 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#620000]/0 to-[#620000]/0 group-hover:from-[#620000]/60 group-hover:to-[#620000]/40 transition-all duration-300"></div>
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#620000]/90 to-[#7A0000]/90 group-hover:bg-white/20 group-hover:backdrop-blur-sm flex items-center justify-center text-white mb-4 transform group-hover:rotate-3 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
                <h3 className="text-lg font-normal text-gray-900 group-hover:text-white mb-2 transition-colors duration-300">Pengiriman Cepat</h3>
                <p className="text-gray-600 group-hover:text-white/90 text-sm font-light transition-colors duration-300">
                  Kami menjamin pengiriman produk tepat waktu sesuai jadwal yang telah disepakati bersama pelanggan.
                </p>
                
                {/* Accent line */}
                <div className="mt-4 h-px w-12 bg-[#620000]/30 group-hover:bg-white/30 rounded-full group-hover:w-20 transition-all duration-300"></div>
              </div>
            </div>

            {/* Feature 5 - Penjahit Berpengalaman */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 group hover:-translate-y-2 relative overflow-hidden" data-aos="fade-up" data-aos-delay="400">
              <div className="absolute inset-0 z-0">
                <img 
                  src="/assets/images/bg-cart/bg-penjahit.jpg" 
                  alt="Penjahit Berpengalaman" 
                  className="w-full h-full object-cover opacity-10 group-hover:opacity-100 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#620000]/0 to-[#620000]/0 group-hover:from-[#620000]/60 group-hover:to-[#620000]/40 transition-all duration-300"></div>
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#620000]/90 to-[#7A0000]/90 group-hover:bg-white/20 group-hover:backdrop-blur-sm flex items-center justify-center text-white mb-4 transform group-hover:rotate-3 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
                <h3 className="text-lg font-normal text-gray-900 group-hover:text-white mb-2 transition-colors duration-300">Penjahit Berpengalaman</h3>
                <p className="text-gray-600 group-hover:text-white/90 text-sm font-light transition-colors duration-300">
                Didukung oleh tim penjahit profesional dengan pengalaman bertahun-tahun dalam industri konveksi, menjamin hasil jahitan yang rapi dan berkualitas tinggi.
              </p>
                
                {/* Accent line */}
                <div className="mt-4 h-px w-12 bg-[#620000]/30 group-hover:bg-white/30 rounded-full group-hover:w-20 transition-all duration-300"></div>
            </div>
          </div>
          </div>
        </div>
      </div>
      
      {/* Category Navigation - Bold & Modern Cards */}
      <div className="bg-white py-16 sm:py-20 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5" 
          style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23620000" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-center" data-aos="fade-up">
            <div className="text-center mb-12 sm:mb-16 relative">
              <div className="inline-block bg-[#620000]/10 px-3 py-1 rounded-full mb-3">
                <span className="text-xs font-normal tracking-widest text-[#620000] uppercase">Koleksi Kami</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-2">Kategori Produk</h2>
              <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base font-light">
                Temukan berbagai pilihan kategori produk konveksi berkualitas sesuai kebutuhan Anda
              </p>
              <div className="w-20 h-0.5 bg-gradient-to-r from-[#620000]/70 to-[#7A0000]/70 mx-auto mt-4"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8" data-aos="fade-up" data-aos-delay="100">
            {!loading && categories.slice(0, 8).map((category, index) => (
              <Link
                key={category._id}
                to={`/products?category=${category._id}`}
                className="group"
                data-aos="fade-up" 
                data-aos-delay={index * 50}
              >
                <div className="bg-neutral-50 rounded-2xl overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2 relative h-full flex flex-col">
                  <div className="aspect-square relative overflow-hidden">
                    {categoryProducts[category._id]?.images && categoryProducts[category._id].images.length > 0 ? (
                      <img
                        src={categoryProducts[category._id].images[0].url}
                        alt={category.name}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                        style={{ maxHeight: '300px' }}
                      />
                    ) : category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                        style={{ maxHeight: '300px' }}
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-r from-[#620000]/10 to-[#620000]/20 flex items-center justify-center text-[#620000] p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-300 flex items-end">
                      <div className="p-6 w-full">
                        <span className="text-white font-semibold text-base sm:text-lg flex items-center justify-between">
                          <span>Lihat Produk</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </span>
                      </div>
                    </div>
                    
                    {/* Category count badge */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-[#620000] shadow-sm">
                      {category.productCount || 0} produk
                    </div>
                  </div>
                  <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 group-hover:text-[#620000] transition-colors duration-300 line-clamp-2">
                        {category.name}
                      </h3>
                      <div className="mt-2 flex items-center">
                        <div className="h-px w-8 bg-[#620000]/50 rounded-full"></div>
                        <div className="h-px w-3 bg-[#620000]/30 rounded-full ml-1"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      {/* Featured Products Section - Modern & Bold Layout */}
      <div className="bg-neutral-50 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5" 
          style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23620000" fill-opacity="0.2" fill-rule="evenodd"/%3E%3C/svg%3E")',
            backgroundSize: '100px 100px'
          }}
        ></div>

        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#620000]/5 rounded-full filter blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#620000]/5 rounded-full filter blur-3xl opacity-50 transform -translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <div data-aos="fade-right">
              <div className="inline-block bg-[#620000]/10 px-3 py-1 rounded-full mb-3">
                <span className="text-xs font-normal tracking-widest text-[#620000] uppercase">Koleksi Terbaik</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-2">Produk Unggulan</h2>
              <p className="text-gray-500 max-w-lg text-sm sm:text-base font-light">
                Pilihan produk terbaik kami dengan kualitas premium dan desain eksklusif
              </p>
              <div className="w-20 h-0.5 bg-gradient-to-r from-[#620000]/70 to-[#7A0000]/70 mt-4 hidden md:block"></div>
            </div>
            
            <Link
              to="/products" 
              className="group px-6 sm:px-8 py-3 bg-[#620000] text-white rounded-full hover:bg-[#7A0000] transition-all duration-300 flex items-center gap-2 mt-6 md:mt-0 font-normal text-base"
              data-aos="fade-left"
            >
              <span className="relative flex items-center">
                Lihat Semua Produk
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="animate-pulse rounded-2xl overflow-hidden shadow-sm bg-white">
                  <div className="h-56 sm:h-64 bg-gray-200"></div>
                  <div className="p-5">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded mt-6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {featuredProducts.map((product, index) => (
                <div key={product._id} data-aos="fade-up" data-aos-delay={index * 100}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Cara Order Section - Modern & Aesthetic */}
      <div className="bg-neutral-50 py-16 sm:py-20 relative overflow-hidden">
        {/* Modern geometric background */}
        <div className="absolute inset-0 opacity-5" 
          style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23620000" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }}
        ></div>
        
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#620000]/5 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#620000]/5 rounded-full filter blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-center mb-12 sm:mb-16" data-aos="fade-up">
            <div className="text-center max-w-3xl">
              <div className="inline-block bg-[#620000]/10 px-3 py-1 rounded-full mb-3">
                <span className="text-xs font-normal tracking-widest text-[#620000] uppercase">Mulai Pemesanan</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-3">Cara Order</h2>
              <p className="text-gray-600 text-sm sm:text-base mb-6 font-light">
                Ikuti langkah-langkah sederhana ini untuk membuat pesanan konveksi Anda
              </p>
              <div className="w-20 h-0.5 bg-gradient-to-r from-[#620000]/70 to-[#7A0000]/70 mx-auto"></div>
            </div>
          </div>
          
          {/* Modern divider */}
          <div className="flex items-center justify-center mb-10 opacity-60">
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#620000]/30 to-transparent"></div>
            <div className="mx-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#620000]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#620000]/30 to-transparent"></div>
          </div>
          
          <div className="relative px-2 sm:px-0 overflow-x-auto pb-4 sm:pb-0">
            {/* Decorative elements - hide on small screens */}
            <div className="absolute inset-y-0 left-0 w-6 hidden md:flex flex-col justify-center items-center">
              <div className="h-24 w-px bg-gradient-to-b from-transparent via-[#620000]/30 to-transparent"></div>
            </div>
            <div className="absolute inset-y-0 right-0 w-6 hidden md:flex flex-col justify-center items-center">
              <div className="h-24 w-px bg-gradient-to-b from-transparent via-[#620000]/30 to-transparent"></div>
            </div>
            
            {/* Custom styled CaraOrder component */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
              <CaraOrder />
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="mt-12 text-center" data-aos="fade-up">
            <a
              href="https://wa.me/6288214606269"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-[#620000] text-white rounded-full hover:bg-[#7A0000] transition-all duration-300 shadow-md hover:shadow-[#620000]/20 group font-normal text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.273.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Hubungi Kami Sekarang
              <span className="ml-1 group-hover:ml-2 transition-all duration-300">→</span>
            </a>
          </div>
        </div>
      </div>
      
      {/* Quick Contact Floating Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <a
          href="https://wa.me/6288214606269"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] rounded-full shadow-md hover:bg-[#128C7E] transition-colors duration-300 relative"
          title="Chat via WhatsApp"
        >
          <span className="absolute -top-10 right-0 bg-white text-[#128C7E] text-xs font-light py-1 px-3 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap hidden sm:block">
            Hubungi Kami
            <span className="absolute bottom-0 right-4 w-2 h-2 bg-white transform rotate-45 translate-y-1"></span>
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-6 sm:w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.273.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          <span className="absolute w-full h-full rounded-full border border-white/20 animate-ping"></span>
        </a>
      </div>
      
      {/* Back to top button */}
      <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50 hidden md:block">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
          title="Kembali ke atas"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-5 sm:w-5 text-[#620000]/80 group-hover:-translate-y-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* WhatsApp Button */}
      <WhatsAppButton />
      
      {/* Gallery */}
      <div className="py-24 px-6 sm:px-10 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div data-aos="fade-up" className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-[#620000]/10 text-[#620000] text-sm font-medium rounded-full mb-4">
              GALERI KAMI
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Lihat Hasil Karya Kami</h2>
            <div className="h-1 w-20 bg-[#620000] mx-auto mb-6"></div>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
              Beberapa contoh produk berkualitas yang telah kami buat untuk klien kami
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Gallery Item 1 */}
            <div data-aos="fade-up" data-aos-delay="100" className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="aspect-w-4 aspect-h-3 w-full h-80">
                <img src="/assets/images/kemeja.png" alt="Produk konveksi 1" className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-500" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-2">Kemeja Premium</h3>
                <p className="text-white/80">Kemeja custom dengan material premium</p>
              </div>
            </div>
            {/* Gallery Item 2 */}
            <div data-aos="fade-up" data-aos-delay="200" className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="aspect-w-4 aspect-h-3 w-full h-80">
                <img src="/assets/images/kaos.png" alt="Produk konveksi 2" className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-500" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-2">T-shirt</h3>
                <p className="text-white/80">Kaos berkualitas tinggi untuk berbagai kebutuhan acara dan komunitas</p>
              </div>
            </div>
            {/* Gallery Item 3 */}
            <div data-aos="fade-up" data-aos-delay="300" className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="aspect-w-4 aspect-h-3 w-full h-80">
                <img src="/assets/images/kemejapdh.png" alt="Produk konveksi 3" className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-500" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-2">Seragam Perusahaan</h3>
                <p className="text-white/80">Solusi seragam perusahaan dengan desain custom sesuai kebutuhan</p>
              </div>
            </div>
            {/* Gallery Item 4 */}
            <div data-aos="fade-up" data-aos-delay="400" className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="aspect-w-4 aspect-h-3 w-full h-80">
                <img src="/assets/images/varsity.png" alt="Produk konveksi 4" className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-500" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-2">Varsity Jacket</h3>
                <p className="text-white/80">Jaket Varsity berkualitas dengan berbagai pilihan bahan dan desain</p>
              </div>
            </div>
            {/* Gallery Item 5 */}
            <div data-aos="fade-up" data-aos-delay="500" className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="aspect-w-4 aspect-h-3 w-full h-80">
                <img src="/assets/images/turtleneck.png" alt="Produk konveksi 5" className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-500" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-2">Turtle Neck</h3>
                <p className="text-white/80">Turtle Neck premium dengan bordir atau sablon berkualitas</p>
              </div>
            </div>
            {/* Gallery Item 6 */}
            <div data-aos="fade-up" data-aos-delay="600" className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="aspect-w-4 aspect-h-3 w-full h-80">
                <img src="/assets/images/Cargo.png" alt="Produk konveksi 6" className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-500" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-2">Cargo Pants</h3>
                <p className="text-white/80">Cargo Pants Premium untuk kebutuhan sehari-hari</p>
              </div>
            </div>
          </div>
          <div className="mt-12 text-center" data-aos="fade-up" data-aos-delay="700">
            <Link to="/products" className="inline-flex items-center justify-center rounded-md border-2 border-[#620000] bg-[#620000] py-3 px-6 text-base font-medium text-white shadow-sm hover:bg-[#620000]/90 transition-all duration-300">
              Lihat Semua Produk
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;