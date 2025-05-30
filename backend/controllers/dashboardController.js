const Order = require("../models/Order");
const Product = require("../models/Product");
const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");
const mongoose = require('mongoose');

/**
 * Get admin dashboard data
 */
const getAdminDashboard = async (req, res) => {
  try {
    // Get total sales
    const totalSales = await Order.aggregate([
      { $match: { status: { $in: ['Selesai Produksi', 'Siap Kirim', 'Selesai'] } } },
      { $group: { _id: null, total: { $sum: "$paymentDetails.total" } } }
    ]);

    // Get total orders
    const totalOrders = await Order.countDocuments();

    // Get pending orders
    const pendingOrders = await Order.countDocuments({ status: 'Pesanan Diterima' });
    
    // Get active users count
    const activeUsers = await User.countDocuments({ isActive: true });
    
    // Get total products count
    const totalProducts = await Product.countDocuments();

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customer', 'name email');

    // Get activity logs
    const activityLogs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name');

    // Get data from previous week for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const previousWeekStart = new Date(today);
    previousWeekStart.setDate(today.getDate() - 7);
    
    const previousWeekSales = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: previousWeekStart, $lt: today },
          status: { $in: ['Selesai Produksi', 'Siap Kirim', 'Selesai'] }
        }
      },
      { $group: { _id: null, total: { $sum: "$paymentDetails.total" } } }
    ]);

    const previousWeekOrders = await Order.countDocuments({
      createdAt: { $gte: previousWeekStart, $lt: today }
    });

    // Calculate growth percentages
    let salesGrowth = 0;
    if (previousWeekSales[0]?.total > 0) {
      salesGrowth = Math.round(((totalSales[0]?.total || 0) - previousWeekSales[0].total) / previousWeekSales[0].total * 100);
    }

    let ordersGrowth = 0;
    if (previousWeekOrders > 0) {
      ordersGrowth = Math.round(((totalOrders - previousWeekOrders) / previousWeekOrders) * 100);
    }

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? Math.round(totalSales[0]?.total / totalOrders) : 0;

    // Get sales chart data (last 7 days)
    const salesChartData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          status: { $in: ['Selesai Produksi', 'Siap Kirim', 'Selesai'] }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$paymentDetails.total" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      stats: {
        totalSales: totalSales[0]?.total || 0,
        totalOrders,
        pendingOrders,
        activeUsers,
        totalProducts,
        averageOrderValue,
        salesGrowth,
        ordersGrowth
      },
      recentOrders,
      activityLogs,
      salesChartData
    });
  } catch (error) {
    console.error("Get admin dashboard error:", error);
    res.status(500).json({ 
      message: "Failed to retrieve dashboard data", 
      error: error.message 
    });
  }
};

/**
 * Get cashier dashboard data
 */
