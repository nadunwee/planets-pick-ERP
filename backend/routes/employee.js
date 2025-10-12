// routes/employee.js
const express = require("express");
const {
  addEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController.js");
const requireAuth = require("../middleware/requireAuth");
const { allowLevels } = require("../middleware/accessControl");

const router = express.Router();

/**
 * Employee Routes
 */

// ➕ Create a new employee (with optional linked user account) - only L4 can add employees
router.post("/", requireAuth, allowLevels("L4"), addEmployee);

// 📋 Get all employees - all authenticated users can view
router.get("/", requireAuth, getEmployees);

// 🔍 Get single employee by ID - all authenticated users can view
router.get("/:id", requireAuth, getEmployeeById);

// ✏️ Update employee by ID - L4 only can update employees
router.put("/:id", requireAuth, allowLevels("L4"), updateEmployee);

// ❌ Delete employee by ID - only L4 can delete employees
router.delete("/:id", requireAuth, allowLevels("L4"), deleteEmployee);

module.exports = router;
