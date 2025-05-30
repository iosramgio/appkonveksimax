import React, { useState, useEffect } from 'react';
import InputField from '../forms/InputField';
import SelectField from '../forms/SelectField';
import FormSection from '../forms/FormSection';
import Button from '../common/Button';
import { useForm } from '../../hooks/useForm';

const UserForm = ({ onSubmit, initialData = {}, isEditing = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { formData, handleChange, errors, setErrors, setFormData } = useForm({
    name: '',
    email: '',
    phone: '',
    role: 'staff',
    password: '',
    confirmPassword: '',
    address: '',
    isActive: true,
  });

  // Update form data when initialData changes
  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        role: initialData.role || 'staff',
        password: '',
        confirmPassword: '',
        address: initialData.address || '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
    }
  }, [initialData, setFormData]);

  const validateUserForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Nama tidak boleh kosong';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Nama minimal 3 karakter';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email tidak boleh kosong';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    // Phone validation
    if (formData.phone && !/^[0-9+\-\s()]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Format nomor telepon tidak valid';
    }

    // Password validation for new users or when changing password
    if (!isEditing || (isEditing && formData.password)) {
      if (!formData.password) {
        newErrors.password = 'Password tidak boleh kosong';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password minimal 6 karakter';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Password tidak cocok';
      }
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Role harus dipilih';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateUserForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Remove confirmPassword from submission
      const { confirmPassword, ...submitData } = formData;
      
      // Only include password if it's being changed
      if (!submitData.password) {
        delete submitData.password;
      }
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({
        submit: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'cashier', label: 'Kasir' },
    { value: 'staff', label: 'Staff' },
    { value: 'owner', label: 'Owner' },
    { value: 'customer', label: 'Customer' },
  ];

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {errors.submit && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.submit}
        </div>
      )}

      <FormSection title="Informasi Pribadi">
        <InputField
          label="Nama"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />
        
        <InputField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />
        
        <InputField
          label="Nomor Telepon"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
        />
      </FormSection>

      <FormSection title="Password">
        <InputField
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required={!isEditing}
        />
        
        <InputField
          label="Konfirmasi Password"
          name="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required={!isEditing}
        />
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="showPassword"
            checked={showPassword}
            onChange={toggleShowPassword}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="showPassword" className="ml-2 block text-sm text-gray-700">
            Tampilkan Password
          </label>
        </div>
      </FormSection>

      <FormSection title="Informasi Tambahan">
        <SelectField
          label="Role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          options={roleOptions}
          error={errors.role}
          required
        />
        
        <InputField
          label="Alamat"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={(e) => handleChange({ target: { name: 'isActive', value: e.target.checked } })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
            Aktif
          </label>
        </div>
      </FormSection>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
        >
          Batal
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;