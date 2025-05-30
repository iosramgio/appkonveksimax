import React from 'react';

/**
 * Reusable select field component
 */
const SelectField = ({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = 'Pilih opsi',
  disabled = false,
  required = false,
  error,
  helperText,
  className = '',
  selectClassName = '',
  labelClassName = '',
  errorClassName = '',
  helperClassName = '',
  icon,
  fullWidth = true,
  size = 'md',
  variant = 'outline',
  multiple = false,
  showEmptyOption = true,
  emptyOptionLabel = '-- Pilih --',
  optionLabelKey = 'label',
  optionValueKey = 'value',
  ...props
}) => {
  // Generate an ID if not provided
  const selectId = id || `select-${name}-${Math.random().toString(36).substr(2, 9)}`;

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

  // Select base classes
  const selectBaseClasses = `
    block rounded-md shadow-sm appearance-none
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}
    ${sizeClasses[size] || sizeClasses.md}
    ${variantClasses[variant] || variantClasses.outline}
    ${errorClasses}
    ${icon ? 'pl-10' : ''}
    ${selectClassName}
  `;

  // Process options to handle different formats
  const normalizeOptions = (options) => {
    if (!Array.isArray(options)) return [];

    // Check if options are simple strings or numbers
    if (options.length > 0 && (typeof options[0] === 'string' || typeof options[0] === 'number')) {
      return options.map(opt => ({ [optionLabelKey]: opt, [optionValueKey]: opt }));
    }

    return options;
  };

  const normalizedOptions = normalizeOptions(options);

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={selectId} 
          className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      {/* Select wrapper for icon */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}

        {/* Select field */}
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          multiple={multiple}
          className={selectBaseClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          {...props}
        >
          {/* Empty option */}
          {showEmptyOption && !multiple && (
            <option value="">{emptyOptionLabel}</option>
          )}
          
          {/* Options from array */}
          {normalizedOptions.map((option, index) => (
            <option 
              key={`${option[optionValueKey]}-${index}`} 
              value={option[optionValueKey]}
              disabled={option.disabled}
            >
              {option[optionLabelKey]}
            </option>
          ))}
        </select>

        {/* Custom dropdown icon */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p 
          id={`${selectId}-error`} 
          className={`mt-1 text-xs text-red-600 ${errorClassName}`}
        >
          {error}
        </p>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <p 
          id={`${selectId}-helper`} 
          className={`mt-1 text-xs text-gray-500 ${helperClassName}`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

export default SelectField;