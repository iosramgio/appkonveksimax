/**
 * Email validation
 * 
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether the email is valid
 */
export const isValidEmail = (email) => {
    if (!email) return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Password strength validation
   * 
   * @param {string} password - Password to validate
   * @returns {Object} - Validation result
   */
  export const validatePassword = (password) => {
    if (!password) {
      return {
        valid: false,
        message: 'Password tidak boleh kosong',
        strength: 0
      };
    }
  
    let strength = 0;
    const messages = [];
  
    // Length check
    if (password.length < 8) {
      messages.push('Password minimal harus 8 karakter');
    } else {
      strength += 1;
    }
  
    // Uppercase letter check
    if (!/[A-Z]/.test(password)) {
      messages.push('Password harus mengandung huruf kapital');
    } else {
      strength += 1;
    }
  
    // Lowercase letter check
    if (!/[a-z]/.test(password)) {
      messages.push('Password harus mengandung huruf kecil');
    } else {
      strength += 1;
    }
  
    // Number check
    if (!/\d/.test(password)) {
      messages.push('Password harus mengandung angka');
    } else {
      strength += 1;
    }
  
    // Special character check
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      messages.push('Password harus mengandung karakter khusus');
    } else {
      strength += 1;
    }
  
    const valid = strength >= 4;
    const message = valid ? 'Password sudah kuat' : messages.join(', ');
  
    return {
      valid,
      message,
      strength: Math.min(5, strength) // Scale from 0-5
    };
  };
  
  /**
   * Phone number validation
   * 
   * @param {string} phoneNumber - Phone number to validate
   * @returns {boolean} - Whether the phone number is valid
   */
  export const isValidPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return false;
    
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check length (Indonesian numbers are typically 10-13 digits)
    if (cleaned.length < 10 || cleaned.length > 13) {
      return false;
    }
    
    // Check if starts with valid prefixes for Indonesia
    if (cleaned.startsWith('62') || cleaned.startsWith('0')) {
      return true;
    }
    
    return false;
  };
  
  /**
   * Required field validation
   * 
   * @param {any} value - Value to check
   * @param {string} fieldName - Name of the field
   * @returns {Object} - Validation result
   */
  export const validateRequired = (value, fieldName = 'Field') => {
    // Check for undefined, null, empty string, or empty array
    const isEmpty = 
      value === undefined || 
      value === null || 
      value === '' || 
      (Array.isArray(value) && value.length === 0);
    
    return {
      valid: !isEmpty,
      message: isEmpty ? `${fieldName} tidak boleh kosong` : null
    };
  };
  
  /**
   * Number validation
   * 
   * @param {any} value - Value to check
   * @param {Object} options - Validation options
   * @returns {Object} - Validation result
   */
  export const validateNumber = (value, options = {}) => {
    const {
      fieldName = 'Angka',
      required = true,
      min,
      max,
      integer = false
    } = options;
    
    // Check if required
    if (required && (value === undefined || value === null || value === '')) {
      return {
        valid: false,
        message: `${fieldName} tidak boleh kosong`
      };
    }
    
    // If not required and empty, it's valid
    if (!required && (value === undefined || value === null || value === '')) {
      return {
        valid: true,
        message: null
      };
    }
    
    // Convert to number if string
    const num = typeof value === 'string' ? parseFloat(value) : value;
    
    // Check if it's a valid number
    if (isNaN(num)) {
      return {
        valid: false,
        message: `${fieldName} harus berupa angka`
      };
    }
    
    // Check if it's an integer if required
    if (integer && !Number.isInteger(num)) {
      return {
        valid: false,
        message: `${fieldName} harus berupa bilangan bulat`
      };
    }
    
    // Check minimum value
    if (min !== undefined && num < min) {
      return {
        valid: false,
        message: `${fieldName} minimal ${min}`
      };
    }
    
    // Check maximum value
    if (max !== undefined && num > max) {
      return {
        valid: false,
        message: `${fieldName} maksimal ${max}`
      };
    }
    
    return {
      valid: true,
      message: null
    };
  };
  
  /**
   * Text length validation
   * 
   * @param {string} value - Value to check
   * @param {Object} options - Validation options
   * @returns {Object} - Validation result
   */
  export const validateLength = (value, options = {}) => {
    const {
      fieldName = 'Teks',
      required = true,
      min,
      max
    } = options;
    
    // Check if required
    if (required && (value === undefined || value === null || value === '')) {
      return {
        valid: false,
        message: `${fieldName} tidak boleh kosong`
      };
    }
    
    // If not required and empty, it's valid
    if (!required && (value === undefined || value === null || value === '')) {
      return {
        valid: true,
        message: null
      };
    }
    
    const length = value.toString().length;
    
    // Check minimum length
    if (min !== undefined && length < min) {
      return {
        valid: false,
        message: `${fieldName} minimal ${min} karakter`
      };
    }
    
    // Check maximum length
    if (max !== undefined && length > max) {
      return {
        valid: false,
        message: `${fieldName} maksimal ${max} karakter`
      };
    }
    
    return {
      valid: true,
      message: null
    };
  };
  
  /**
   * Form validation helper
   * 
   * @param {Object} values - Form values
   * @param {Object} validationRules - Validation rules
   * @returns {Object} - Validation errors
   */
  export const validateForm = (values, validationRules) => {
    const errors = {};
    
    Object.keys(validationRules).forEach(field => {
      const rules = validationRules[field];
      const value = values[field];
      
      // Process each validation rule
      for (const rule of rules) {
        const { type, ...options } = rule;
        
        let result;
        
        switch (type) {
          case 'required':
            result = validateRequired(value, options.fieldName || field);
            break;
          case 'email':
            result = { 
              valid: isValidEmail(value),
              message: isValidEmail(value) ? null : `${options.fieldName || 'Email'} tidak valid`
            };
            break;
          case 'password':
            result = validatePassword(value);
            break;
          case 'phone':
            result = {
              valid: isValidPhoneNumber(value),
              message: isValidPhoneNumber(value) ? null : `${options.fieldName || 'No. Telepon'} tidak valid`
            };
            break;
          case 'number':
            result = validateNumber(value, { fieldName: field, ...options });
            break;
          case 'length':
            result = validateLength(value, { fieldName: field, ...options });
            break;
          case 'custom':
            if (typeof options.validator === 'function') {
              result = options.validator(value, values);
            }
            break;
          default:
            result = { valid: true, message: null };
        }
        
        // If validation fails, add error message and move to next field
        if (result && !result.valid) {
          errors[field] = result.message;
          break;
        }
      }
    });
    
    return errors;
  };