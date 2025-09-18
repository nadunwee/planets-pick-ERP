// routes/employee.js
const express = require("express");
const {
  addEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController.js");

const router = express.Router();

/**
 * Employee Routes
 */

// ➕ Create a new employee (with optional user account request)
router.post("/", addEmployee);

// 📋 Get all employees
router.get("/", getEmployees);

// 🔍 Get single employee by ID
router.get("/:id", getEmployeeById);

// ✏️ Update employee by ID (HR can also promote employee to user here)
router.put("/:id", updateEmployee);

// ❌ Delete employee by ID
router.delete("/:id", deleteEmployee);

module.exports = router;
