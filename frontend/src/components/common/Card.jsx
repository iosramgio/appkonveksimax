import React from 'react';

/**
 * Card component for displaying content in a card layout
 */
const Card = ({
  title,
  subtitle,
  children,
  footer,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  footerClassName = '',
  noPadding = false,
  bordered = true,
  shadow = 'md',
  rounded = 'md',
  headerAction,
  onClick,
  isHoverable = false,
}) => {
  // Shadow variants
  const shadowVariants = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  // Border radius variants
  const roundedVariants = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  // Apply styles based on props
  const cardClasses = `
    ${bordered ? 'border border-gray-200' : ''}
    ${shadowVariants[shadow] || shadowVariants.md}
    ${roundedVariants[rounded] || roundedVariants.md}
    bg-white overflow-hidden
    ${isHoverable ? 'transition-shadow hover:shadow-lg' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  const bodyClasses = `
    ${noPadding ? '' : 'p-5'}
    ${bodyClassName}
  `;

  return (
    <div 
      className={cardClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {/* Card Header */}
      {(title || subtitle || headerAction) && (
        <div className={`border-b border-gray-200 px-5 py-4 flex justify-between items-center ${headerClassName}`}>
          <div>
            {title && (
              <h3 className="text-lg font-medium text-gray-800">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
          {headerAction && (
            <div className="ml-4">{headerAction}</div>
          )}
        </div>
      )}

      {/* Card Body */}
      <div className={bodyClasses}>{children}</div>

      {/* Card Footer */}
      {footer && (
        <div className={`border-t border-gray-200 px-5 py-4 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;