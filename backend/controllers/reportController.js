const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Product = require("../models/Product");
const ActivityLog = require("../models/ActivityLog");
const { generatePDF } = require("../utils/pdfGenerator");
const excel = require('exceljs');

// Helper function to calculate previous period dates
const calculatePreviousPeriod = (currentStart, currentEnd, period) => {
  let prevStart = new Date(currentStart);
  let prevEnd = new Date(currentStart);
  prevEnd.setDate(prevEnd.getDate() - 1); // End of the day before currentStart
  prevEnd.setHours(23, 59, 59, 999);

  if (period === 'daily' || period === 'weekly') { // Assuming 'daily' period means 1 day, 'weekly' means 7 days
    const diff = (new Date(currentEnd).getTime() - new Date(currentStart).getTime()) / (1000 * 3600 * 24) + 1; // Number of days in current period
    prevStart.setDate(prevStart.getDate() - diff);
  } else if (period === 'monthly') {
    prevStart = new Date(currentStart);
    prevStart.setMonth(prevStart.getMonth() - 1);
    // If currentStart is end of month, prevStart should also be end of its month
    // Or, more simply, make prevEnd the day before prevStart's original date next month.
    // For simplicity, using fixed 30 day logic for previous month for now, similar to dashboard.
    // A more robust solution would consider actual month lengths.
    prevStart = new Date(currentStart); // Reset
    prevStart.setDate(prevStart.getDate() - 30); // Approximation for 'previous month' of same length
    prevEnd = new Date(currentStart);
    prevEnd.setDate(prevEnd.getDate() -1 ); // Day before current period started
    prevEnd.setHours(23,59,59,999);
    prevStart = new Date(currentEnd); // To get a period of same length before prevEnd
    prevStart.setDate(prevStart.getDate() - 30 +1 -30); // this is getting complicated, let's simplify

    // Simpler: current period is [currentStart, currentEnd]
    // Previous period should be [currentStart - duration, currentStart - 1 day]
    const durationDays = Math.round((new Date(currentEnd).getTime() - new Date(currentStart).getTime()) / (1000 * 3600 * 24)) + 1;
    prevStart = new Date(currentStart);
    prevStart.setDate(prevStart.getDate() - durationDays);
    // prevEnd is already set to day before currentStart

  } else if (period === 'yearly') {
    prevStart.setFullYear(prevStart.getFullYear() - 1);
  }
  prevStart.setHours(0,0,0,0);
  return { startDate: prevStart, endDate: prevEnd };
};

// Helper function to calculate growth percentage
const calculateGrowth = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0; // Or null/Infinity, depending on desired representation
  }
  return parseFloat((((current - previous) / previous) * 100).toFixed(2));
};

/**
 * Generate sales report
 */
