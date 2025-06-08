const PDFDocument = require("pdfkit");

/**
 * Generate PDF report
 * @param {Object} data - Report data
 * @returns {Promise<Buffer>} - PDF buffer
 */
const generatePDF = (data) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({ margin: 50 });

      // Buffer to store PDF
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Add report title
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .text(data.title, { align: "center" });

      doc.moveDown();

      // Add date range if provided
      if (data.startDate && data.endDate) {
        doc
          .fontSize(12)
          .font("Helvetica")
          .text(`Period: ${data.startDate} to ${data.endDate}`, {
            align: "center",
          });

        doc.moveDown();
      }

      // Add period type if provided
      if (data.period) {
        doc
          .fontSize(12)
          .font("Helvetica")
          .text(`Grouped by: ${data.period}`, { align: "center" });

        doc.moveDown();
      }

      // Generate report based on report type
      if (data.title.includes("Sales")) {
        generateSalesReportContent(doc, data);
      } else if (data.title.includes("Financial")) {
        generateFinancialReportContent(doc, data);
      } else if (data.title.includes("Inventory")) {
        generateInventoryReportContent(doc, data);
      } else if (data.title.includes("Product Performance")) {
        generateProductPerformanceReportContent(doc, data);
      }

      // Finalize the PDF and end the stream
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate sales report content
 * @private
 */
const generateSalesReportContent = (doc, data) => {
  // Add summary section
  doc.fontSize(16).font("Helvetica-Bold").text("Summary", { underline: true });

  doc.moveDown(0.5);

  const summary = data.data.summary;

  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Total Sales: Rp ${formatCurrency(summary.totalPeriodSales)}`)
    .text(`Total Orders: ${summary.totalPeriodOrders}`)
    .text(`Total Items Sold: ${summary.totalPeriodItems}`);

  if (data.period === "daily") {
    doc.text(
      `Average Daily Sales: Rp ${formatCurrency(summary.averageDailySales)}`
    );
  } else if (data.period === "monthly") {
    doc.text(
      `Average Monthly Sales: Rp ${formatCurrency(summary.averageMonthlySales)}`
    );
  } else if (data.period === "yearly") {
    doc.text(
      `Average Yearly Sales: Rp ${formatCurrency(summary.averageYearlySales)}`
    );
  }

  doc.moveDown();

  // Add sales data table
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("Sales Data", { underline: true });

  doc.moveDown(0.5);

  // Create table header
  const tableTop = doc.y;
  const tableLeft = 50;
  const tableRight = 550;
  const tableBottom = tableTop + 20;

  doc.fontSize(10).font("Helvetica-Bold");

  if (data.period === "daily") {
    drawTableRow(doc, tableTop, tableLeft, tableRight, [
      "Date",
      "Orders",
      "Items",
      "Total Sales",
    ]);

    // Table data
    let y = tableBottom;
    doc.font("Helvetica");

    data.data.dailySales.forEach((sale, index) => {
      const rowData = [
        sale.date,
        sale.totalOrders.toString(),
        sale.totalItems.toString(),
        `Rp ${formatCurrency(sale.totalSales)}`,
      ];

      y = drawTableRow(doc, y, tableLeft, tableRight, rowData, index % 2 === 0);

      // Add a new page if needed
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    });
  } else if (data.period === "monthly") {
    drawTableRow(doc, tableTop, tableLeft, tableRight, [
      "Period",
      "Orders",
      "Items",
      "Total Sales",
    ]);

    // Table data
    let y = tableBottom;
    doc.font("Helvetica");

    data.data.monthlySales.forEach((sale, index) => {
      const rowData = [
        sale.period,
        sale.totalOrders.toString(),
        sale.totalItems.toString(),
        `Rp ${formatCurrency(sale.totalSales)}`,
      ];

      y = drawTableRow(doc, y, tableLeft, tableRight, rowData, index % 2 === 0);

      // Add a new page if needed
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    });
  } else if (data.period === "yearly") {
    drawTableRow(doc, tableTop, tableLeft, tableRight, [
      "Year",
      "Orders",
      "Items",
      "Total Sales",
    ]);

    // Table data
    let y = tableBottom;
    doc.font("Helvetica");

    data.data.yearlySales.forEach((sale, index) => {
      const rowData = [
        sale.year.toString(),
        sale.totalOrders.toString(),
        sale.totalItems.toString(),
        `Rp ${formatCurrency(sale.totalSales)}`,
      ];

      y = drawTableRow(doc, y, tableLeft, tableRight, rowData, index % 2 === 0);

      // Add a new page if needed
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    });
  }
};

/**
 * Generate financial report content
 * @private
 */
const generateFinancialReportContent = (doc, data) => {
  // Add summary section
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("Financial Summary", { underline: true });

  doc.moveDown(0.5);

  const summary = data.data.summary;

  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Total Revenue: Rp ${formatCurrency(summary.totalRevenue)}`)
    .text(`Total Transactions: ${summary.totalTransactions}`)
    .text(
      `Average Transaction Value: Rp ${formatCurrency(
        summary.averageTransactionValue
      )}`
    );

  doc.moveDown();

  // Payment methods breakdown
  doc.fontSize(14).font("Helvetica-Bold").text("Payment Methods");

  doc.moveDown(0.5);

  // Create table header
  const tableTop = doc.y;
  const tableLeft = 50;
  const tableRight = 550;
  const tableBottom = tableTop + 20;

  doc.fontSize(10).font("Helvetica-Bold");

  drawTableRow(doc, tableTop, tableLeft, tableRight, [
    "Payment Method",
    "Transactions",
    "Total",
    "Average",
  ]);

  // Table data
  let y = tableBottom;
  doc.font("Helvetica");

  Object.entries(summary.byMethod).forEach(([method, data], index) => {
    const formattedMethod = formatPaymentMethod(method);
    const rowData = [
      formattedMethod,
      data.count.toString(),
      `Rp ${formatCurrency(data.total)}`,
      `Rp ${formatCurrency(data.total / data.count)}`,
    ];

    y = drawTableRow(doc, y, tableLeft, tableRight, rowData, index % 2 === 0);
  });

  doc.moveDown();

  // Revenue data table
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("Revenue Data", { underline: true });

  doc.moveDown(0.5);

  // Create table header
  const revenueTableTop = doc.y;

  doc.fontSize(10).font("Helvetica-Bold");

  drawTableRow(doc, revenueTableTop, tableLeft, tableRight, [
    "Period",
    "Transactions",
    "Revenue",
  ]);

  // Table data
  y = revenueTableTop + 20;
  doc.font("Helvetica");

  data.data.revenueData.forEach((item, index) => {
    const rowData = [
      item.period,
      item.transactionCount.toString(),
      `Rp ${formatCurrency(item.revenue)}`,
    ];

    y = drawTableRow(doc, y, tableLeft, tableRight, rowData, index % 2 === 0);

    // Add a new page if needed
    if (y > 700) {
      doc.addPage();
      y = 50;
    }
  });
};

