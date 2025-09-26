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
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // frontend origin
    credentials: true,
  })
);

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

// ✅ Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Try to connect to MongoDB with a timeout
    const connectPromise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    });
    
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("MongoDB connection timeout")), 6000)
    );
    
    await Promise.race([connectPromise, timeoutPromise]);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    console.log("🔄 Starting server without database connection for testing...");
  }
  
  // Start server regardless of database connection
  app.listen(process.env.PORT, () => {
    console.log(
      `✅ Server listening on port ${process.env.PORT}`
    );
  });
};

startServer();