const generateSalesReport = async (req, res) => {
  console.log("[ReportController] Received query params:", JSON.stringify(req.query));
  try {
    const {
      startDate: queryStartDate,
      endDate: queryEndDate,
      period = "monthly",
      productCategory,
      exportFormat,
    } = req.query;

    console.log("[ReportController] Destructured period for chart/table:", period);

    if (!queryStartDate || !queryEndDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    const startForChartTablePeriod = new Date(queryStartDate);
    const endForChartTablePeriod = new Date(queryEndDate);
    endForChartTablePeriod.setHours(23, 59, 59, 999);

    if (isNaN(startForChartTablePeriod.getTime()) || isNaN(endForChartTablePeriod.getTime())) {
      return res.status(400).json({ message: "Invalid date format for chart/table period" });
    }

    // Filter for the user-selected period (for chart/table data)
    const chartTablePeriodFilter = {
      createdAt: { $gte: startForChartTablePeriod, $lte: endForChartTablePeriod },
      status: "Selesai",
    };
    // This info is passed to helpers so they can calculate their own period-specific growth IF their summary needs it.
    // However, the main summary cards will use a separate fixed growth calculation.
    const chartTablePeriodInfo = { startDate: startForChartTablePeriod, endDate: endForChartTablePeriod, period };

    // --- Data for Chart/Table (based on selected Harian/Mingguan/Bulanan/Tahunan filter) ---
    let chartTableRawData = {}; 
    if (period === "daily" || period === "weekly" || period === "monthly") {
      chartTableRawData = await generateDailySalesReport(chartTablePeriodFilter, productCategory, chartTablePeriodInfo);
    } else if (period === "yearly") {
      chartTableRawData = await generateYearlySalesReport(chartTablePeriodFilter, productCategory, chartTablePeriodInfo);
    } else {
      console.error("[ReportController] Invalid period for chart/table:", period);
      return res.status(400).json({ message: "Invalid period for chart/table data." });
    }
    
    const summaryForSelectedPeriod = chartTableRawData.summary; // Summary for chart/table context
    const chartData = { // Extracting only chart-relevant data (dailySales, yearlySales etc.)
        ...(chartTableRawData.dailySales && { dailySales: chartTableRawData.dailySales }),
        ...(chartTableRawData.monthlySales && { monthlySales: chartTableRawData.monthlySales }),
        ...(chartTableRawData.yearlySales && { yearlySales: chartTableRawData.yearlySales }),
    };

    // --- All-Time Stats for Overall Summary Cards (Top Cards) ---
    const allTimeSalesAgg = await Order.aggregate([
        { $match: { status: "Selesai" } }, 
        { $group: { _id: null, total: { $sum: "$paymentDetails.total" } } }
      ]);
    const allTimeTotalSales = allTimeSalesAgg[0]?.total || 0;

    const allTimeTotalOrders = await Order.countDocuments({ status: "Selesai" });
    const allTimeAverageOrderValue = allTimeTotalOrders > 0 ? (allTimeTotalSales / allTimeTotalOrders) : 0; // Keep precision for FE

    // --- Dinamis Period Growth Calculation untuk KARTU RINGKASAN berdasarkan `period` dari req.query ---
    let growthPeriodDaysForCards;
    let growthPeriodDescriptionForCards;

    switch (period) {
      case 'daily': // Jika ada filter harian
        growthPeriodDaysForCards = 1;
        growthPeriodDescriptionForCards = `dari 1 hari lalu`;
        break;
      case 'weekly':
        growthPeriodDaysForCards = 7;
        growthPeriodDescriptionForCards = `dari 7 hari lalu`;
        break;
      case 'yearly':
        growthPeriodDaysForCards = 365;
        growthPeriodDescriptionForCards = `dari 365 hari lalu`;
        break;
      case 'monthly':
      default: // Default ke bulanan jika period tidak dikenali
        growthPeriodDaysForCards = 30;
        growthPeriodDescriptionForCards = `dari 30 hari lalu`;
        break;
    }

    const todayForGrowthCalc = new Date();
    const currentGrowthPeriodEnd = new Date(todayForGrowthCalc);
    currentGrowthPeriodEnd.setHours(23, 59, 59, 999);
    const currentGrowthPeriodStart = new Date(todayForGrowthCalc);
    currentGrowthPeriodStart.setDate(todayForGrowthCalc.getDate() - (growthPeriodDaysForCards - 1));
    currentGrowthPeriodStart.setHours(0, 0, 0, 0);

    const previousGrowthPeriodEnd = new Date(currentGrowthPeriodStart);
    previousGrowthPeriodEnd.setDate(previousGrowthPeriodEnd.getDate() - 1);
    previousGrowthPeriodEnd.setHours(23, 59, 59, 999);
    const previousGrowthPeriodStart = new Date(previousGrowthPeriodEnd);
    previousGrowthPeriodStart.setDate(previousGrowthPeriodEnd.getDate() - (growthPeriodDaysForCards - 1));
    previousGrowthPeriodStart.setHours(0, 0, 0, 0);
    
    const growthMatchCriteria = { status: "Selesai" };

    const currentGrowthAgg = await Order.aggregate([
      { $match: { ...growthMatchCriteria, createdAt: { $gte: currentGrowthPeriodStart, $lte: currentGrowthPeriodEnd } } },
      { $group: { _id: null, totalSales: { $sum: "$paymentDetails.total" }, count: { $sum: 1 } } }
    ]);
    const currentGrowthSales = currentGrowthAgg[0]?.totalSales || 0;
    const currentGrowthOrders = currentGrowthAgg[0]?.count || 0;
    const currentGrowthAOV = currentGrowthOrders > 0 ? (currentGrowthSales / currentGrowthOrders) : 0;

    const previousGrowthAgg = await Order.aggregate([
      { $match: { ...growthMatchCriteria, createdAt: { $gte: previousGrowthPeriodStart, $lte: previousGrowthPeriodEnd } } },
      { $group: { _id: null, totalSales: { $sum: "$paymentDetails.total" }, count: { $sum: 1 } } }
    ]);
    const previousGrowthSales = previousGrowthAgg[0]?.totalSales || 0;
    const previousGrowthOrders = previousGrowthAgg[0]?.count || 0;
    const previousGrowthAOV = previousGrowthOrders > 0 ? (previousGrowthSales / previousGrowthOrders) : 0;

    const dynamicSalesGrowthPercentage = calculateGrowth(currentGrowthSales, previousGrowthSales);
    const dynamicOrdersGrowthPercentage = calculateGrowth(currentGrowthOrders, previousGrowthOrders);
    const dynamicAovGrowthPercentage = calculateGrowth(currentGrowthAOV, previousGrowthAOV);
    
    const finalReportData = {
        ...chartData, 
        summaryForSelectedPeriod, 
        overallSummary: {
            allTimeTotalSales,
            allTimeTotalOrders,
            allTimeAverageOrderValue,
            fixedSalesGrowthPercentage: dynamicSalesGrowthPercentage,
            fixedOrdersGrowthPercentage: dynamicOrdersGrowthPercentage,
            fixedAovGrowthPercentage: dynamicAovGrowthPercentage,
            growthPeriodDescription: growthPeriodDescriptionForCards
        }
    };
    
    // Log activity
    await new ActivityLog({
      user: req.user._id,
      action: "generate_report",
      module: "report",
      description: "Generated sales report",
      details: {
        reportType: "sales",
        startDate: queryStartDate, 
        endDate: queryEndDate,
        period, // This is the period for chart/table
        productCategory: productCategory || "all",
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).save();

    // --- Export Logic ---
    if (exportFormat === "pdf" && req.user.role === "owner") {
        const pdfBuffer = await generatePDF({
            title: "Sales Report",
            period, 
            startDate: startForChartTablePeriod.toLocaleDateString(),
            endDate: endForChartTablePeriod.toLocaleDateString(),
            data: finalReportData, 
          });
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename=sales-report-${period}-${queryStartDate}-${queryEndDate}.pdf`
          );
          return res.send(pdfBuffer);
    }
    
    if (exportFormat === "excel" && req.user.role === "owner") {
      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('Sales Report');
      
      worksheet.addRow(['Sales Report']);
      worksheet.addRow([]);

      worksheet.addRow(['Ringkasan Umum (Data Kartu Atas)']);
      worksheet.addRow(['Total Penjualan (Keseluruhan)', finalReportData.overallSummary.allTimeTotalSales]);
      worksheet.addRow(['Total Pesanan (Keseluruhan)', finalReportData.overallSummary.allTimeTotalOrders]);
      worksheet.addRow(['Rata-rata Nilai Pesanan (Keseluruhan)', finalReportData.overallSummary.allTimeAverageOrderValue]);
      worksheet.addRow(['Pertumbuhan Penjualan', `${finalReportData.overallSummary.fixedSalesGrowthPercentage}% (${finalReportData.overallSummary.growthPeriodDescription})`]);
      worksheet.addRow(['Pertumbuhan Pesanan', `${finalReportData.overallSummary.fixedOrdersGrowthPercentage}% (${finalReportData.overallSummary.growthPeriodDescription})`]);
      worksheet.addRow(['Pertumbuhan Rata-rata Nilai Pesanan', `${finalReportData.overallSummary.fixedAovGrowthPercentage}% (${finalReportData.overallSummary.growthPeriodDescription})`]);
      worksheet.addRow([]);

      worksheet.addRow([`Ringkasan untuk Periode Terpilih: ${period} (${startForChartTablePeriod.toLocaleDateString()} - ${endForChartTablePeriod.toLocaleDateString()})`]);
      worksheet.addRow(['Total Penjualan (Periode Terpilih)', finalReportData.summaryForSelectedPeriod?.totalPeriodSales || 0]);
      worksheet.addRow(['Total Pesanan (Periode Terpilih)', finalReportData.summaryForSelectedPeriod?.totalPeriodOrders || 0]);
      worksheet.addRow(['Rata-rata Nilai Pesanan (Periode Terpilih)', finalReportData.summaryForSelectedPeriod?.averageOrderValue || 0]);
      if (finalReportData.summaryForSelectedPeriod?.salesGrowthPercentage !== undefined) {
        worksheet.addRow(['Pertumbuhan Penjualan (Periode Terpilih)', `${finalReportData.summaryForSelectedPeriod.salesGrowthPercentage}%`]);
        worksheet.addRow(['Pertumbuhan Pesanan (Periode Terpilih)', `${finalReportData.summaryForSelectedPeriod.ordersGrowthPercentage}%`]);
        worksheet.addRow(['Pertumbuhan Rata-rata Nilai Pesanan (Periode Terpilih)', `${finalReportData.summaryForSelectedPeriod.aovGrowthPercentage}%`]);
      }
      worksheet.addRow([]);
      
      let detailsData = [];
      let dataKeyForChart = finalReportData.dailySales ? 'dailySales' : (finalReportData.yearlySales ? 'yearlySales' : (finalReportData.monthlySales ? 'monthlySales' : null));

      if (dataKeyForChart && finalReportData[dataKeyForChart]) {
        const headerRow = period === 'yearly' ? ['Tahun', 'Total Penjualan', 'Total Pesanan', 'Rata-rata Nilai Pesanan'] : ['Tanggal', 'Total Penjualan', 'Total Pesanan', 'Rata-rata Nilai Pesanan'];
        worksheet.addRow(headerRow);
        detailsData = finalReportData[dataKeyForChart] || [];
        
        detailsData.forEach(item => {
          const itemSales = item.totalSales || 0;
          const itemOrders = item.totalOrders || 0;
          const avgOrderValue = itemOrders > 0 ? itemSales / itemOrders : 0;
          worksheet.addRow([ item.year || item.date || item.period, itemSales, itemOrders, avgOrderValue ]);
        });
      }
      
      worksheet.getColumn(1).width = 20;
      worksheet.getColumn(2).width = 20;
      worksheet.getColumn(3).width = 20;
      worksheet.getColumn(4).width = 25;
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=sales-report-${period}-${queryStartDate}-${queryEndDate}.xlsx`);
      return workbook.xlsx.write(res).then(() => { res.status(200).end(); });
    }

    res.json({
      message: "Sales report generated successfully",
      periodRequested: period, 
      filterStartDate: queryStartDate, 
      filterEndDate: queryEndDate,     
      report: finalReportData,
    });
  } catch (error) {
    console.error("Generate sales report error:", error);
    res.status(500).json({ message: "Failed to generate sales report", error: error.message });
  }
};

/**
 * Generate daily sales report
 * @private
 */
const generateDailySalesReport = async (filter, productCategory, currentPeriodInfo) => {
  const matchStage = { ...filter }; // Filter for the current period

  // Add product category filter if provided
  if (productCategory) {
    matchStage["items.product.category"] = productCategory;
  }

  // --- Current Period Aggregation ---
  const currentPeriodAggregation = await Order.aggregate([
    { $match: matchStage },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
    ...(productCategory
      ? [{ $match: { "productDetails.category": productCategory } }]
      : []),
    {
      $group: {
        _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } },
        totalSales: { $sum: { $multiply: ["$items.unitPrice", "$items.quantity"] } },
        totalOrders: { $addToSet: "$_id" },
        totalItems: { $sum: "$items.quantity" },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id.date",
        totalSales: 1,
        totalOrders: { $size: "$totalOrders" },
        totalItems: 1,
      },
    },
    { $sort: { date: 1 } },
  ]);

  const currentSales = currentPeriodAggregation.reduce((sum, day) => sum + day.totalSales, 0);
  const currentOrders = currentPeriodAggregation.reduce((sum, day) => sum + day.totalOrders, 0);
  const currentItems = currentPeriodAggregation.reduce((sum, day) => sum + day.totalItems, 0);
  const currentAOV = currentOrders > 0 ? currentSales / currentOrders : 0;

  // --- Previous Period Calculation ---
  let previousSales = 0;
  let previousOrders = 0;
  let previousAOV = 0;

  if (currentPeriodInfo && currentPeriodInfo.startDate && currentPeriodInfo.endDate && currentPeriodInfo.period) {
    const prevPeriodDates = calculatePreviousPeriod(currentPeriodInfo.startDate, currentPeriodInfo.endDate, currentPeriodInfo.period);
    
    const prevMatchStage = {
      createdAt: { $gte: prevPeriodDates.startDate, $lte: prevPeriodDates.endDate },
      status: "Selesai", // Ensure we only count completed orders for comparison
    };
    if (productCategory) {
      prevMatchStage["items.product.category"] = productCategory;
    }

    const previousPeriodTotals = await Order.aggregate([
      { $match: prevMatchStage },
      { $unwind: "$items" },
      ...(productCategory ? [
        {
          $lookup: {
            from: "products",
            localField: "items.product",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        { $unwind: "$productDetails" },
        { $match: { "productDetails.category": productCategory } }
      ] : []),
      {
        $group: {
          _id: null,
          totalSales: { $sum: { $multiply: ["$items.unitPrice", "$items.quantity"] } },
          totalOrders: { $addToSet: "$_id" },
        },
      },
      {
        $project: {
            _id: 0,
            totalSales: 1,
            totalOrders: { $size: "$totalOrders" },
        }
      }
    ]);

    if (previousPeriodTotals.length > 0) {
      previousSales = previousPeriodTotals[0].totalSales || 0;
      previousOrders = previousPeriodTotals[0].totalOrders || 0;
      previousAOV = previousOrders > 0 ? previousSales / previousOrders : 0;
    }
  }
  
  // --- Calculate Growth --- 
  const salesGrowthPercentage = calculateGrowth(currentSales, previousSales);
  const ordersGrowthPercentage = calculateGrowth(currentOrders, previousOrders);
  const aovGrowthPercentage = calculateGrowth(currentAOV, previousAOV);

  return {
    dailySales: currentPeriodAggregation,
    summary: {
      totalPeriodSales: currentSales,
      totalPeriodOrders: currentOrders,
      totalPeriodItems: currentItems,
      averageDailySales:
        currentPeriodAggregation.length > 0
          ? currentSales / currentPeriodAggregation.length
          : 0,
      averageOrderValue: currentAOV,
      salesGrowthPercentage: salesGrowthPercentage,
      ordersGrowthPercentage: ordersGrowthPercentage,
      aovGrowthPercentage: aovGrowthPercentage,
    },
  };
};

/**
 * Generate monthly sales report
 * @private
 */
const generateMonthlySalesReport = async (filter, productCategory, currentPeriodInfo) => {
  const matchStage = { ...filter }; // Filter for the current period

  if (productCategory) {
    matchStage["items.product.category"] = productCategory;
  }

  // --- Current Period Aggregation (by month) ---
  const currentPeriodAggregation = await Order.aggregate([
    { $match: matchStage },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
    ...(productCategory
      ? [{ $match: { "productDetails.category": productCategory } }]
      : []),
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        totalSales: { $sum: { $multiply: ["$items.unitPrice", "$items.quantity"] } },
        totalOrders: { $addToSet: "$_id" },
        totalItems: { $sum: "$items.quantity" },
      },
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        period: { $concat: [{ $toString: "$_id.year" }, "-", { $cond: [{ $lt: ["$_id.month", 10] }, { $concat: ["0", { $toString: "$_id.month" }] },{ $toString: "$_id.month" }] }] },
        totalSales: 1,
        totalOrders: { $size: "$totalOrders" },
        totalItems: 1,
      },
    },
    { $sort: { year: 1, month: 1 } },
  ]);

  const currentSales = currentPeriodAggregation.reduce((sum, m) => sum + m.totalSales, 0);
  const currentOrders = currentPeriodAggregation.reduce((sum, m) => sum + m.totalOrders, 0);
  const currentItems = currentPeriodAggregation.reduce((sum, m) => sum + m.totalItems, 0);
  const currentAOV = currentOrders > 0 ? currentSales / currentOrders : 0;

  // --- Previous Period Calculation ---
  let previousSales = 0;
  let previousOrders = 0;
  let previousAOV = 0;

  if (currentPeriodInfo && currentPeriodInfo.startDate && currentPeriodInfo.endDate && currentPeriodInfo.period) {
    const prevPeriodDates = calculatePreviousPeriod(currentPeriodInfo.startDate, currentPeriodInfo.endDate, currentPeriodInfo.period);
    const prevMatchStage = {
      createdAt: { $gte: prevPeriodDates.startDate, $lte: prevPeriodDates.endDate },
      status: "Selesai",
    };
    if (productCategory) prevMatchStage["items.product.category"] = productCategory;

    const previousPeriodTotals = await Order.aggregate([
      { $match: prevMatchStage }, { $unwind: "$items" },
      ...(productCategory ? [ { $lookup: { from: "products", localField: "items.product", foreignField: "_id", as: "productDetails" } }, { $unwind: "$productDetails" }, { $match: { "productDetails.category": productCategory } } ] : []),
      { $group: { _id: null, totalSales: { $sum: { $multiply: ["$items.unitPrice", "$items.quantity"] } }, totalOrders: { $addToSet: "$_id" } } },
      { $project: { _id: 0, totalSales: 1, totalOrders: { $size: "$totalOrders" } } }
    ]);
    if (previousPeriodTotals.length > 0) {
      previousSales = previousPeriodTotals[0].totalSales || 0;
      previousOrders = previousPeriodTotals[0].totalOrders || 0;
      previousAOV = previousOrders > 0 ? previousSales / previousOrders : 0;
    }
  }
  
  const salesGrowthPercentage = calculateGrowth(currentSales, previousSales);
  const ordersGrowthPercentage = calculateGrowth(currentOrders, previousOrders);
  const aovGrowthPercentage = calculateGrowth(currentAOV, previousAOV);

  return {
    monthlySales: currentPeriodAggregation,
    summary: {
      totalPeriodSales: currentSales,
      totalPeriodOrders: currentOrders,
      totalPeriodItems: currentItems,
      averageMonthlySales:
        currentPeriodAggregation.length > 0
          ? currentSales / currentPeriodAggregation.length
          : 0,
      averageOrderValue: currentAOV,
      salesGrowthPercentage,
      ordersGrowthPercentage,
      aovGrowthPercentage,
    },
  };
};

