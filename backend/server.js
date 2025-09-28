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
app.use("/api/finance", financeRoutes); // Finance endpoints
app.use("/api/users", userRoutes); // User endpoints
app.use("/api/employees", employeeRoutes); // Employee endpoints
app.use("/api/inventory", inventoryRoutes); // Inventory endpoints
app.use("/api/production", productionRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);

// Additional routes from ranudi branch
app.use("/api/reports", require("./routes/reportRoutes.js"));
app.use("/api/suppliers", require("./routes/supplierRoutes.js"));
app.use("/api/purchase-orders", require("./routes/purchaseOrderRoutes.js"));

// Error handling middleware from ranudi branch
app.use(require("./middleware/errorHandler.js").notFound);
app.use(require("./middleware/errorHandler.js").errorHandler);

// ✅ Connect to MongoDB and start server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log("✅ Connected to MongoDB");

    app.listen(process.env.PORT, () => {
      console.log(`✅ Server listening on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    // Start server regardless of database connection
    app.listen(process.env.PORT, () => {
      console.log(
        `✅ Server listening on port ${process.env.PORT} (without DB)`
      );
    });
  }
};

startServer();