const getCashierDashboard = async (req, res) => {
  try {
    // Define date ranges for current and previous period (last 7 days)
    const today = new Date();
    const N = 7; // Number of days for the period

    const currentPeriodEndDate = new Date(today);
    currentPeriodEndDate.setHours(23, 59, 59, 999);
    const currentPeriodStartDate = new Date(today);
    currentPeriodStartDate.setDate(today.getDate() - (N - 1)); 
    currentPeriodStartDate.setHours(0, 0, 0, 0);

    const previousPeriodEndDate = new Date(currentPeriodStartDate);
    previousPeriodEndDate.setDate(previousPeriodEndDate.getDate() - 1);
    previousPeriodEndDate.setHours(23, 59, 59, 999);
    const previousPeriodStartDate = new Date(previousPeriodEndDate);
    previousPeriodStartDate.setDate(previousPeriodEndDate.getDate() - (N - 1));
    previousPeriodStartDate.setHours(0, 0, 0, 0);

    // Get total sales for current period
    const currentSalesAggregation = await Order.aggregate([
      { $match: { status: "Selesai", createdAt: { $gte: currentPeriodStartDate, $lte: currentPeriodEndDate } } },
      { $group: { _id: null, total: { $sum: "$paymentDetails.total" }, count: { $sum: 1 } } }
    ]);
    const currentPeriodSales = currentSalesAggregation[0]?.total || 0;
    const currentPeriodOrderCount = currentSalesAggregation[0]?.count || 0;

    // Get total sales for previous period
    const previousSalesAggregation = await Order.aggregate([
      { $match: { status: "Selesai", createdAt: { $gte: previousPeriodStartDate, $lte: previousPeriodEndDate } } },
      { $group: { _id: null, total: { $sum: "$paymentDetails.total" }, count: { $sum: 1 } } }
    ]);
    const previousPeriodSales = previousSalesAggregation[0]?.total || 0;
    const previousPeriodOrderCount = previousSalesAggregation[0]?.count || 0;

    // Calculate growth percentages
    let salesGrowth = 0;
    if (previousPeriodSales > 0) {
      salesGrowth = Math.round(((currentPeriodSales - previousPeriodSales) / previousPeriodSales) * 100);
    } else if (currentPeriodSales > 0) {
      salesGrowth = 100; // Infinite growth if previous was 0 and current is > 0
    }

    let ordersGrowth = 0;
    if (previousPeriodOrderCount > 0) {
      ordersGrowth = Math.round(((currentPeriodOrderCount - previousPeriodOrderCount) / previousPeriodOrderCount) * 100);
    } else if (currentPeriodOrderCount > 0) {
      ordersGrowth = 100; // Infinite growth
    }

    // Get all-time completed sales for total sales display
    const allTimeSalesAggregation = await Order.aggregate([
      { $match: { status: "Selesai" } }, 
      { $group: { _id: null, total: { $sum: "$paymentDetails.total" } } }
    ]);
    const totalSales = allTimeSalesAggregation[0]?.total || 0;

    // Get total orders
    const totalOrders = await Order.countDocuments({ status: "Selesai" });

    // Get pending orders
    const pendingOrders = await Order.countDocuments({
      status: 'Pesanan Diterima'
    });

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customer', 'name email');

    // Get activity logs
    const activityLogs = await ActivityLog.find({
      action: { $in: ['create_order', 'update_order', 'payment'] }
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name');
    
    // Get pending payments for verification
    const Payment = mongoose.model('Payment');
    const pendingVerifications = await Payment.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: 'order',
        select: 'orderNumber customer totalAmount status paymentDetails',
        populate: {
          path: 'customer',
          select: 'name email'
        }
      });

    // Filter out orders with unpaid status
    const filteredVerifications = pendingVerifications.filter(payment => {
      // Skip if order doesn't exist
      if (!payment.order) {
        return false;
      }
      
      // Check if the order has "pending_payment" status
      if (payment.order.status === 'pending_payment') {
        return false;
      }
      
      // Check payment details in order
      const paymentDetails = payment.order.paymentDetails;
      if (paymentDetails) {
        // For down payment verification
        if (payment.paymentType === 'downPayment' && 
            paymentDetails.downPayment && 
            paymentDetails.downPayment.status === 'pending') {
          return true;
        }
        
        // For remaining payment verification
        if (payment.paymentType === 'remainingPayment' && 
            paymentDetails.remainingPayment && 
            paymentDetails.remainingPayment.status === 'pending') {
          return true;
        }
        
        // For full payment verification
        if (payment.paymentType === 'fullPayment') {
          return true;
        }
        
        // Default case - only show if it's a valid payment verification
        return false;
      }
      
      // If we can't determine payment details, don't show
      return false;
    });

    res.json({
      stats: {
        totalSales,
        totalOrders,
        pendingOrders,
        averageOrderValue,
        salesGrowth,
        ordersGrowth,
        todayOrders: currentPeriodOrderCount,
        todayPayments: pendingVerifications.length
      },
      recentOrders,
      activityLogs,
      pendingVerifications: filteredVerifications
    });
  } catch (error) {
    console.error("Get cashier dashboard error:", error);
    res.status(500).json({ 
      message: "Failed to retrieve dashboard data", 
      error: error.message 
    });
  }
};

