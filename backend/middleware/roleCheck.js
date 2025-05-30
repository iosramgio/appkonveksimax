/**
 * Role-based middleware for access control
 *
 * @param {string[]} allowedRoles - Array of roles allowed to access the route
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Authentication required or role not set on user object" });
    }

    const userRole = req.user.role.toLowerCase();

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message:
          "Access denied. You do not have permission to perform this action.",
      });
    }

    next();
  };
};

// Export specific role check middleware functions for convenience
module.exports = {
  checkRole,
  isAdmin: checkRole(["admin"]),
  isCashier: checkRole(["admin", "cashier"]),
  isStaff: checkRole(["admin", "staff"]),
  isOwner: checkRole(["admin", "owner"]),
  isCustomer: checkRole(["customer"]),
  isAdminOrOwner: checkRole(["admin", "owner"]),
  isAdminOrCashier: checkRole(["admin", "cashier"]),
  isAdminOrStaff: checkRole(["admin", "staff"]),
  isNotCustomer: checkRole(["admin", "cashier", "staff", "owner"]),
};
