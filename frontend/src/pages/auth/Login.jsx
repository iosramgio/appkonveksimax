import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import InputField from '../../components/forms/InputField';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(null);
  
  const { login, googleLogin, handleGoogleCallback, isAuthenticated, user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  
  // This effect is only for initial page load when the user is already logged in
  useEffect(() => {
    // Only run this effect once on component mount
    if (isAuthenticated && user && !sessionStorage.getItem('loginRedirected')) {
      const dashboardRoutes = {
        admin: '/admin/dashboard',
        cashier: '/cashier/dashboard',
        staff: '/staff/dashboard',
        owner: '/owner/dashboard',
        customer: '/' // Customers go to home page
      };
      
      // Get the role-specific dashboard route
      const dashboardPath = dashboardRoutes[user.role];
      
      // Set flag to prevent duplicate redirects
      sessionStorage.setItem('loginRedirected', 'true');
      
      // Navigate to dashboard
      navigate(dashboardPath, { replace: true });
      
      // Clean up the flag after navigation
      return () => {
        sessionStorage.removeItem('loginRedirected');
      };
    }
  }, [isAuthenticated, user, navigate]);

  // Handle Google OAuth callback if token is in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      // Token exists in URL, handle Google callback
      const handleCallback = async () => {
        try {
          // Use the token to authenticate
          const result = await handleGoogleCallback(token);
          
          if (!result.success) {
            setLoginError(result.message || 'Login gagal. Silakan coba lagi.');
            showNotification(result.message || 'Login gagal. Silakan coba lagi.', 'error');
          } else {
            // Login successful, redirect based on role
            const dashboardRoutes = {
              admin: '/admin/dashboard',
              cashier: '/cashier/dashboard',
              staff: '/staff/dashboard',
              owner: '/owner/dashboard',
              customer: '/'
            };
            
            // Get the role-specific dashboard path
            const redirectPath = dashboardRoutes[result.user.role] || '/';
            navigate(redirectPath, { replace: true });
          }
        } catch (error) {
          console.error('Google callback error:', error);
          setLoginError('Login gagal. Silakan coba lagi.');
          showNotification('Login gagal. Silakan coba lagi.', 'error');
        }
      };
      
      handleCallback();
    }
  }, [location.search, navigate, handleGoogleCallback, showNotification]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setLoginError('Email dan password wajib diisi');
      showNotification('Email dan password wajib diisi', 'error');
      return;
    }
    
    setLoading(true);
    setLoginError(null);
    
    try {
      const result = await login(email, password);
      if (!result.success) {
        setLoginError(result.message || 'Email atau password salah');
        showNotification(result.message || 'Login gagal. Silakan coba lagi.', 'error');
      } else {
        // Login successful, redirect based on role
        const dashboardRoutes = {
          admin: '/admin/dashboard',
          cashier: '/cashier/dashboard',
          staff: '/staff/dashboard',
          owner: '/owner/dashboard',
          customer: '/'
        };
        
        // Get the role-specific dashboard path
        const redirectPath = dashboardRoutes[result.user.role] || '/';
        navigate(redirectPath, { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message;
      if (errorMessage.includes('deactivated')) {
        setLoginError('Akun Anda telah dinonaktifkan. Silakan hubungi administrator.');
        showNotification('Akun Anda telah dinonaktifkan. Silakan hubungi administrator.', 'error');
      } else {
        setLoginError('Email atau password yang Anda masukkan salah');
        showNotification('Login gagal. Silakan coba lagi.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const profile = jwtDecode(credentialResponse.credential);
      const result = await googleLogin({ 
        credential: credentialResponse.credential, 
        profile 
      });
      
      if (!result.success) {
        setLoginError(result.message || 'Login dengan Google gagal. Silakan coba lagi.');
        showNotification(result.message || 'Login dengan Google gagal. Silakan coba lagi.', 'error');
      } else {
        // Login successful, redirect based on role
        const dashboardRoutes = {
          admin: '/admin/dashboard',
          cashier: '/cashier/dashboard',
          staff: '/staff/dashboard',
          owner: '/owner/dashboard',
          customer: '/'
        };
        
        // Get the role-specific dashboard path
        const redirectPath = dashboardRoutes[result.user.role] || '/';
        navigate(redirectPath, { replace: true });
      }
    } catch (error) {
      console.error('Google login error:', error);
      setLoginError('Login dengan Google gagal. Silakan coba lagi.');
      showNotification('Login dengan Google gagal. Silakan coba lagi.', 'error');
    }
  };
  
  const handleGoogleError = () => {
    setLoginError('Login dengan Google dibatalkan atau gagal.');
    showNotification('Login dengan Google dibatalkan atau gagal.', 'error');
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-50 to-rose-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Logo Side - Left */}
        <div className="bg-gradient-to-b from-[#620000] to-[#8B0000] md:w-5/12 p-8 flex flex-col items-center justify-center text-white">
          <div className="mb-8">
            {/* Replace with your actual logo */}
            <div className="h-24 w-24 mx-auto rounded-full bg-white flex items-center justify-center">
              <svg className="h-16 w-16 text-[#620000]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Konveksi App</h1>
          <p className="text-center text-red-100 mb-8">Solusi terbaik untuk bisnis konveksi Anda</p>
          <div className="mt-4 p-6 bg-red-900/20 rounded-lg">
            <p className="text-sm italic text-red-100">"Sistem manajemen konveksi yang memudahkan semua proses bisnis Anda dari pesanan hingga pengiriman."</p>
          </div>
        </div>
        
        {/* Login Form - Right */}
        <div className="md:w-7/12 p-8 md:p-10">
          <div className="max-w-md mx-auto">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                Selamat Datang
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Silakan login untuk mengakses akun Anda
              </p>
            </div>
            
            {/* Display error alert */}
            {loginError && (
              <Alert 
                type="error" 
                message={loginError} 
                className="mt-4 mb-2"
                onClose={() => setLoginError(null)}
                autoClose={false}
              />
            )}
            
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <InputField
                    label="Email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan email Anda"
                    required
                    icon={
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    }
                  />
                </div>
                
                <div className="relative">
                  <InputField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password Anda"
                    required
                    icon={
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    }
                    endAdornment={
                      <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        onClick={toggleShowPassword}
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                        )}
                      </button>
                    }
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#620000] focus:ring-[#620000] border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Ingat saya
                  </label>
                </div>
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-[#620000] hover:text-[#8B0000] transition-colors">
                    Lupa password?
                  </Link>
                </div>
              </div>
              
              <div>
                <Button
                  type="submit"
                  isLoading={loading}
                  fullWidth={true}
                  variant="primary"
                  size="large"
                  className="group relative flex w-full justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#620000] to-[#8B0000] hover:from-[#8B0000] hover:to-[#620000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#620000]"
                >
                  {loading ? 'Memproses...' : 'Masuk'}
                </Button>
              </div>

              <div className="text-center md:text-left mt-4">
                <p className="text-sm text-gray-600">
                  Belum punya akun?{' '}
                  <Link to="/register" className="font-medium text-[#620000] hover:text-[#8B0000] transition-colors">
                    Daftar di sini
                  </Link>
                </p>
              </div>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      atau lanjutkan dengan
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3">
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      theme="outline"
                      size="large"
                      text="signin_with"
                      shape="rectangular"
                      locale="id"
                      useOneTap={false}
                      cookiePolicy={'single_host_origin'}
                      type="standard"
                      ux_mode="popup"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;