import React from 'react';

/**
 * Form section component for grouping form fields
 */
const FormSection = ({
  title,
  subtitle,
  description,
  children,
  collapsible = false,
  initialCollapsed = false,
  className = '',
  titleClassName = '',
  descriptionClassName = '',
  contentClassName = '',
  bordered = true,
  divided = true,
  padding = true,
  badge,
  action,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(initialCollapsed);

  // Toggle collapsible section
  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Simplified version (new style)
  if (!collapsible && !action && !badge && !description) {
    return (
      <div 
        className={`
          ${bordered ? 'border border-gray-200 rounded-lg p-4 mb-6' : ''}
          ${className}
        `}
      >
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-900">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className="space-y-4">
          {children}
        </div>
      </div>
    );
  }

  // Original version (with all options)
  return (
    <div 
      className={`
        ${bordered ? 'border border-gray-200 rounded-md' : ''}
        ${className}
      `}
    >
      {/* Section header */}
      {(title || description || action) && (
        <div 
          className={`
            ${padding ? 'px-6 py-4' : 'py-3'}
            ${divided ? 'border-b border-gray-200' : ''}
            bg-gray-50 rounded-t-md
            ${collapsible ? 'cursor-pointer' : ''}
          `}
          onClick={toggleCollapse}
        >
          <div className="flex justify-between items-center">
            <div>
              {/* Title and optional badge */}
              <div className="flex items-center">
                {title && (
                  <h3 className={`text-lg font-medium text-gray-900 ${titleClassName}`}>
                    {title}
                  </h3>
                )}
                
                {badge && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#620000]/10 text-[#620000]">
                    {badge}
                  </span>
                )}
                
                {/* Collapsible indicator */}
                {collapsible && (
                  <button 
                    type="button"
                    className="ml-2 text-gray-400 hover:text-gray-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCollapse();
                    }}
                  >
                    <svg 
                      className={`h-5 w-5 transform ${isCollapsed ? '' : 'rotate-180'}`} 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Description or Subtitle */}
              {description ? (
                <p className={`mt-1 text-sm text-gray-500 ${descriptionClassName}`}>
                  {description}
                </p>
              ) : subtitle && (
                <p className={`mt-1 text-sm text-gray-500 ${descriptionClassName}`}>
                  {subtitle}
                </p>
              )}
            </div>
            
            {/* Action button */}
            {action && (
              <div onClick={e => e.stopPropagation()}>
                {action}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Section content */}
      {!isCollapsed && (
        <div className={`${padding ? 'p-6' : ''} ${contentClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default FormSection;