const ActivityLog = require("../models/ActivityLog");

/**
 * Activity logger middleware
 * Logs important actions to the database
 */
const logActivity = async (req, res, next) => {
  // Skip logging for static assets, health checks, etc.
  if (
    req.path.startsWith("/public") ||
    req.path === "/health" ||
    req.path === "/favicon.ico" ||
    req.path.startsWith("/api/notification") || // Skip Midtrans notifications
    req.path.startsWith("/api/dashboard") || // Skip dashboard data fetching
    req.path.startsWith("/api/activity-logs") // Skip activity logs fetching
  ) {
    return next();
  }

  // Store original end function
  const originalEnd = res.end;

  // Override end function
  res.end = async function (...args) {
    // Restore original end function
    res.end = originalEnd;

    // Call original end function with all arguments
    res.end.apply(res, args);

    try {
      // Only log if user is authenticated and response is successful
      if (req.user && res.statusCode >= 200 && res.statusCode < 300) {
        // Determine if this is an important action to log
        const isImportantAction = () => {
          // Important paths to log
          const importantPaths = [
            '/users', // User management
            '/products', // Product management
            '/orders', // Order management
            '/payments', // Payment management
            '/auth/login', // Login
            '/auth/logout', // Logout
            '/reports', // Reports
            '/backup', // Backup
            '/settings' // Settings
          ];

          // Check if path contains any important segments
          return importantPaths.some(path => req.path.includes(path));
        };

        if (isImportantAction()) {
          console.log('Logging important activity for user:', req.user._id);
          
          // Determine module based on path
          const module = req.path.split("/")[2] || "other";
          console.log('Module:', module);

          // Determine action based on method and path
          let action;
          if (req.path.includes('/login')) {
            action = 'login';
          } else if (req.path.includes('/logout')) {
            action = 'logout';
          } else {
            switch (req.method) {
              case "POST":
                action = "create";
                break;
              case "PUT":
              case "PATCH":
                action = "update";
                break;
              case "DELETE":
                action = "delete";
                break;
              default:
                // Skip logging for GET requests unless it's a specific important action
                if (req.method === "GET" && !req.path.includes('/reports')) {
                  return;
                }
                action = "view";
            }
          }

          // Skip logging for certain actions
          if (action === "view" && !req.path.includes('/reports')) {
            return;
          }

          console.log('Action:', action);

          // Create log entry
          const logEntry = new ActivityLog({
            user: req.user._id,
            action,
            module,
            description: `${req.method} ${req.path}`,
            details: {
              method: req.method,
              path: req.path,
              statusCode: res.statusCode,
            },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
          });

          await logEntry.save();
          console.log('Activity logged successfully:', logEntry._id);
        }
      } else {
        console.log('Skipping activity log - not authenticated or unsuccessful response');
      }
    } catch (error) {
      console.error("Activity logging error:", error);
      // Don't throw error, just log it
    }
  };

  next();
};

module.exports = {
  logActivity,
};
