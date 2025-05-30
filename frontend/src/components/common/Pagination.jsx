import React from 'react';

/**
 * Reusable pagination component
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showPageNumbers = true,
  maxPageLinks = 5,
  className = '',
  size = 'md',
  variant = 'default',
}) => {
  // Don't render if only one page
  if (totalPages <= 1) return null;

  // Determine which page numbers to display
  const getVisiblePageNumbers = () => {
    const pages = [];
    const halfMaxPages = Math.floor(maxPageLinks / 2);
    
    let startPage = Math.max(1, currentPage - halfMaxPages);
    let endPage = Math.min(totalPages, startPage + maxPageLinks - 1);
    
    // Adjust start page if end page is maxed out
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxPageLinks + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  // Check if current page is first or last
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  // Size variants
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  // Style variants
  const variants = {
    default: {
      container: 'flex items-center justify-between',
      button: 'border border-gray-300 bg-white text-gray-500 hover:bg-gray-50',
      active: 'z-10 bg-[#620000]/10 border-[#620000] text-[#620000]',
      disabled: 'opacity-50 cursor-not-allowed',
    },
    simple: {
      container: 'flex items-center space-x-2',
      button: 'text-gray-500 hover:text-gray-700',
      active: 'text-[#620000] font-medium',
      disabled: 'opacity-50 cursor-not-allowed',
    },
    rounded: {
      container: 'flex items-center space-x-2',
      button: 'rounded-full border border-gray-300 bg-white text-gray-500 hover:bg-gray-50',
      active: 'z-10 bg-[#620000]/10 border-[#620000] text-[#620000]',
      disabled: 'opacity-50 cursor-not-allowed',
    },
  };

  const variantStyle = variants[variant] || variants.default;
  const buttonSize = sizeClasses[size] || sizeClasses.md;

  // Common button classes
  const baseButtonClasses = `${buttonSize} flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#620000] focus:ring-offset-1`;
  const buttonClasses = `${baseButtonClasses} ${variantStyle.button}`;
  const activeButtonClasses = `${baseButtonClasses} ${variantStyle.active}`;
  const disabledButtonClasses = `${baseButtonClasses} ${variantStyle.disabled} ${variantStyle.button}`;

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  const visiblePageNumbers = showPageNumbers ? getVisiblePageNumbers() : [];

  return (
    <nav className={`${variantStyle.container} ${className}`} aria-label="Pagination">
      {/* Previous button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={isFirstPage}
        className={isFirstPage ? disabledButtonClasses : buttonClasses}
        aria-label="Previous page"
      >
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span className="sr-only">Previous</span>
      </button>

      {/* Page numbers */}
      {showPageNumbers && (
        <div className="hidden sm:flex sm:items-center">
          {visiblePageNumbers[0] > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className={buttonClasses}
                aria-label="Go to page 1"
              >
                1
              </button>
              {visiblePageNumbers[0] > 2 && (
                <span className="mx-2 text-gray-500">...</span>
              )}
            </>
          )}

          {visiblePageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={page === currentPage ? activeButtonClasses : buttonClasses}
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </button>
          ))}

          {visiblePageNumbers[visiblePageNumbers.length - 1] < totalPages && (
            <>
              {visiblePageNumbers[visiblePageNumbers.length - 1] < totalPages - 1 && (
                <span className="mx-2 text-gray-500">...</span>
              )}
              <button
                onClick={() => handlePageChange(totalPages)}
                className={buttonClasses}
                aria-label={`Go to page ${totalPages}`}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
      )}

      {/* Current page indicator for mobile */}
      {showPageNumbers && (
        <div className="sm:hidden text-sm text-gray-700">
          <span>Page {currentPage} of {totalPages}</span>
        </div>
      )}

      {/* Next button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={isLastPage}
        className={isLastPage ? disabledButtonClasses : buttonClasses}
        aria-label="Next page"
      >
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
        <span className="sr-only">Next</span>
      </button>
    </nav>
  );
};

export default Pagination;