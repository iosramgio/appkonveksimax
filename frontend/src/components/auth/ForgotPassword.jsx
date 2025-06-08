import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import { useNotification } from '../../hooks/useNotification';
import { forgotPassword } from '../../api/auth';
import { isValidEmail } from '../../utils/validation';
import InputField from '../forms/InputField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import Card from '../common/Card';
import * as ROUTES from '../../constants/routes';

const ForgotPassword = () => {
  const { success, error } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [requestError, setRequestError] = useState(null);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Initialize form
  const { values, errors, handleChange, handleSubmit, setFieldError } = useForm(
    {
      email: '',
    },
    onSubmitRequest
  );

  // Handle form submission
  async function onSubmitRequest() {
    // Validate form
    if (!values.email.trim()) {
      setFieldError('email', 'Email tidak boleh kosong');
      return;
    } else if (!isValidEmail(values.email)) {
      setFieldError('email', 'Email tidak valid');
      return;
    }

    // Send password reset request
    setIsLoading(true);
    setRequestError(null);
    setRequestSuccess(false);

    try {
      const result = await forgotPassword(values.email);

      if (result.success) {
        setRequestSuccess(true);
        success('Instruksi untuk reset password telah dikirim ke email Anda.');
      } else {
        setRequestError(result.error || 'Terjadi kesalahan. Silakan coba lagi.');
        error(result.error || 'Terjadi kesalahan. Silakan coba lagi.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setRequestError('Terjadi kesalahan saat mengirim permintaan. Silakan coba lagi.');
      error('Terjadi kesalahan saat mengirim permintaan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Lupa Password</h2>
        <p className="mt-2 text-sm text-gray-600">
          Masukkan email Anda untuk menerima instruksi reset password
        </p>
      </div>

      {requestError && (
        <Alert 
          type="error" 
          message={requestError} 
          className="mb-4"
          onClose={() => setRequestError(null)}
        />
      )}

      {requestSuccess ? (
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <svg 
              className="h-16 w-16 text-green-500" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Email Terkirim</h3>
          <p className="mt-2 text-sm text-gray-600">
            Kami telah mengirimkan instruksi untuk reset password ke email Anda. Silakan cek email Anda dan ikuti petunjuk yang diberikan.
          </p>
          <div className="mt-6">
            <Link
              to={ROUTES.LOGIN}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Kembali ke halaman login
            </Link>
          </div>
        </div>
      ) : (
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

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Mengirim...' : 'Kirim Instruksi Reset'}
          </Button>

          <div className="text-center mt-4">
            <Link
              to={ROUTES.LOGIN}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Kembali ke halaman login
            </Link>
          </div>
        </form>
      )}
    </Card>
  );
};

export default ForgotPassword;