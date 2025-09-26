// controllers/reportController.js
const path = require("path");

exports.getReportsDashboard = async (req, res) => {
  try {
    // Mock DB data
    const reports = [
      {
        id: "1",
        title: "Monthly Procurement Summary",
        category: "Procurement",
        date: "2025-09-01",
        fileUrl: "/api/reports/view/1",   // endpoint to view
        downloadUrl: "/api/reports/download/1", // endpoint to download
      },
      {
        id: "2",
        title: "Supplier Performance Report",
        category: "Suppliers",
        date: "2025-09-05",
        fileUrl: "/api/reports/view/2",
        downloadUrl: "/api/reports/download/2",
      },
      {
        id: "3",
        title: "Purchase Order Analysis",
        category: "Orders",
        date: "2025-09-10",
        fileUrl: "/api/reports/view/3",
        downloadUrl: "/api/reports/download/3",
      },
    ];

    res.json({ reports });
  } catch (err) {
    res.status(500).json({ message: "Failed to load reports" });
  }
};

// Serve PDF inline (for viewing)
exports.viewReport = (req, res) => {
  const { id } = req.params;
  let file;

  switch (id) {
    case "1":
      file = "procurement-summary.pdf";
      break;
    case "2":
      file = "supplier-performance.pdf";
      break;
    case "3":
      file = "purchase-orders.pdf";
      break;
    default:
      return res.status(404).json({ message: "Report not found" });
  }

  const filePath = path.join(__dirname, "..", "reports", file);
  res.sendFile(filePath);
};

// Download PDF
exports.downloadReport = (req, res) => {
  const { id } = req.params;
  let file;

  switch (id) {
    case "1":
      file = "procurement-summary.pdf";
      break;
    case "2":
      file = "supplier-performance.pdf";
      break;
    case "3":
      file = "purchase-orders.pdf";
      break;
    default:
      return res.status(404).json({ message: "Report not found" });
  }

  const filePath = path.join(__dirname, "..", "reports", file);
  res.download(filePath);
};
