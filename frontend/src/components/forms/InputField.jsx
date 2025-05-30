import React from 'react';

/**
 * Reusable input field component
 */
const InputField = ({
  id,
  name,
  type = 'text',
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
  readOnly = false,
  required = false,
  error,
  helperText,
  className = '',
  inputClassName = '',
  labelClassName = '',
  errorClassName = '',
  helperClassName = '',
  icon,
  iconPosition = 'left',
  fullWidth = true,
  size = 'md',
  variant = 'outline',
  autoFocus = false,
  autoComplete,
  maxLength,
  minLength,
  pattern,
  min,
  max,
  step,
  startAdornment,
  endAdornment,
  multiline = false,
  rows = 3,
  ...props
}) => {
  // Generate an ID if not provided
  const inputId = id || `input-${name}-${Math.random().toString(36).substr(2, 9)}`;

  // Size variants
  const sizeClasses = {
    sm: 'h-8 text-xs px-2',
    md: 'h-10 text-sm px-3',
    lg: 'h-12 text-base px-4',
  };

  // Variant styles
  const variantClasses = {
    outline: 'border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    filled: 'bg-gray-100 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    flushed: 'border-b border-gray-300 rounded-none px-0 focus:ring-0 focus:border-blue-500',
  };

  // Error styles
  const errorClasses = error
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
    : '';

  // Input base classes
  const inputBaseClasses = `
    block rounded-md shadow-sm
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}
    ${readOnly ? 'cursor-default bg-gray-50' : ''}
    ${sizeClasses[size] || sizeClasses.md}
    ${variantClasses[variant] || variantClasses.outline}
    ${errorClasses}
    ${icon || startAdornment ? 'pl-10' : ''}
    ${endAdornment ? 'pr-10' : ''}
    ${inputClassName}
  `;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId} 
          className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      {/* Input wrapper for icons/adornments */}
      <div className="relative">
        {/* Start icon or adornment */}
        {(icon && iconPosition === 'left') && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        
        {startAdornment && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            {startAdornment}
          </div>
        )}

        {/* Input field */}
        {multiline ? (
          <textarea
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={`${inputBaseClasses} ${disabled ? 'bg-gray-100' : ''}`}
            {...props}
          />
        ) : (
          <input
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            autoFocus={autoFocus}
            autoComplete={autoComplete}
            maxLength={maxLength}
            minLength={minLength}
            pattern={pattern}
            min={min}
            max={max}
            step={step}
            className={`${inputBaseClasses} ${disabled ? 'bg-gray-100' : ''}`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
        )}

        {/* End icon or adornment */}
        {(icon && iconPosition === 'right') && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        
        {endAdornment && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {endAdornment}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p 
          id={`${inputId}-error`} 
          className={`mt-1 text-xs text-red-600 ${errorClassName}`}
        >
          {error}
        </p>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <p 
          id={`${inputId}-helper`} 
          className={`mt-1 text-xs text-gray-500 ${helperClassName}`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

export default InputField;