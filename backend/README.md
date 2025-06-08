konveksi-app/
├── backend/
│ ├── config/
│ │ ├── cloudinary.js # Cloudinary configuration
│ │ ├── database.js # MongoDB connection
│ │ ├── midtrans.js # Midtrans payment gateway config
│ │ └── whatsapp.js # WhatsApp API configuration
│ ├── controllers/
│ │ ├── authController.js # Authentication logic
│ │ ├── userController.js # User management
│ │ ├── productController.js # Product management
│ │ ├── orderController.js # Order management
│ │ ├── paymentController.js # Payment processing
│ │ ├── reportController.js # Report generation
│ │ └── backupController.js # DB backup & restore
│ ├── middleware/
│ │ ├── auth.js # JWT verification
│ │ ├── roleCheck.js # Role-based access control
│ │ ├── upload.js # Multer setup for Cloudinary
│ │ └── logger.js # Activity logging
│ ├── models/
│ │ ├── User.js # User schema (with roles)
│ │ ├── Product.js # Product schema
│ │ ├── Order.js # Order schema
│ │ ├── Payment.js # Payment schema
│ │ ├── ActivityLog.js # Activity log schema
│ │ └── Material.js # Material inventory schema
│ ├── routes/
│ │ ├── auth.js # Auth routes
│ │ ├── users.js # User management routes
│ │ ├── products.js # Product routes
│ │ ├── orders.js # Order routes
│ │ ├── payments.js # Payment routes
│ │ ├── reports.js # Report routes
│ │ └── backup.js # Backup routes
│ ├── utils/
│ │ ├── skuGenerator.js # SKU generation logic
│ │ ├── whatsappNotifier.js # WhatsApp notification sender
│ │ ├── priceCalculator.js # Price calculation based on attributes
│ │ └── logger.js # Logging utility
│ ├── .env # Environment variables
│ ├── .gitignore # Git ignore file
│ ├── package.json # Dependencies
│ └── server.js # Entry point

konveksi-app/
├── frontend/
│ ├── public/
│ │ ├── favicon.ico
│ │ └── assets/
│ │ └── images/
│ ├── src/
│ │ ├── assets/ # Static assets
│ │ ├── components/ # Reusable components
│ │ │ ├── common/ # Common UI components
│ │ │ │ ├── Button.jsx
│ │ │ │ ├── Card.jsx
│ │ │ │ ├── Modal.jsx
│ │ │ │ └── Table.jsx
│ │ │ ├── layout/ # Layout components
│ │ │ │ ├── Header.jsx
│ │ │ │ ├── Sidebar.jsx
│ │ │ │ ├── Footer.jsx
│ │ │ │ └── Layout.jsx
│ │ │ ├── forms/ # Form components
│ │ │ │ ├── LoginForm.jsx
│ │ │ │ ├── ProductForm.jsx
│ │ │ │ └── OrderForm.jsx
│ │ │ └── role-specific/ # Role-specific components
│ │ │ ├── admin/
│ │ │ ├── cashier/
│ │ │ ├── staff/
│ │ │ ├── owner/
│ │ │ └── customer/
│ │ ├── contexts/ # React contexts
│ │ │ ├── AuthContext.jsx # Authentication context
│ │ │ └── CartContext.jsx # Shopping cart context
│ │ ├── hooks/ # Custom hooks
│ │ │ ├── useAuth.js # Authentication hook
│ │ │ ├── useCart.js # Cart operations hook
│ │ │ └── useApi.js # API call hook
│ │ ├── pages/ # Route pages
│ │ │ ├── auth/ # Auth pages
│ │ │ │ ├── Login.jsx
│ │ │ │ └── Register.jsx
│ │ │ ├── admin/ # Admin pages
│ │ │ │ ├── Dashboard.jsx
│ │ │ │ ├── UserManagement.jsx
│ │ │ │ ├── ProductManagement.jsx
│ │ │ │ └── BackupRestore.jsx
│ │ │ ├── cashier/ # Cashier pages
│ │ │ │ ├── Dashboard.jsx
│ │ │ │ ├── ManualOrder.jsx
│ │ │ │ └── PaymentVerification.jsx
│ │ │ ├── staff/ # Staff pages
│ │ │ │ ├── Dashboard.jsx
│ │ │ │ └── ProductionManagement.jsx
│ │ │ ├── owner/ # Owner pages
│ │ │ │ ├── Dashboard.jsx
│ │ │ │ └── Reports.jsx
│ │ │ ├── customer/ # Customer pages
│ │ │ │ ├── Dashboard.jsx
│ │ │ │ ├── Products.jsx
│ │ │ │ ├── ProductDetail.jsx
│ │ │ │ ├── Cart.jsx
│ │ │ │ ├── Checkout.jsx
│ │ │ │ └── OrderHistory.jsx
│ │ │ ├── HomePage.jsx # Landing page
│ │ │ └── NotFound.jsx # 404 page
│ │ ├── services/ # API services
│ │ │ ├── api.js # Axios instance config
│ │ │ ├── authService.js # Auth API calls
│ │ │ ├── productService.js # Products API calls
│ │ │ ├── orderService.js # Orders API calls
│ │ │ └── paymentService.js # Payment API calls
│ │ ├── utils/ # Utility functions
│ │ │ ├── formatters.js # Data formatters
│ │ │ ├── validators.js # Form validators
│ │ │ └── constants.js # App constants
│ │ ├── App.jsx # Main app component
│ │ ├── main.jsx # Entry point
│ │ └── routes.jsx # Route definitions
│ ├── .env # Environment variables
│ ├── .gitignore
│ ├── index.html # HTML template
│ ├── package.json # Dependencies
│ ├── vite.config.js # Vite configuration
│ ├── tailwind.config.js # Tailwind CSS config
│ └── postcss.config.js # PostCSS config