/**
 * Generate yearly sales report
 * @private
 */
const generateYearlySalesReport = async (filter, productCategory, currentPeriodInfo) => {
  const matchStage = { ...filter }; // Filter for the current period

  if (productCategory) {
    matchStage["items.product.category"] = productCategory;
  }

  // --- Current Period Aggregation (by year) ---
  const currentPeriodAggregation = await Order.aggregate([
    { $match: matchStage },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
    ...(productCategory
      ? [{ $match: { "productDetails.category": productCategory } }]
      : []),
    {
      $group: {
        _id: { year: { $year: "$createdAt" } },
        totalSales: { $sum: { $multiply: ["$items.unitPrice", "$items.quantity"] } },
        totalOrders: { $addToSet: "$_id" },
        totalItems: { $sum: "$items.quantity" },
      },
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        totalSales: 1,
        totalOrders: { $size: "$totalOrders" },
        totalItems: 1,
      },
    },
    { $sort: { year: 1 } },
  ]);

  const currentSales = currentPeriodAggregation.reduce((sum, y) => sum + y.totalSales, 0);
  const currentOrders = currentPeriodAggregation.reduce((sum, y) => sum + y.totalOrders, 0);
  const currentItems = currentPeriodAggregation.reduce((sum, y) => sum + y.totalItems, 0);
  const currentAOV = currentOrders > 0 ? currentSales / currentOrders : 0;

  // --- Previous Period Calculation ---
  let previousSales = 0;
  let previousOrders = 0;
  let previousAOV = 0;

  if (currentPeriodInfo && currentPeriodInfo.startDate && currentPeriodInfo.endDate && currentPeriodInfo.period) {
    const prevPeriodDates = calculatePreviousPeriod(currentPeriodInfo.startDate, currentPeriodInfo.endDate, currentPeriodInfo.period);
    const prevMatchStage = {
      createdAt: { $gte: prevPeriodDates.startDate, $lte: prevPeriodDates.endDate },
      status: "Selesai",
    };
    if (productCategory) prevMatchStage["items.product.category"] = productCategory;

    const previousPeriodTotals = await Order.aggregate([
      { $match: prevMatchStage }, { $unwind: "$items" },
      ...(productCategory ? [ { $lookup: { from: "products", localField: "items.product", foreignField: "_id", as: "productDetails" } }, { $unwind: "$productDetails" }, { $match: { "productDetails.category": productCategory } } ] : []),
      { $group: { _id: null, totalSales: { $sum: { $multiply: ["$items.unitPrice", "$items.quantity"] } }, totalOrders: { $addToSet: "$_id" } } },
      { $project: { _id: 0, totalSales: 1, totalOrders: { $size: "$totalOrders" } } }
    ]);
    if (previousPeriodTotals.length > 0) {
      previousSales = previousPeriodTotals[0].totalSales || 0;
      previousOrders = previousPeriodTotals[0].totalOrders || 0;
      previousAOV = previousOrders > 0 ? previousSales / previousOrders : 0;
    }
  }
  
  const salesGrowthPercentage = calculateGrowth(currentSales, previousSales);
  const ordersGrowthPercentage = calculateGrowth(currentOrders, previousOrders);
  const aovGrowthPercentage = calculateGrowth(currentAOV, previousAOV);

  return {
    yearlySales: currentPeriodAggregation, // This contains data grouped by year for the chart
    // monthlySales: also needs to be populated if period === 'yearly' for detailed table breakdown by month
    summary: {
      totalPeriodSales: currentSales,
      totalPeriodOrders: currentOrders,
      totalPeriodItems: currentItems,
      averageYearlySales: // This was specific to the old yearly summary
        currentPeriodAggregation.length > 0
          ? currentSales / currentPeriodAggregation.length
          : 0,
      averageOrderValue: currentAOV,
      salesGrowthPercentage,
      ordersGrowthPercentage,
      aovGrowthPercentage,
    },
  };
};

