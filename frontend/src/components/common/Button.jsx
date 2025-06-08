import React from 'react';

/**
 * Button component with various styles
 */
const Button = ({
  children,
  label,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  className = '',
  icon = null,
  iconPosition = 'left',
  isLoading = false,
  loading,
  ...props
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center rounded font-medium transition-all focus:outline-none';
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-[#620000] text-white hover:bg-[#8B0000] focus:ring-2 focus:ring-[#4A0000] focus:ring-offset-2',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2',
    info: 'bg-[#4A0000] text-white hover:bg-[#620000] focus:ring-2 focus:ring-[#8B0000] focus:ring-offset-2',
    light: 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2',
    dark: 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-2 focus:ring-gray-700 focus:ring-offset-2',
    link: 'bg-transparent text-[#620000] hover:text-[#8B0000] underline p-0 hover:bg-transparent focus:ring-0',
    outline: 'bg-transparent border border-current text-[#620000] hover:bg-[#620000]/10 focus:ring-2 focus:ring-[#620000] focus:ring-offset-2',
  };
  
  // Size classes
  const sizeClasses = {
    small: 'text-xs px-3 py-1.5',
    medium: 'text-sm px-4 py-2',
    large: 'text-base px-5 py-2.5',
    xlarge: 'text-lg px-6 py-3',
  };
  
  // Icon positioning and spacing
  const iconSpacing = iconPosition === 'left' ? 'mr-2' : 'ml-2';
  
  // Disabled and width classes
  const disabledClasses = disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer';
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Loading state
  const loadingIcon = (
    <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        ${baseClasses}
        ${variantClasses[variant] || variantClasses.primary}
        ${sizeClasses[size] || sizeClasses.medium}
        ${disabledClasses}
        ${widthClasses}
        ${className}
      `}
      {...props}
    >
      {isLoading && (
        <span className="mr-2">{loadingIcon}</span>
      )}
      
      {!isLoading && icon && iconPosition === 'left' && (
        <span className={iconSpacing}>{icon}</span>
      )}
      
      {label || children}
      
      {!isLoading && icon && iconPosition === 'right' && (
        <span className={iconSpacing}>{icon}</span>
      )}
    </button>
  );
};

export default Button;