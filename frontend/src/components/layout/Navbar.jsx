import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import Button from '../common/Button';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const { isAuthenticated, user, logout } = useAuth();
  const { cart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if current route is a dashboard route
  const isDashboardRoute = 
    location.pathname.includes('/admin') ||
    location.pathname.includes('/cashier') ||
    location.pathname.includes('/staff') ||
    location.pathname.includes('/owner');
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location]);
  
  // Handle scroll event for navbar background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    
    // Add/remove class to body to prevent scrolling when menu is open
    if (!isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
  };
  
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };
  
  // Get dashboard route based on user role
  const getDashboardRoute = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'cashier':
        return '/cashier/dashboard';
      case 'staff':
        return '/staff/dashboard';
      case 'owner':
        return '/owner/dashboard';
      case 'customer':
        return '/customer/dashboard';
      default:
        return '/';
    }
  };
  
  return (
    <nav 
      className={`fixed top-0 inset-x-0 z-30 transition-all duration-300 ${
        scrolled || isMobileMenuOpen 
          ? 'bg-white shadow-lg' 
          : 'bg-white/80 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center group relative">
              <span className="text-xl sm:text-2xl text-[#620000] group-hover:text-[#7A0000] transition-all duration-300 font-poppins tracking-wide relative">
                <span className="font-light tracking-tight logo-max transition-all duration-300 inline-block relative">
                  Max
                </span>
                <span className="font-semibold ml-[1px] logo-supply transition-all duration-300 inline-block">Supply</span>
                <span className="absolute -inset-2 bg-[#620000]/0 group-hover:bg-[#620000]/5 blur-md rounded-full -z-10 transition-all duration-500 opacity-0 group-hover:opacity-100"></span>
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          {!isDashboardRoute && (
            <div className="hidden md:flex md:items-center md:space-x-8">
              <Link
                to="/"
                className={`${
                  location.pathname === '/'
                    ? 'text-[#620000] font-medium after:w-full'
                    : 'text-gray-600 hover:text-[#620000] after:w-0 hover:after:w-full'
                } relative py-5 text-sm transition-colors duration-200 after:absolute after:bottom-3 after:left-0 after:h-0.5 after:bg-[#620000] after:transition-all after:duration-300`}
              >
                Beranda
              </Link>
              <Link
                to="/products"
                className={`${
                  location.pathname.includes('/products')
                    ? 'text-[#620000] font-medium after:w-full'
                    : 'text-gray-600 hover:text-[#620000] after:w-0 hover:after:w-full'
                } relative py-5 text-sm transition-colors duration-200 after:absolute after:bottom-3 after:left-0 after:h-0.5 after:bg-[#620000] after:transition-all after:duration-300`}
              >
                Produk
              </Link>
              <Link
                to="/about"
                className={`${
                  location.pathname === '/about'
                    ? 'text-[#620000] font-medium after:w-full'
                    : 'text-gray-600 hover:text-[#620000] after:w-0 hover:after:w-full'
                } relative py-5 text-sm transition-colors duration-200 after:absolute after:bottom-3 after:left-0 after:h-0.5 after:bg-[#620000] after:transition-all after:duration-300`}
              >
                Tentang Kami
              </Link>
            </div>
          )}
          
          {/* Right Side Actions */}
          <div className="flex items-center">
            {/* Cart Icon - Only show if not in dashboard */}
            {!isDashboardRoute && (
              <div className="flex items-center">
                <Link 
                  to="/customer/cart" 
                  className="relative p-2 text-gray-600 hover:text-[#620000] transition-colors duration-200 rounded-full hover:bg-gray-100"
                  aria-label="Shopping Cart"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {cart?.items?.length > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-[#620000] rounded-full">
                      {cart.items.length}
                    </span>
                  )}
                </Link>
              </div>
            )}
            
            {/* Authentication Actions */}
            {isAuthenticated ? (
              <div className="relative ml-3">
                <button
                  onClick={toggleProfileMenu}
                  className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#620000]/50 transition-all duration-200 hover:scale-105"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#620000]/90 to-[#620000]/70 flex items-center justify-center text-white shadow-md">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                </button>
                
                {isProfileMenuOpen && (
                  <>
                    <div
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="fixed inset-0 z-10"
                    ></div>
                    <div
                      className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-xl py-1 bg-white ring-1 ring-black/5 focus:outline-none z-20 transform transition-all duration-200 animate-fadeIn"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu-button"
                    >
                      <div className="px-4 py-3 text-sm border-b border-gray-100">
                        <p className="font-medium text-gray-800">{user?.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
                        </p>
                      </div>
                      
                      <Link
                        to={getDashboardRoute()}
                        className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#620000] transition-colors duration-200"
                        role="menuitem"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400 group-hover:text-[#620000] transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                      </Link>
                      
                      {user?.role === 'customer' && (
                        <>
                          <Link
                            to="/customer/orders"
                            className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#620000] transition-colors duration-200"
                            role="menuitem"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400 group-hover:text-[#620000] transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Pesanan Saya
                          </Link>
                          <Link
                            to="/customer/profile"
                            className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#620000] transition-colors duration-200"
                            role="menuitem"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400 group-hover:text-[#620000] transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Profil
                          </Link>
                        </>
                      )}
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="group flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#620000] transition-colors duration-200"
                        role="menuitem"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400 group-hover:text-[#620000] transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Keluar
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3 ml-3">
                <Link to="/register">
                  <button className="text-sm px-4 py-2 text-[#620000] border border-[#620000] rounded-full hover:bg-[#620000]/5 transition-all duration-200 hover:shadow-sm">
                    Daftar
                  </button>
                </Link>
                <Link to="/login">
                  <button className="text-sm px-5 py-2 bg-gradient-to-r from-[#620000] to-[#7A0000] text-white rounded-full hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                    Login
                  </button>
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden inline-flex items-center justify-center p-2 ml-2 rounded-md text-gray-700 hover:text-[#620000] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#620000] transition-all duration-200"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <div className="relative w-6 h-6 flex items-center justify-center">
                <span 
                  className={`absolute h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'
                  }`}
                />
                <span 
                  className={`absolute h-0.5 bg-current transform transition-opacity duration-300 ease-in-out ${
                    isMobileMenuOpen ? 'opacity-0 w-0' : 'opacity-100 w-6'
                  }`}
                />
                <span 
                  className={`absolute h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
                    isMobileMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      {isMobileMenuOpen && !isDashboardRoute && (
        <div className="md:hidden h-auto max-h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-300 ease-in-out border-t border-gray-100 bg-white shadow-lg">
          <div className="pt-2 pb-3 space-y-1 px-4">
            <Link
              to="/"
              className={`${
                location.pathname === '/'
                  ? 'bg-[#620000]/5 text-[#620000] border-l-4 border-[#620000]'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-[#620000] border-l-4 border-transparent'
              } block pl-4 pr-4 py-3 text-base font-medium rounded-md transition-all duration-200`}
            >
              Beranda
            </Link>
            <Link
              to="/products"
              className={`${
                location.pathname.includes('/products')
                  ? 'bg-[#620000]/5 text-[#620000] border-l-4 border-[#620000]'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-[#620000] border-l-4 border-transparent'
              } block pl-4 pr-4 py-3 text-base font-medium rounded-md transition-all duration-200`}
            >
              Produk
            </Link>
            <Link
              to="/about"
              className={`${
                location.pathname === '/about'
                  ? 'bg-[#620000]/5 text-[#620000] border-l-4 border-[#620000]'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-[#620000] border-l-4 border-transparent'
              } block pl-4 pr-4 py-3 text-base font-medium rounded-md transition-all duration-200`}
            >
              Tentang Kami
            </Link>
            
            {!isAuthenticated && (
              <div className="mt-6 pb-3 pt-4 border-t border-gray-200 flex flex-col space-y-3">
                <Link to="/login">
                  <button className="w-full py-2.5 bg-gradient-to-r from-[#620000] to-[#7A0000] text-white rounded-lg hover:shadow-md transition-all duration-200 font-medium">
                    Login
                  </button>
                </Link>
                <Link to="/register">
                  <button className="w-full py-2.5 text-[#620000] border border-[#620000] rounded-lg hover:bg-[#620000]/5 transition-all duration-200 font-medium">
                    Daftar
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;