/**
 * Get staff dashboard data
 */
const getStaffDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Awal hari ini
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Awal besok

    // Cek apakah includeAll diberikan di query
    const includeAll = req.query.includeAll === 'true';
    console.log('DASHBOARD DEBUG: includeAll parameter =', includeAll, 'Raw value:', req.query.includeAll);
    
    // Definisikan filter dasar untuk pesanan
    const baseFilter = {};
    
    // Jika includeAll tidak diberikan atau false, hanya tampilkan pesanan online (non-offline)
    if (!includeAll) {
      baseFilter.isOfflineOrder = { $ne: true };
      console.log('DASHBOARD DEBUG: Filtering online orders only');
    } else {
      console.log('DASHBOARD DEBUG: Including ALL orders (online & offline)');
    }

    // Pesanan baru hari ini (asumsi createdAt adalah field tanggal pembuatan)
    const newOrdersToday = await Order.countDocuments({
      ...baseFilter,
      createdAt: { $gte: today, $lt: tomorrow },
    });

    // Pesanan selesai hari ini (asumsi completedAt adalah field tanggal penyelesaian, dan status "Selesai")
    // atau sesuaikan dengan field dan status yang Anda gunakan untuk menandakan selesai pada hari itu
    const completedOrdersToday = await Order.countDocuments({
      ...baseFilter,
      status: 'Selesai',
      // Jika Anda punya field seperti 'productionCompletedAt' atau 'statusUpdatedAt' yang relevan:
      // statusUpdatedAt: { $gte: today, $lt: tomorrow }, 
      // Jika tidak, Anda mungkin perlu logika berbeda jika 'Selesai' bisa berarti selesai kapan saja
      // Untuk contoh ini, kita asumsikan status 'Selesai' dan ada cara menandai itu selesai hari ini
      // Jika hanya berdasarkan status, ini akan menghitung semua yang statusnya 'Selesai'
      // Jika completedOrdersToday Anda sebelumnya sudah benar, gunakan logika itu.
      // Ini adalah contoh, sesuaikan dengan definisi "selesai hari ini" di sistem Anda.
      // Mungkin Anda membandingkan tanggal perubahan status terakhir ke "Selesai"
      // Untuk penyederhanaan, jika `completedOrdersToday` sudah dihitung dengan benar sebelumnya,
      // Anda bisa langsung pakai variabel itu.
      // Untuk perhitungan persentase, kita lebih butuh completedOrders (total) dan inProgressOrders (total).
    });
    
    // Total semua pesanan sepanjang waktu
    const totalOrdersAllTime = await Order.countDocuments(baseFilter);

    // --- Tambahan untuk ProductionStats ---
    // Total pesanan dengan status "Selesai Produksi" (bukan hanya hari ini)
    const completedOrders = await Order.countDocuments({ ...baseFilter, status: 'Selesai Produksi' });

    // Total pesanan dengan status "Diproses"
    const inProgressOrders = await Order.countDocuments({ ...baseFilter, status: 'Diproses' });
    
    // Total pesanan dengan status "Siap Kirim" - untuk ditampilkan sebagai "Selesai"
    const readyToShipOrders = await Order.countDocuments({ ...baseFilter, status: 'Siap Kirim' });
    
    // (Opsional) Total pendapatan dari pesanan yang sudah "Selesai Produksi"
    // Asumsi ada field totalPrice di Order
    const revenueGeneratingOrders = await Order.find({ ...baseFilter, status: 'Selesai Produksi' });
    const totalRevenue = revenueGeneratingOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    // --- Akhir Tambahan ---

    // Ambil beberapa pesanan terbaru untuk ditampilkan (misalnya 10 terbaru)
    const recentOrders = await Order.find({
      ...baseFilter,
      status: { $in: ['Diproses', 'Selesai Produksi', 'Siap Kirim'] }
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('customer', 'name')
      .populate('items.product', 'name images'); // Populate product with name and images

    console.log('DASHBOARD DEBUG: Recent orders found:', recentOrders.length);
    
    // Debug order types
    const orderTypes = {online: 0, offline: 0};
    recentOrders.forEach(order => {
      if (order.isOfflineOrder) {
        orderTypes.offline++;
      } else {
        orderTypes.online++;
      }
    });
    console.log('DASHBOARD DEBUG: Order types breakdown:', orderTypes);

    // Ambil log aktivitas (jika ada)
    // const activityLogs = await ActivityLog.find().sort({ createdAt: -1 }).limit(10);

    const stats = {
      totalOrdersAllTime,
      // Pastikan completedOrdersToday ini adalah definisi yang benar untuk kartu atas
      // Jika berbeda dengan 'completedOrders' (total selesai produksi), pertahankan keduanya
      completedOrdersToday, 
      newOrdersToday,
      completedOrders,    // Data untuk ProductionStats
      inProgressOrders,   // Data untuk ProductionStats
      readyToShipOrders,  // Pesanan siap kirim untuk ditampilkan sebagai "Selesai"
      totalRevenue,       // Data untuk ProductionStats (Opsional)
      // Anda bisa juga menambahkan totalOrders untuk ProductionStats di sini jika definisinya berbeda
      // misalnya: totalOrdersForProduction: inProgressOrders + completedOrders,
    };

    res.json({
      stats,
      orders: recentOrders, // Mengirim pesanan terbaru
      // activityLogs, // Kirim jika ada
    });
  } catch (error) {
    console.error('Error fetching staff dashboard data:', error);
    res.status(500).json({ message: 'Gagal memuat data dashboard staf' });
  }
};

