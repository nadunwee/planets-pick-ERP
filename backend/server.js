require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRoutes = require("./routes/user.js");
const employeeRoutes = require("./routes/employee.js");
const inventoryRoutes = require("./routes/inventory.js");

const app = express();

// Fix CORS issue
app.use(
  cors({
    origin: "http://localhost:5173", // frontend origin
    credentials: true,
  })
);

// middleware
app.use(express.json()); // parse JSON request body
app.use((req, res, next) => {
  console.log(`Server js ${req.path}, ${req.method}`);
  next();
});

// routes
app.use("/api/user", userRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/inventory", inventoryRoutes);

// Connect to database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("✅ Connected to DB and listening on port", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log("❌ Database connection error:", error);
  });
