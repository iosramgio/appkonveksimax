import { useState, useCallback } from 'react';

export const useForm = (initialValues = {}, validateFn = null, onSubmitFn = null) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for the field when user changes it
    if (errors[name]) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);
  
  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    // Validate form if validation function is provided
    if (validateFn) {
      const validationErrors = validateFn(formData);
      
      // If there are validation errors, set them and stop submission
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      // If onSubmit function is provided, call it with form data
      if (onSubmitFn) {
        await onSubmitFn(formData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ submit: error.message || 'An error occurred during submission' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateFn, onSubmitFn]);
  
  // Reset form to initial values
  const resetForm = useCallback(() => {
    setFormData(initialValues);
    setErrors({});
  }, [initialValues]);
  
  return {
    formData,
    handleChange,
    handleSubmit,
    setFormData,
    errors,
    setErrors,
    isSubmitting,
    resetForm
  };
};

export default useForm;