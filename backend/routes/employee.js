// routes/employee.js
const express = require("express");
const {
  addEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController.js");
const {
  submitEmployeeChangeRequest,
  getEmployeeChangeRequests,
  approveEmployeeChangeRequest,
  rejectEmployeeChangeRequest,
} = require("../controllers/employeeApprovalController.js");
const requireAuth = require("../middleware/requireAuth");
const { allowLevels } = require("../middleware/accessControl");

const router = express.Router();

/**
 * Employee Routes
 */

// ➕ Create a new employee (with optional linked user account) - HR Directors (L2), Admins (L4), and Super Admins (L5)
router.post("/", requireAuth, allowLevels("L2", "L4", "L5"), addEmployee);

// 📋 Get all employees - all authenticated users can view
router.get("/", requireAuth, getEmployees);

// 🔍 Get single employee by ID - all authenticated users can view
router.get("/:id", requireAuth, getEmployeeById);

// ✏️ Update employee by ID - HR Directors (L2), Admins (L4), and Super Admins (L5)
router.put("/:id", requireAuth, allowLevels("L2", "L4", "L5"), updateEmployee);

// ❌ Delete employee by ID - HR Directors (L2), Admins (L4), and Super Admins (L5)
router.delete("/:id", requireAuth, allowLevels("L2", "L4", "L5"), deleteEmployee);

// 📨 Change request workflow for HR Managers (L1)
router.post(
  "/requests",
  requireAuth,
  allowLevels("L1", "L2", "L4", "L5"),
  submitEmployeeChangeRequest
);

// 📥 List change requests - L1 see own, L2/L4/L5 see all
router.get(
  "/requests",
  requireAuth,
  allowLevels("L1", "L2", "L4", "L5"),
  getEmployeeChangeRequests
);

// ✅ Approve change request
router.post(
  "/requests/:id/approve",
  requireAuth,
  allowLevels("L2", "L4", "L5"),
  approveEmployeeChangeRequest
);

// 🚫 Reject change request
router.post(
  "/requests/:id/reject",
  requireAuth,
  allowLevels("L2", "L4", "L5"),
  rejectEmployeeChangeRequest
);

module.exports = router;
