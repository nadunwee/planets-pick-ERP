// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Routes
const userRoutes = require("./routes/user.js");
const employeeRoutes = require("./routes/employee.js");
const inventoryRoutes = require("./routes/inventory.js");
const customerRoutes = require("./routes/customer.js");
const orderRoutes = require("./routes/order.js");
const financeRoutes = require("./routes/finance.js");
const productionRoutes = require("./routes/production.js");
const dashboardRoutes = require("./routes/dashboard.js");

const app = express();

// ✅ Middleware
app.use(express.json()); // Parse JSON request body
app.use(cors()); // allow all origins for testing

// ✅ Request logger (for debugging)
app.use((req, res, next) => {
  console.log(`[SERVER] ${req.method} ${req.path}`);
  next();
});

// ✅ Routes (RESTful and consistent)
app.use("/api/dashboard", dashboardRoutes); // Dashboard endpoints
app.use("/api/finance", financeRoutes); // Finance endpoints
app.use("/api/users", userRoutes); // User endpoints
app.use("/api/employees", employeeRoutes); // Employee endpoints
app.use("/api/inventory", inventoryRoutes); // Inventory endpoints
app.use("/api/production", productionRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/finance-ai", require("./routes/financeAi.js"));
app.use("/api/chatbot", require("./routes/chatbot.js"));
app.use("/api/invoices", require("./routes/invoice.js"));

// Additional routes from ranudi branch
app.use("/api/reports", require("./routes/reportRoutes.js"));
app.use("/api/suppliers", require("./routes/supplierRoutes.js"));
app.use("/api/purchase-orders", require("./routes/purchaseOrderRoutes.js"));
app.use(
  "/api/procurement-requests",
  require("./routes/procurementApprovalRoutes.js")
);

// Procurement Reports routes
app.use(
  "/api/procurement-reports",
  require("./routes/procurementReportsRoutes.js")
);

// Error handling middleware from ranudi branch
app.use(require("./middleware/errorHandler.js").notFound);
app.use(require("./middleware/errorHandler.js").errorHandler);

// ✅ Connect to MongoDB and start server
const startServer = async () => {
  const primaryUri = process.env.MONGO_URI;
  const fallbackUri =
    process.env.MONGO_FALLBACK_URI ||
    "mongodb://127.0.0.1:27017/planets-pick-erp";

  const tryConnect = async (uri, label) => {
    if (!uri) return false;
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 4000,
      });
      console.log(`✅ Connected to MongoDB (${label})`);
      return true;
    } catch (error) {
      console.error(`❌ Database connection error (${label}):`, error.message);
      return false;
    }
  };

  const connected =
    (await tryConnect(primaryUri, "primary")) ||
    (primaryUri !== fallbackUri && (await tryConnect(fallbackUri, "fallback")));

  if (!connected) {
    console.warn(
      "⚠️ Continuing without a database connection. Data-dependent features will use mock data where available."
    );
  }

  app.listen(process.env.PORT, () => {
    console.log(
      `✅ Server listening on port ${process.env.PORT}${
        connected ? "" : " (without DB)"
      }`
    );
  });
};

startServer();