/**
 * Generate financial report
 */
const generateFinancialReport = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      period = "monthly",
      exportFormat,
    } = req.query;

    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Basic filter for date range
    const dateFilter = {
      createdAt: { $gte: start, $lte: end },
    };

    // Revenue data
    const revenueData = await Payment.aggregate([
      {
        $match: {
          ...dateFilter,
          status: "paid",
        },
      },
      {
        $group: {
          _id:
            period === "daily"
              ? { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
              : period === "monthly"
              ? {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                }
              : { year: { $year: "$createdAt" } },
          revenue: { $sum: "$amount" },
          transactionCount: { $sum: 1 },
          methods: {
            $push: {
              method: "$method",
              amount: "$amount",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          period:
            period === "daily"
              ? "$_id"
              : period === "monthly"
              ? {
                  $concat: [
                    { $toString: "$_id.year" },
                    "-",
                    {
                      $cond: [
                        { $lt: ["$_id.month", 10] },
                        { $concat: ["0", { $toString: "$_id.month" }] },
                        { $toString: "$_id.month" },
                      ],
                    },
                  ],
                }
              : { $toString: "$_id.year" },
          revenue: 1,
          transactionCount: 1,
          methods: 1,
        },
      },
      {
        $sort: { period: 1 },
      },
    ]);

    // Format methods data
    const formattedRevenueData = revenueData.map((item) => {
      // Group by payment method
      const methodSummary = {};

      item.methods.forEach((methodItem) => {
        if (!methodSummary[methodItem.method]) {
          methodSummary[methodItem.method] = {
            total: 0,
            count: 0,
          };
        }
        methodSummary[methodItem.method].total += methodItem.amount;
        methodSummary[methodItem.method].count += 1;
      });

      return {
        ...item,
        methodSummary,
      };
    });

    // Calculate overall summary
    const summary = {
      totalRevenue: formattedRevenueData.reduce(
        (sum, item) => sum + item.revenue,
        0
      ),
      totalTransactions: formattedRevenueData.reduce(
        (sum, item) => sum + item.transactionCount,
        0
      ),
      averageTransactionValue:
        formattedRevenueData.reduce((sum, item) => sum + item.revenue, 0) /
        formattedRevenueData.reduce(
          (sum, item) => sum + item.transactionCount,
          1
        ),
      byMethod: {},
    };

    // Calculate by payment method
    formattedRevenueData.forEach((item) => {
      Object.entries(item.methodSummary).forEach(([method, data]) => {
        if (!summary.byMethod[method]) {
          summary.byMethod[method] = {
            total: 0,
            count: 0,
          };
        }
        summary.byMethod[method].total += data.total;
        summary.byMethod[method].count += data.count;
      });
    });

    // Calculate expenses and profit (estimated)
    const totalExpenses = Math.round(summary.totalRevenue * 0.7); // 70% of revenue as expenses
    const totalProfit = summary.totalRevenue - totalExpenses;
    const profitMargin = summary.totalRevenue > 0 ? Math.round((totalProfit / summary.totalRevenue) * 100) : 0;

    // Add expense and profit data to summary
    summary.totalExpenses = totalExpenses;
    summary.totalProfit = totalProfit;
    summary.profitMargin = profitMargin;

    // Create expense breakdown
    const expenseBreakdown = {
      "Bahan Baku": {
        amount: Math.round(totalExpenses * 0.45),
        percentage: 45
      },
      "Tenaga Kerja": {
        amount: Math.round(totalExpenses * 0.25),
        percentage: 25
      },
      "Operasional": {
        amount: Math.round(totalExpenses * 0.15),
        percentage: 15
      },
      "Marketing": {
        amount: Math.round(totalExpenses * 0.10),
        percentage: 10
      },
      "Lain-lain": {
        amount: Math.round(totalExpenses * 0.05),
        percentage: 5
      }
    };

    // Create the report data object
    const reportData = {
      revenueData: formattedRevenueData,
      summary,
      expenseBreakdown
    };

    // Log activity
    await new ActivityLog({
      user: req.user._id,
      action: "generate_report",
      module: "report",
      description: "Generated financial report",
      details: {
        reportType: "financial",
        startDate,
        endDate,
        period,
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).save();
    
    // Export to PDF if requested
    if (exportFormat === "pdf" && req.user.role === "owner") {
      const pdfBuffer = await generatePDF({
        title: "Financial Report",
        period,
        startDate: start.toLocaleDateString(),
        endDate: end.toLocaleDateString(),
        data: reportData,
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=financial-report-${period}-${startDate}-${endDate}.pdf`
      );
      return res.send(pdfBuffer);
    }
    
    // Export to Excel if requested
    if (exportFormat === "excel" && req.user.role === "owner") {
      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('Financial Report');
      
      // Add title and period information
      worksheet.addRow(['Financial Report']);
      worksheet.addRow([`Period: ${period}`]);
      worksheet.addRow([`Date Range: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`]);
      worksheet.addRow([]);
      
      // Add summary section if available
      if (reportData.summary) {
        worksheet.addRow(['Summary']);
        worksheet.addRow(['Total Revenue', reportData.summary.totalRevenue || 0]);
        worksheet.addRow(['Total Expenses', reportData.summary.totalExpenses || 0]);
        worksheet.addRow(['Total Profit', reportData.summary.totalProfit || 0]);
        worksheet.addRow(['Profit Margin', reportData.summary.profitMargin ? `${reportData.summary.profitMargin}%` : '0%']);
        worksheet.addRow(['Transaction Count', reportData.summary.transactionCount || 0]);
        worksheet.addRow([]);
      }
      
      // Add payment methods breakdown if available
      if (reportData.summary && reportData.summary.byMethod) {
        worksheet.addRow(['Payment Methods']);
        worksheet.addRow(['Method', 'Amount', 'Count', 'Percentage']);
        
        const methodLabels = {
          'cash': 'Tunai',
          'transfer': 'Transfer Bank',
          'midtrans': 'Pembayaran Online'
        };
        
        Object.entries(reportData.summary.byMethod).forEach(([method, data]) => {
          const methodName = methodLabels[method] || method;
          const percentage = data.total && reportData.summary.totalRevenue 
            ? Math.round(data.total / reportData.summary.totalRevenue * 100)
            : 0;
            
          worksheet.addRow([methodName, data.total, data.count, `${percentage}%`]);
        });
        
        worksheet.addRow([]);
      }
      
      // Add expense breakdown if available
      if (reportData.expenseBreakdown) {
        worksheet.addRow(['Expense Breakdown']);
        worksheet.addRow(['Category', 'Amount', 'Percentage']);
        
        Object.entries(reportData.expenseBreakdown).forEach(([category, data]) => {
          worksheet.addRow([category, data.amount, `${data.percentage}%`]);
        });
        
        worksheet.addRow([]);
      }
      
      // Add details table
      if (reportData.revenueData) {
        worksheet.addRow(['Financial Details']);
        worksheet.addRow(['Date', 'Revenue', 'Expenses', 'Gross Profit', 'Profit Margin', 'Transactions']);
        
        reportData.revenueData.forEach(item => {
          const expenses = Math.round(item.revenue * 0.7); // Estimated expenses
          const profit = item.revenue - expenses;
          const margin = item.revenue > 0 ? Math.round((profit / item.revenue) * 100) : 0;
          
          worksheet.addRow([
            item.period,
            item.revenue,
            expenses,
            profit,
            `${margin}%`,
            item.transactionCount
          ]);
        });
      }
      
      // Format the worksheet
      worksheet.getColumn(1).width = 15;
      worksheet.getColumn(2).width = 15;
      worksheet.getColumn(3).width = 15;
      worksheet.getColumn(4).width = 15;
      worksheet.getColumn(5).width = 15;
      worksheet.getColumn(6).width = 15;
      
      // Set content type and headers for Excel download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=financial-report-${period}-${startDate}-${endDate}.xlsx`);
      
      // Write to response
      return workbook.xlsx.write(res)
        .then(() => {
          res.status(200).end();
        });
    }

    // Return JSON response if no export format specified
    res.json({
      message: "Financial report generated successfully",
      period,
      startDate: start,
      endDate: end,
      report: reportData,
    });
  } catch (error) {
    console.error("Generate financial report error:", error);
    res.status(500).json({
      message: "Failed to generate financial report",
      error: error.message,
    });
  }
};

/**
 * Generate inventory report
 */
const generateInventoryReport = async (req, res) => {
  try {
    const { exportFormat } = req.query;

    // Get product inventory
    const productInventory = await Product.aggregate([
      {
        $unwind: "$skus"
      },
      {
        $group: {
          _id: {
            productId: "$_id",
            productName: "$name",
            category: "$category"
          },
          totalInventory: { $sum: "$skus.inventory" },
          skus: { $push: "$skus" }
        }
      }
    ]);

    // Process materials from products
    const materialInventory = await Product.aggregate([
      {
        $unwind: "$materials"
      },
      {
        $group: {
          _id: "$materials.name",
          count: { $sum: 1 },
          additionalPrice: { $first: "$materials.additionalPrice" },
          available: { $first: "$materials.available" }
        }
      }
    ]);

    // Material summary
    const materialSummary = {
      totalMaterials: materialInventory.length,
      totalValue: materialInventory.reduce(
        (sum, material) => sum + (material.additionalPrice || 0),
        0
      ),
      lowStockCount: materialInventory.filter(m => !m.available).length,
      byType: {}
    };

    // Calculate by material type
    materialInventory.forEach(material => {
      const type = material._id.split(' ')[0]; // Get first word as type
      if (!materialSummary.byType[type]) {
        materialSummary.byType[type] = {
          count: 0,
          value: 0,
          lowStockCount: 0
        };
      }
      materialSummary.byType[type].count += 1;
      materialSummary.byType[type].value += material.additionalPrice || 0;
      if (!material.available) {
        materialSummary.byType[type].lowStockCount += 1;
      }
    });

    // Log activity
    await new ActivityLog({
      user: req.user._id,
      action: "generate_report",
      module: "report",
      description: "Generated inventory report",
      details: {
        reportType: "inventory"
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    }).save();

    // Export if requested
    if (exportFormat === "pdf" && req.user.role === "owner") {
      const pdfBuffer = await generatePDF({
        title: "Inventory Report",
        data: {
          productInventory,
          materialInventory,
          materialSummary
        }
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=inventory-report.pdf"
      );
      return res.send(pdfBuffer);
    }

    res.json({
      message: "Inventory report generated successfully",
      productInventory,
      materialInventory,
      materialSummary
    });
  } catch (error) {
    console.error("Generate inventory report error:", error);
    res.status(500).json({
      message: "Failed to generate inventory report",
      error: error.message
    });
  }
};

/**
 * Generate product performance report
 */
const generateProductPerformanceReport = async (req, res) => {
  try {
    const { startDate, endDate, exportFormat } = req.query;

    // Validate dates
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Start date and end date are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Products performance
    const productPerformance = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $unwind: "$items",
      },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $group: {
          _id: "$items.product",
          productName: { $first: "$productDetails.name" },
          productCategory: { $first: "$productDetails.category" },
          totalSales: {
            $sum: { $multiply: ["$items.unitPrice", "$items.quantity"] },
          },
          totalQuantity: { $sum: "$items.quantity" },
          orderCount: { $addToSet: "$_id" },
          sizes: {
            $push: {
              size: "$items.size",
              quantity: "$items.quantity",
            },
          },
          colors: {
            $push: {
              color: "$items.color",
              quantity: "$items.quantity",
            },
          },
          materials: {
            $push: {
              material: "$items.material",
              quantity: "$items.quantity",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          productName: 1,
          productCategory: 1,
          totalSales: 1,
          totalQuantity: 1,
          orderCount: { $size: "$orderCount" },
          sizes: 1,
          colors: 1,
          materials: 1,
        },
      },
      {
        $sort: { totalSales: -1 },
      },
    ]);

    // Process sizes, colors, materials data
    const processedProducts = productPerformance.map((product) => {
      // Process sizes
      const sizeMap = {};
      product.sizes.forEach((item) => {
        if (!sizeMap[item.size]) {
          sizeMap[item.size] = 0;
        }
        sizeMap[item.size] += item.quantity;
      });

      // Process colors
      const colorMap = {};
      product.colors.forEach((item) => {
        if (!colorMap[item.color]) {
          colorMap[item.color] = 0;
        }
        colorMap[item.color] += item.quantity;
      });

      // Process materials
      const materialMap = {};
      product.materials.forEach((item) => {
        if (!materialMap[item.material]) {
          materialMap[item.material] = 0;
        }
        materialMap[item.material] += item.quantity;
      });

      return {
        ...product,
        sizeBreakdown: Object.entries(sizeMap).map(([size, quantity]) => ({
          size,
          quantity,
        })),
        colorBreakdown: Object.entries(colorMap).map(([color, quantity]) => ({
          color,
          quantity,
        })),
        materialBreakdown: Object.entries(materialMap).map(
          ([material, quantity]) => ({ material, quantity })
        ),
      };
    });

    // Category performance
    const categoryPerformance = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $unwind: "$items",
      },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $group: {
          _id: "$productDetails.category",
          totalSales: {
            $sum: { $multiply: ["$items.unitPrice", "$items.quantity"] },
          },
          totalQuantity: { $sum: "$items.quantity" },
          products: { $addToSet: "$items.product" },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalSales: 1,
          totalQuantity: 1,
          productCount: { $size: "$products" },
        },
      },
      {
        $sort: { totalSales: -1 },
      },
    ]);

    // Log activity
    await new ActivityLog({
      user: req.user._id,
      action: "generate_report",
      module: "report",
      description: "Generated product performance report",
      details: {
        reportType: "product-performance",
        startDate,
        endDate,
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).save();

    // Export if requested
    if (exportFormat === "pdf" && req.user.role === "owner") {
      const pdfBuffer = await generatePDF({
        title: "Product Performance Report",
        startDate: start.toLocaleDateString(),
        endDate: end.toLocaleDateString(),
        data: {
          products: processedProducts,
          categories: categoryPerformance,
        },
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=product-performance-report-${startDate}-${endDate}.pdf`
      );
      return res.send(pdfBuffer);
    }

    res.json({
      message: "Product performance report generated successfully",
      startDate: start,
      endDate: end,
      report: {
        products: processedProducts,
        categories: categoryPerformance,
      },
    });
  } catch (error) {
    console.error("Generate product performance report error:", error);
    res
      .status(500)
      .json({
        message: "Failed to generate product performance report",
        error: error.message,
      });
  }
};

module.exports = {
  generateSalesReport,
  generateFinancialReport,
  generateInventoryReport,
  generateProductPerformanceReport,
};