/**
 * Get owner dashboard data
 */
const getOwnerDashboard = async (req, res) => {
  try {
    // Define date ranges for current and previous period (e.g., last 7 days)
    const today = new Date();
    const N = 7; // Number of days for the period

    const currentPeriodEndDate = new Date(today);
    currentPeriodEndDate.setHours(23, 59, 59, 999);
    const currentPeriodStartDate = new Date(today);
    currentPeriodStartDate.setDate(today.getDate() - (N - 1)); 
    currentPeriodStartDate.setHours(0, 0, 0, 0);

    const previousPeriodEndDate = new Date(currentPeriodStartDate);
    previousPeriodEndDate.setDate(previousPeriodEndDate.getDate() - 1);
    previousPeriodEndDate.setHours(23, 59, 59, 999);
    const previousPeriodStartDate = new Date(previousPeriodEndDate);
    previousPeriodStartDate.setDate(previousPeriodEndDate.getDate() - (N - 1));
    previousPeriodStartDate.setHours(0, 0, 0, 0);

    // Get total sales for current period
    const currentSalesAggregation = await Order.aggregate([
      { $match: { status: "Selesai", createdAt: { $gte: currentPeriodStartDate, $lte: currentPeriodEndDate } } },
      { $group: { _id: null, total: { $sum: "$paymentDetails.total" }, count: { $sum: 1 } } }
    ]);
    const currentPeriodSales = currentSalesAggregation[0]?.total || 0;
    const currentPeriodOrderCount = currentSalesAggregation[0]?.count || 0;

    // Get total sales for previous period
    const previousSalesAggregation = await Order.aggregate([
      { $match: { status: "Selesai", createdAt: { $gte: previousPeriodStartDate, $lte: previousPeriodEndDate } } },
      { $group: { _id: null, total: { $sum: "$paymentDetails.total" }, count: { $sum: 1 } } }
    ]);
    const previousPeriodSales = previousSalesAggregation[0]?.total || 0;
    const previousPeriodOrderCount = previousSalesAggregation[0]?.count || 0;

    // Calculate growth percentages
    let salesGrowthPercentage = 0;
    if (previousPeriodSales > 0) {
      salesGrowthPercentage = Math.round(((currentPeriodSales - previousPeriodSales) / previousPeriodSales) * 100);
    } else if (currentPeriodSales > 0) {
      salesGrowthPercentage = 100; // Infinite growth if previous was 0 and current is > 0
    }

    let ordersGrowthPercentage = 0;
    if (previousPeriodOrderCount > 0) {
      ordersGrowthPercentage = Math.round(((currentPeriodOrderCount - previousPeriodOrderCount) / previousPeriodOrderCount) * 100);
    } else if (currentPeriodOrderCount > 0) {
      ordersGrowthPercentage = 100; // Infinite growth
    }

    // Fallback to overall total sales if not focusing on period-based for main display
    // For the main "Total Penjualan" card, let's use the all-time completed sales for now as previously established
    const allTimeSalesAggregation = await Order.aggregate([
        { $match: { status: "Selesai" } }, 
        { $group: { _id: null, total: { $sum: "$paymentDetails.total" } } }
      ]);
    const actualTotalSales = allTimeSalesAggregation[0]?.total || 0;

    const totalOrders = await Order.countDocuments({ status: "Selesai" }); // Count of all completed orders for AOV
    const pendingOrders = await Order.countDocuments({ status: "Pesanan Diterima" });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments();
    const calculatedAverageOrderValue = totalOrders > 0 ? Math.round(actualTotalSales / totalOrders) : 0;

    // Get sales chart data (last 30 days - daily breakdown)
    const salesChartData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          status: "Selesai"
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          dailyRevenue: { $sum: "$paymentDetails.total" },
          dailyOrderCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          dailyRevenue: 1,
          dailyOrderCount: 1
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Get top selling products
    const topProducts = await Order.aggregate([
      { $match: { status: "Selesai" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.priceDetails.total" }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          name: "$product.name",
          totalSold: 1,
          revenue: 1
        }
      }
    ]);

    // Calculate business metrics
    const businessMetrics = {
      conversionRate: 0,
      averageOrderValue: calculatedAverageOrderValue
    };

    // Calculate production status counts
    const statusPesananDiterima = pendingOrders; // Already calculated for stats.pendingOrders
    const statusDiproses = await Order.countDocuments({ status: "Diproses" });
    const statusSelesaiProduksi = await Order.countDocuments({ status: "Selesai Produksi" });
    const statusSiapDikirim = await Order.countDocuments({ status: "Siap Dikirim" });
    const statusSelesai = await Order.countDocuments({ status: "Selesai" });

    const productionStatusData = {
      "Pesanan Pending": statusPesananDiterima,
      "Sedang Diproses": statusDiproses,
      "Selesai Produksi": statusSelesaiProduksi,
      "Siap Dikirim": statusSiapDikirim,
      "Selesai": statusSelesai,
    };

    // --- Calculate Summary Report Data ---

    // 1. Rata-rata Waktu Produksi
    // For simplicity, we'll average the `productionTime` field from the Product model for products involved in COMPLETED orders.
    // A more accurate way might involve tracking actual production start/end dates per order item.
    const completedOrdersWithProductionTime = await Order.aggregate([
      { $match: { status: "Selesai" } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: null,
          totalProductionTime: { $sum: "$productDetails.productionTime" }, // Assuming productionTime is in days
          count: { $sum: 1 }
        }
      }
    ]);
    let averageProductionTime = 0;
    if (completedOrdersWithProductionTime.length > 0 && completedOrdersWithProductionTime[0].count > 0) {
      averageProductionTime = Math.round(completedOrdersWithProductionTime[0].totalProductionTime / completedOrdersWithProductionTime[0].count);
    }

    // 2. Persentase DP
    // Calculate average DP percentage from orders that had a DP
    const ordersWithDP = await Order.aggregate([
      { $match: { "paymentDetails.downPayment.amount": { $gt: 0 }, "paymentDetails.total": { $gt: 0 } } },
      {
        $project: {
          dpPercentage: { $multiply: [{ $divide: ["$paymentDetails.downPayment.amount", "$paymentDetails.total"] }, 100] }
        }
      },
      {
        $group: {
          _id: null,
          totalDpPercentage: { $sum: "$dpPercentage" },
          count: { $sum: 1 }
        }
      }
    ]);
    let averageDpPercentage = 0;
    if (ordersWithDP.length > 0 && ordersWithDP[0].count > 0) {
      averageDpPercentage = Math.round(ordersWithDP[0].totalDpPercentage / ordersWithDP[0].count);
    }

    // 3. Produk Aktif
    const activeProductsCount = await Product.countDocuments({ availability: true }); // Using 'availability' field

    // 4. Customer Baru Bulan Ini
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    const newCustomersThisMonth = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const summaryReportData = {
      averageProductionTime, // in days
      averageDpPercentage,  // as percentage
      activeProductsCount,
      newCustomersThisMonth
    };
    // --- End of Summary Report Data ---

    // --- Get Recent Activities ---
    const recentActivitiesRaw = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(8) // Fetch 8 recent activities
      .populate('user', 'name'); // Populate user name

    const recentActivitiesFormatted = recentActivitiesRaw.map(activity => {
      let activityType = 'other'; // Default type
      if (['order', 'payment', 'cart', 'checkout'].includes(activity.module)) {
        activityType = activity.module;
      } else if (activity.module === 'user' || activity.module === 'authentication') {
        activityType = 'user';
      } else if (activity.module === 'product') {
        activityType = 'product';
      }
      // More specific types can be mapped from activity.action if needed

      return {
        description: activity.description,
        user: activity.user ? activity.user.name : 'Sistem',
        time: new Date(activity.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        type: activityType, // For icon/color in frontend
        date: new Date(activity.createdAt).toLocaleDateString('id-ID') // Optional: if you want to show date too
      };
    });
    // --- End of Recent Activities ---

    res.json({
      stats: {
        totalSales: actualTotalSales,
        salesGrowth: salesGrowthPercentage,
        totalOrders: await Order.countDocuments(),
        ordersGrowth: ordersGrowthPercentage,
        pendingOrders,
        averageOrderValue: calculatedAverageOrderValue,
        totalCustomers,
        totalProducts
      },
      salesChart: salesChartData,
      topProducts,
      businessMetrics,
      productionStatus: productionStatusData,
      summaryReport: summaryReportData,
      recentActivities: recentActivitiesFormatted
    });
  } catch (error) {
    console.error("Get owner dashboard error:", error);
    res.status(500).json({ 
      message: "Failed to retrieve dashboard data", 
      error: error.message 
    });
  }
};

