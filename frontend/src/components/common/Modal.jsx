import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal component for displaying content in a dialog
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  isLoading = false,
  className = '',
  contentClassName = '',
  bodyClassName = '',
  titleClassName = '',
  footerClassName = '',
  backdropClassName = '',
  zIndex = 50,
  centered = true,
  id,
}) => {
  const modalRef = useRef(null);
  const initialFocusRef = useRef(null);

  // Size variants
  const sizeClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent scrolling on body when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);
  
  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  // Create portal for modal
  return createPortal(
    <div
      className={`fixed inset-0 flex ${centered ? 'items-center' : 'items-start pt-16'} justify-center z-${zIndex} ${backdropClassName}`}
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      data-testid="modal-overlay"
      id={id ? `${id}-overlay` : undefined}
      aria-labelledby={`${id}-title`}
    >
      {/* Backdrop with animation */}
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-in-out"></div>

      {/* Modal content with animation */}
      <div
        ref={modalRef}
        className={`
          relative w-full ${sizeClasses[size] || sizeClasses.md} 
          mx-auto rounded-xl shadow-2xl bg-white 
          transform transition-all duration-300 ease-out
          scale-100 opacity-100 
          ${className}
        `}
        data-testid="modal"
        id={id}
        tabIndex={-1}
        role="dialog"
      >
        {/* Modal header */}
        <div className={`px-6 py-4 border-b border-gray-200 flex justify-between items-center ${titleClassName}`}>
          {title && (
            <h3 
              className="text-lg font-semibold text-gray-900"
              id={`${id}-title`}
            >
              {title}
            </h3>
          )}
          {showCloseButton && (
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={onClose}
              aria-label="Close"
              data-testid="modal-close-button"
              ref={initialFocusRef}
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Modal body */}
        <div className={`p-6 ${isLoading ? 'opacity-50' : ''} ${bodyClassName}`}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          {children}
        </div>

        {/* Modal footer */}
        {footer && (
          <div className={`px-6 py-4 border-t border-gray-200 ${footerClassName}`}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;