/**
 * Generate inventory report content
 * @private
 */
const generateInventoryReportContent = (doc, data) => {
  // Material summary
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("Material Inventory Summary", { underline: true });

  doc.moveDown(0.5);

  const materialSummary = data.data.materialSummary;

  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Total Materials: ${materialSummary.totalMaterials}`)
    .text(
      `Total Inventory Value: Rp ${formatCurrency(materialSummary.totalValue)}`
    )
    .text(`Low Stock Items: ${materialSummary.lowStockCount}`);

  doc.moveDown();

  // Material inventory by type
  doc.fontSize(14).font("Helvetica-Bold").text("Materials by Type");

  doc.moveDown(0.5);

  // Create table header
  const materialTableTop = doc.y;
  const tableLeft = 50;
  const tableRight = 550;

  doc.fontSize(10).font("Helvetica-Bold");

  drawTableRow(doc, materialTableTop, tableLeft, tableRight, [
    "Material Type",
    "Count",
    "Value",
    "Low Stock",
  ]);

  // Table data
  let y = materialTableTop + 20;
  doc.font("Helvetica");

  Object.entries(materialSummary.byType).forEach(([type, data], index) => {
    const rowData = [
      type,
      data.count.toString(),
      `Rp ${formatCurrency(data.value)}`,
      data.lowStockCount.toString(),
    ];

    y = drawTableRow(doc, y, tableLeft, tableRight, rowData, index % 2 === 0);
  });

  doc.moveDown();

  // Product inventory summary
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("Product Inventory Summary", { underline: true });

  doc.moveDown(0.5);

  const productSummary = data.data.productSummary;

  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Total Products: ${productSummary.totalProducts}`)
    .text(`Total SKUs: ${productSummary.totalSKUs}`)
    .text(`Total Inventory Items: ${productSummary.totalInventoryItems}`);

  doc.moveDown();

  // Product inventory by category
  doc.fontSize(14).font("Helvetica-Bold").text("Products by Category");

  doc.moveDown(0.5);

  // Create table header
  const productTableTop = doc.y;

  doc.fontSize(10).font("Helvetica-Bold");

  drawTableRow(doc, productTableTop, tableLeft, tableRight, [
    "Category",
    "Products",
    "SKUs",
    "Inventory",
  ]);

  // Table data
  y = productTableTop + 20;
  doc.font("Helvetica");

  Object.entries(productSummary.byCategory).forEach(
    ([category, data], index) => {
      const rowData = [
        category,
        data.count.toString(),
        data.skuCount.toString(),
        data.totalInventory.toString(),
      ];

      y = drawTableRow(doc, y, tableLeft, tableRight, rowData, index % 2 === 0);

      // Add a new page if needed
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    }
  );

  // Add low stock materials list if there are any
  const lowStockMaterials = data.data.materialInventory.filter(
    (m) => m.needsReorder
  );

  if (lowStockMaterials.length > 0) {
    doc.addPage();

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Low Stock Materials", { underline: true });

    doc.moveDown(0.5);

    // Create table header
    const lowStockTableTop = doc.y;

    doc.fontSize(10).font("Helvetica-Bold");

    drawTableRow(doc, lowStockTableTop, tableLeft, tableRight, [
      "Material",
      "Type",
      "Current Stock",
      "Reorder Point",
      "Unit",
    ]);

    // Table data
    y = lowStockTableTop + 20;
    doc.font("Helvetica");

    lowStockMaterials.forEach((material, index) => {
      const rowData = [
        material.name,
        material.type,
        material.stockQuantity.toString(),
        material.reorderPoint.toString(),
        material.unit,
      ];

      y = drawTableRow(doc, y, tableLeft, tableRight, rowData, index % 2 === 0);

      // Add a new page if needed
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    });
  }
};