/**
 * Get customer dashboard data
 */
const getCustomerDashboard = async (req, res) => {
  try {
    const customerId = req.user._id;

    // Get total orders
    const totalOrders = await Order.countDocuments({ customer: customerId });

    // Get active orders (orders that are not completed)
    const activeOrders = await Order.countDocuments({ 
      customer: customerId,
      status: { $ne: "Selesai" }
    });

    // Get total spent (berubah: ambil semua pengeluaran, bukan hanya dari pesanan yang selesai)
    const totalSpent = await Order.aggregate([
      { 
        $match: { 
          customer: customerId
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$paymentDetails.total" }
        }
      }
    ]);

    console.log("Total spent aggregation result:", JSON.stringify(totalSpent, null, 2));

    // Get payment due soon (remaining payments that are due within 7 days)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const paymentsDueSoon = await Order.find({
      customer: customerId,
      'paymentDetails.isPaid': false,
      'paymentDetails.downPayment.status': 'paid',
      'paymentDetails.remainingPayment.status': 'pending',
      'paymentDetails.remainingPayment.dueDate': { $gte: today, $lte: nextWeek }
    }).sort({ 'paymentDetails.remainingPayment.dueDate': 1 });

    // Get order status stats
    const orderStatusStats = await Order.aggregate([
      {
        $match: { customer: customerId }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format order status stats
    const statusStats = {};
    orderStatusStats.forEach(stat => {
      statusStats[stat._id] = stat.count;
    });

    // Get recent orders with more details
    const recentOrders = await Order.find({ customer: customerId })
      .populate({
        path: 'items.product',
        select: 'name images'
      })
      .sort({ createdAt: -1 })
      .limit(5);

    console.log("Recent order first item image:", recentOrders.length > 0 && recentOrders[0].items.length > 0 ? recentOrders[0].items[0].product.images : 'No images'); // Debugging images

    // Map recent orders to include more useful information
    const mappedRecentOrders = recentOrders.map(order => {
      // Debug output untuk melihat struktur data produk dan item pesanan
      if (order.items && order.items.length > 0) {
        console.log(`Order ${order.orderNumber} first item product:`, {
          productId: order.items[0].product._id,
          name: order.items[0].product.name,
          hasImages: Array.isArray(order.items[0].product.images),
          imagesCount: Array.isArray(order.items[0].product.images) ? order.items[0].product.images.length : 0,
          firstImage: Array.isArray(order.items[0].product.images) && order.items[0].product.images.length > 0 
            ? order.items[0].product.images[0] 
            : 'No images'
        });
      }

      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        status: order.status,
        totalAmount: order.paymentDetails.total,
        itemCount: order.items.length,
        items: order.items.map(item => {
          // Pastikan product ada dan memiliki data yang diperlukan
          const product = item.product || {};
          let imageUrl = null;
          
          // Periksa apakah product.images adalah array dan tidak kosong
          if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            // Periksa apakah image memiliki struktur {url, public_id} atau string langsung
            if (product.images[0].url) {
              imageUrl = product.images[0].url;
            } else {
              imageUrl = product.images[0];
            }
          }
          
          return {
            productName: product.name || 'Produk',
            image: imageUrl,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          };
        }),
        paymentDetails: {
          isPaid: order.paymentDetails.isPaid,
          downPayment: order.paymentDetails.downPayment
        },
        estimatedCompletionDate: order.estimatedCompletionDate
      };
    });

    res.json({
      stats: {
        totalOrders,
        activeOrders,
        totalSpent: totalSpent[0]?.total || 0,
        statusStats
      },
      recentOrders: mappedRecentOrders,
      paymentsDueSoon
    });
  } catch (error) {
    console.error("Get customer dashboard error:", error);
    res.status(500).json({ 
      message: "Failed to retrieve dashboard data", 
      error: error.message 
    });
  }
};

