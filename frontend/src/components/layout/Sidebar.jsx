import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [isCollapsed, setIsCollapsed] = useState(user?.role === 'staff');
  const [openDropdown, setOpenDropdown] = useState('');
  
  // Set initial collapsed state for staff when user changes
  useEffect(() => {
    if (user?.role === 'staff') {
      setIsCollapsed(true);
    }
  }, [user]);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    // Notify parent component
    if (onToggle) {
      onToggle(newState);
    }
  };

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? '' : dropdownName);
  };
  
  // Listen for toggle event from dashboard
  useEffect(() => {
    const handleToggleEvent = () => {
      toggleSidebar();
    };
    
    window.addEventListener('toggle-sidebar', handleToggleEvent);
    
    return () => {
      window.removeEventListener('toggle-sidebar', handleToggleEvent);
    };
  }, [isCollapsed]); // Include isCollapsed in dependency array
  
  // Get navigation items based on user role
  const getNavItems = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'admin':
        return [
          {
            name: 'Dashboard',
            path: '/admin/dashboard',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            )
          },
          {
            name: 'User Management',
            path: '/admin/users',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )
          },
          {
            name: 'Products',
            path: '/admin/products',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            )
          },
          {
            name: 'Order Management',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            ),
            isDropdown: true,
            items: [
              {
                name: 'Order List',
                path: '/admin/orders',
              },
              {
                name: 'Payment Verification',
                path: '/admin/payments',
              },
              {
                name: 'Create Order',
                path: '/admin/orders/create',
              }
            ]
          },
          {
            name: 'Backup & Restore',
            path: '/admin/backup',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
            )
          },
          {
            name: 'Activity Logs',
            path: '/admin/logs',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          }
        ];
      
      case 'cashier':
        return [
          {
            name: 'Dashboard',
            path: '/cashier/dashboard',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            )
          },
          {
            name: 'Create Order',
            path: '/cashier/orders/create',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          },
          {
            name: 'Order Management',
            path: '/cashier/orders',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            )
          },
          {
            name: 'Payment Verification',
            path: '/cashier/payments',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          }
        ];
      
      case 'staff':
        return [
          {
            name: 'Dashboard',
            path: '/staff/dashboard',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            )
          }
        ];
      
      case 'owner':
        return [
          {
            name: 'Dashboard',
            path: '/owner/dashboard',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            )
          },
          {
            name: 'Reports',
            path: '/owner/reports',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )
          }
        ];
      
      default:
        return [];
    }
  };
  
  const navItems = getNavItems();
  
  // Only render sidebar for dashboard pages
  if (!location.pathname.includes('/admin') && 
      !location.pathname.includes('/cashier') &&
      !location.pathname.includes('/staff') &&
      !location.pathname.includes('/owner')) {
    return null;
  }
  
  return (
    <>
      <aside 
        className={`fixed inset-y-0 left-0 bg-white shadow-lg z-20 flex flex-col transition-all duration-300 ${
          isCollapsed ? 'w-0 sm:w-20 -translate-x-full sm:translate-x-0' : 'w-64'
        }`}
      >
        <div className="flex items-center h-16 px-4 border-b">
          {!isCollapsed && (
            <div className="text-xl font-semibold text-[#620000]">MaxSupply</div>
          )}
          {isCollapsed && (
            <div className="hidden sm:block text-xl font-semibold text-[#620000] mx-auto">M</div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-2">
            {navItems.map((item, index) => (
              <li key={index}>
                {item.isDropdown ? (
                  <div>
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className={`flex items-center justify-between w-full p-3 rounded-md ${
                        location.pathname.includes(item.path)
                          ? 'bg-[#620000]/10 text-[#620000]'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="flex-shrink-0">{item.icon}</span>
                        {!isCollapsed && <span className="ml-3">{item.name}</span>}
                      </div>
                      {!isCollapsed && (
                        <svg
                          className={`w-4 h-4 transition-transform ${
                            openDropdown === item.name ? 'transform rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                    {!isCollapsed && openDropdown === item.name && (
                      <ul className="mt-2 space-y-2 pl-11">
                        {item.items.map((subItem, subIndex) => (
                          <li key={subIndex}>
                            <Link
                              to={subItem.path}
                              className={`block py-2 px-3 rounded-md ${
                                location.pathname === subItem.path
                                  ? 'bg-[#620000]/10 text-[#620000]'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-[#620000]'
                              }`}
                            >
                              {subItem.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-md ${
                    location.pathname === item.path
                      ? 'bg-[#620000]/10 text-[#620000]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && <span className="ml-3">{item.name}</span>}
                </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="px-2 pb-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center p-3 rounded-md text-gray-700 hover:bg-gray-100"
            title={isCollapsed ? "Logout" : undefined}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>
      
      {/* Toggle button outside the sidebar for better mobile experience */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-20 left-0 z-30 bg-white rounded-r-full w-8 h-8 shadow-md flex items-center justify-center 
                  hover:bg-gray-50 focus:outline-none border border-gray-200 transition-transform duration-300 ${
                    isCollapsed ? 'translate-x-0 sm:translate-x-20' : 'translate-x-64'
                  }`}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#620000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isCollapsed ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          )}
        </svg>
      </button>
      
      {/* Backdrop for mobile view */}
      {!isCollapsed && (
        <div 
          className="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}
    </>
  );
};

export default Sidebar;