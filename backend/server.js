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

const app = express();

// ✅ Fix CORS issue (allow frontend requests)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // frontend origin
    credentials: true,
  })
);

// ✅ Middleware
app.use(express.json()); // Parse JSON request body

// Request logger (for debugging)
app.use((req, res, next) => {
  console.log(`[SERVER] ${req.method} ${req.path}`);
  next();
});

// ✅ Routes
app.use("/api/users", userRoutes); // pluralized for consistency
app.use("/api/employees", employeeRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/customers", customerRoutes);

// ✅ Connect to database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(
        `✅ Connected to DB and listening on port ${process.env.PORT}`
      );
    });
  })
  .catch((error) => {
    console.error("❌ Database connection error:", error);
  });