/**
 * Get activity logs with pagination and filtering
 */
const getActivityLogs = async (req, res) => {
  try {
    console.log('Fetching activity logs with filters:', req.query);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15; // Default to 15 items per page
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.action && req.query.action !== 'all') {
      filter.action = req.query.action;
    }
    if (req.query.user && req.query.user !== 'all') {
      filter.user = req.query.user;
    }
    if (req.query.module && req.query.module !== 'all') {
      filter.module = req.query.module;
    }
    
    // Add date range filtering if provided
    if (req.query.startDate) {
      filter.createdAt = { ...filter.createdAt, $gte: new Date(req.query.startDate) };
    }
    if (req.query.endDate) {
      const endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999); // Set to end of day
      filter.createdAt = { ...filter.createdAt, $lte: endDate };
    }
    
    // Add search functionality if provided
    if (req.query.search) {
      filter.$or = [
        { description: { $regex: req.query.search, $options: 'i' } },
        { 'details.message': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    console.log('Using filter:', filter);

    // Get total count for pagination
    const total = await ActivityLog.countDocuments(filter);
    console.log('Total logs found:', total);

    // Get logs with pagination and populate user
    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email');

    console.log('Retrieved logs:', logs.length);

    res.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get activity logs error:", error);
    res.status(500).json({ 
      message: "Failed to retrieve activity logs", 
      error: error.message 
    });
  }
};

/**
 * Export activity logs to Excel
 */
const exportLogs = async (req, res) => {
  try {
    console.log('Exporting activity logs with filters:', req.query);
    
    // Build filter
    const filter = {};
    if (req.query.action && req.query.action !== 'all') {
      filter.action = req.query.action;
    }
    if (req.query.user && req.query.user !== 'all') {
      filter.user = req.query.user;
    }
    if (req.query.module && req.query.module !== 'all') {
      filter.module = req.query.module;
    }
    
    // Add date range filtering if provided
    if (req.query.startDate) {
      filter.createdAt = { ...filter.createdAt, $gte: new Date(req.query.startDate) };
    }
    if (req.query.endDate) {
      const endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999); // Set to end of day
      filter.createdAt = { ...filter.createdAt, $lte: endDate };
    }
    
    // Add search functionality if provided
    if (req.query.search) {
      filter.$or = [
        { description: { $regex: req.query.search, $options: 'i' } },
        { 'details.message': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Get logs with population
    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(5000) // Limit to 5000 records to prevent memory issues
      .populate('user', 'name email');

    // Create Excel workbook and worksheet
    const excel = require('exceljs');
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Activity Logs');
    
    // Add column headers
    worksheet.columns = [
      { header: 'Tanggal', key: 'date', width: 20 },
      { header: 'Waktu', key: 'time', width: 15 },
      { header: 'User', key: 'user', width: 30 },
      { header: 'Aksi', key: 'action', width: 20 },
      { header: 'Modul', key: 'module', width: 15 },
      { header: 'Deskripsi', key: 'description', width: 50 },
      { header: 'Detail', key: 'details', width: 50 }
    ];
    
    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    
    // Get action labels
    const getActionLabel = (action) => {
      const actionLabels = {
        'create_order': 'Membuat Pesanan',
        'update_order': 'Mengubah Pesanan',
        'update_status': 'Mengubah Status',
        'payment': 'Pembayaran',
        'create_user': 'Membuat User',
        'update_user': 'Mengubah User',
        'create_product': 'Membuat Produk',
        'update_product': 'Mengubah Produk',
        'view': 'Melihat',
        'create': 'Membuat',
        'update': 'Mengubah',
        'delete': 'Menghapus',
        'login': 'Login',
        'logout': 'Logout',
        'export': 'Export Data',
        'import': 'Import Data',
        'print': 'Print',
        'download': 'Download',
        'upload': 'Upload'
      };
      
      return actionLabels[action] || action;
    };
    
    // Format module names
    const getModuleLabel = (module) => {
      const moduleLabels = {
        'auth': 'Autentikasi',
        'user': 'Pengguna',
        'product': 'Produk',
        'order': 'Pesanan',
        'payment': 'Pembayaran',
        'backup': 'Backup',
        'report': 'Laporan',
        'other': 'Lainnya'
      };
      
      return moduleLabels[module] || module;
    };
    
    // Add log data rows
    logs.forEach(log => {
      const date = new Date(log.createdAt);
      
      worksheet.addRow({
        date: date.toLocaleDateString('id-ID'),
        time: date.toLocaleTimeString('id-ID'),
        user: log.user ? log.user.name : 'System',
        action: getActionLabel(log.action),
        module: getModuleLabel(log.module),
        description: log.description || '-',
        details: log.details ? JSON.stringify(log.details) : '-'
      });
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=activity-logs.xlsx');
    
    // Write to response
    await workbook.xlsx.write(res);
    
    // End the response
    res.end();
  } catch (error) {
    console.error("Export logs error:", error);
    res.status(500).json({ 
      message: "Failed to export activity logs", 
      error: error.message 
    });
  }
};

module.exports = {
  getAdminDashboard,
  getCashierDashboard,
  getStaffDashboard,
  getOwnerDashboard,
  getCustomerDashboard,
  getActivityLogs,
  exportLogs
}; 