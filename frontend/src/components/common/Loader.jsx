import React from 'react';

/**
 * Loading spinner with various sizes and options
 */
const Loader = ({
  size = 'medium',
  color = 'primary',
  fullScreen = false,
  withText = false,
  text = 'Loading...',
  className = '',
}) => {
  // Size mapping
  const sizeMap = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xlarge: 'h-16 w-16',
  };
  
  // Color mapping
  const colorMap = {
    primary: 'text-[#620000]',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    danger: 'text-red-600',
    warning: 'text-yellow-500',
    info: 'text-[#4A0000]',
    light: 'text-gray-200',
    dark: 'text-gray-800',
    white: 'text-white',
  };

  // Determine classes based on props
  const spinnerSizeClass = sizeMap[size] || sizeMap.medium;
  const spinnerColorClass = colorMap[color] || colorMap.primary;
  
  // Spinner component
  const spinner = (
    <svg
      className={`animate-spin ${spinnerSizeClass} ${spinnerColorClass} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      data-testid="loading-spinner"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  // If fullScreen, render with fixed positioning and overlay
  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50"
        data-testid="fullscreen-loader"
      >
        <div className="flex flex-col items-center">
          {spinner}
          {withText && (
            <p className={`mt-3 font-medium ${colorMap.white}`}>{text}</p>
          )}
        </div>
      </div>
    );
  }

  // Regular loader with optional text
  return (
    <div
      className="flex flex-col items-center justify-center"
      data-testid="loader"
    >
      {spinner}
      {withText && (
        <p className={`mt-2 text-sm font-medium ${spinnerColorClass}`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;