/**
 * Generate product performance report content
 * @private
 */
const generateProductPerformanceReportContent = (doc, data) => {
  // Category performance
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("Category Performance", { underline: true });

  doc.moveDown(0.5);

  // Create table header
  const categoryTableTop = doc.y;
  const tableLeft = 50;
  const tableRight = 550;

  doc.fontSize(10).font("Helvetica-Bold");

  drawTableRow(doc, categoryTableTop, tableLeft, tableRight, [
    "Category",
    "Products",
    "Quantity Sold",
    "Total Sales",
  ]);

  // Table data
  let y = categoryTableTop + 20;
  doc.font("Helvetica");

  data.data.categories.forEach((category, index) => {
    const rowData = [
      category.category,
      category.productCount.toString(),
      category.totalQuantity.toString(),
      `Rp ${formatCurrency(category.totalSales)}`,
    ];

    y = drawTableRow(doc, y, tableLeft, tableRight, rowData, index % 2 === 0);
  });

  doc.moveDown();

  // Top performing products
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("Top Performing Products", { underline: true });

  doc.moveDown(0.5);

  // Create table header
  const productTableTop = doc.y;

  doc.fontSize(10).font("Helvetica-Bold");

  drawTableRow(doc, productTableTop, tableLeft, tableRight, [
    "Product",
    "Category",
    "Quantity Sold",
    "Total Sales",
  ]);

  // Table data
  y = productTableTop + 20;
  doc.font("Helvetica");

  // Take top 15 products
  const topProducts = data.data.products.slice(0, 15);

  topProducts.forEach((product, index) => {
    const rowData = [
      product.productName,
      product.productCategory,
      product.totalQuantity.toString(),
      `Rp ${formatCurrency(product.totalSales)}`,
    ];

    y = drawTableRow(doc, y, tableLeft, tableRight, rowData, index % 2 === 0);

    // Add a new page if needed
    if (y > 700) {
      doc.addPage();
      y = 50;
    }
  });

  // Add size breakdown for top product
  if (topProducts.length > 0) {
    doc.addPage();

    const topProduct = topProducts[0];

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text(`Product Details: ${topProduct.productName}`, { underline: true });

    doc.moveDown(0.5);

    // Size breakdown
    doc.fontSize(14).font("Helvetica-Bold").text("Size Breakdown");

    doc.moveDown(0.5);

    // Create table header
    const sizeTableTop = doc.y;

    doc.fontSize(10).font("Helvetica-Bold");

    drawTableRow(doc, sizeTableTop, tableLeft, tableRight, [
      "Size",
      "Quantity Sold",
      "Percentage",
    ]);

    // Table data
    y = sizeTableTop + 20;
    doc.font("Helvetica");

    topProduct.sizeBreakdown.forEach((size, index) => {
      const percentage = (
        (size.quantity / topProduct.totalQuantity) *
        100
      ).toFixed(2);

      const rowData = [size.size, size.quantity.toString(), `${percentage}%`];

      y = drawTableRow(doc, y, tableLeft, tableRight, rowData, index % 2 === 0);
    });

    doc.moveDown();

    // Color breakdown
    doc.fontSize(14).font("Helvetica-Bold").text("Color Breakdown");

    doc.moveDown(0.5);

    // Create table header
    const colorTableTop = doc.y;

    doc.fontSize(10).font("Helvetica-Bold");

    drawTableRow(doc, colorTableTop, tableLeft, tableRight, [
      "Color",
      "Quantity Sold",
      "Percentage",
    ]);

    // Table data
    y = colorTableTop + 20;
    doc.font("Helvetica");

    topProduct.colorBreakdown.forEach((color, index) => {
      const percentage = (
        (color.quantity / topProduct.totalQuantity) *
        100
      ).toFixed(2);

      const rowData = [
        color.color,
        color.quantity.toString(),
        `${percentage}%`,
      ];

      y = drawTableRow(doc, y, tableLeft, tableRight, rowData, index % 2 === 0);
    });

    // Add material breakdown on a new page if needed
    if (y > 600) {
      doc.addPage();
      y = 50;
    } else {
      doc.moveDown();
    }

    // Material breakdown
    doc.fontSize(14).font("Helvetica-Bold").text("Material Breakdown");

    doc.moveDown(0.5);

    // Create table header
    const materialTableTop = doc.y;

    doc.fontSize(10).font("Helvetica-Bold");

    drawTableRow(doc, materialTableTop, tableLeft, tableRight, [
      "Material",
      "Quantity Sold",
      "Percentage",
    ]);

    // Table data
    y = materialTableTop + 20;
    doc.font("Helvetica");

    topProduct.materialBreakdown.forEach((material, index) => {
      const percentage = (
        (material.quantity / topProduct.totalQuantity) *
        100
      ).toFixed(2);

      const rowData = [
        material.material,
        material.quantity.toString(),
        `${percentage}%`,
      ];

      y = drawTableRow(doc, y, tableLeft, tableRight, rowData, index % 2 === 0);
    });
  }
};

