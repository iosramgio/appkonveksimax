import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { useForm } from '../../hooks/useForm';
import { isValidEmail } from '../../utils/validation';
import InputField from '../forms/InputField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import Card from '../common/Card';
import * as ROUTES from '../../constants/routes';

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { error: notify } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Get redirect path from location state or default to home
  const from = location.state?.from || '/';

  // Initialize form
  const { values, errors, handleChange, handleSubmit, setFieldError } = useForm(
    {
      email: '',
      password: '',
      remember: false,
    },
    onSubmitLogin
  );

  // Handle form submission
  async function onSubmitLogin() {
    // Validate form
    let isValid = true;

    if (!values.email.trim()) {
      setFieldError('email', 'Email tidak boleh kosong');
      isValid = false;
    } else if (!isValidEmail(values.email)) {
      setFieldError('email', 'Email tidak valid');
      isValid = false;
    }

    if (!values.password) {
      setFieldError('password', 'Password tidak boleh kosong');
      isValid = false;
    }

    if (!isValid) return;

    // Attempt login
    setIsLoading(true);
    setLoginError(null);

    try {
      const result = await login(values.email, values.password);

      if (result.success) {
        // Redirect to the page user was trying to access or to dashboard based on role
        navigate(from, { replace: true });
      } else {
        setLoginError(result.message || 'Email atau password salah');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Terjadi kesalahan saat login. Silakan coba lagi.');
      notify('Terjadi kesalahan saat login. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Login</h2>
        <p className="mt-2 text-sm text-gray-600">
          Masuk ke akun Anda untuk mengakses fitur konveksi
        </p>
      </div>

      {loginError && (
        <Alert 
          type="error" 
          message={loginError} 
          className="mb-4"
          onClose={() => setLoginError(null)}
          autoClose={false}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          id="email"
          name="email"
          type="email"
          label="Email"
          value={values.email}
          onChange={handleChange}
          placeholder="Masukkan email Anda"
          error={errors.email}
          required
          autoComplete="email"
          autoFocus
          icon={
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          }
        />

        <InputField
          id="password"
          name="password"
          type="password"
          label="Password"
          value={values.password}
          onChange={handleChange}
          placeholder="Masukkan password Anda"
          error={errors.password}
          required
          autoComplete="current-password"
          icon={
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          }
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              checked={values.remember}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
              Ingat saya
            </label>
          </div>

          <div className="text-sm">
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Lupa password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Memuat...' : 'Masuk'}
        </Button>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Belum punya akun?{' '}
            <span className="font-medium text-blue-600">
              Hubungi admin untuk membuat akun
            </span>
          </p>
        </div>
      </form>
    </Card>
  );
};

export default LoginForm;