/**
 * Draw a table row
 * @private
 */
const drawTableRow = (doc, y, left, right, cells, isEvenRow = true) => {
  const columnWidth = (right - left) / cells.length;
  const rowHeight = 20;

  // Draw background for even rows
  if (isEvenRow) {
    doc.rect(left, y, right - left, rowHeight).fill("#f2f2f2");
  }

  // Draw cell borders and text
  doc.strokeColor("#000000");

  cells.forEach((cell, i) => {
    const x = left + columnWidth * i;

    // Draw cell text
    doc.fillColor("#000000").text(cell, x + 5, y + 5, {
      width: columnWidth - 10,
      align: i === 0 ? "left" : "right",
    });

    // Draw cell border
    doc.rect(x, y, columnWidth, rowHeight).stroke();
  });

  return y + rowHeight;
};

/**
 * Format currency
 * @private
 */
const formatCurrency = (amount) => {
  return amount.toLocaleString("id-ID");
};

/**
 * Format payment method for display
 * @private
 */
const formatPaymentMethod = (method) => {
  const methodMap = {
    va_bca: "Virtual Account BCA",
    va_bni: "Virtual Account BNI",
    va_mandiri: "Virtual Account Mandiri",
    va_bri: "Virtual Account BRI",
    bank_transfer: "Bank Transfer",
    cash: "Cash",
    other: "Other",
  };

  return methodMap[method] || method;
};

module.exports = {
  generatePDF,
};
