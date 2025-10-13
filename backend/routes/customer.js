const express = require("express");
const {
  createCustomer,
  editCustomer,
  deleteCustomer,
  getAllCustomers,
  getCustomerById,
} = require("../controllers/customerController.js");
const requireAuth = require("../middleware/requireAuth");
const { allowLevels } = require("../middleware/accessControl");

const router = express.Router();

router.use(requireAuth);

// Create a new customer - All levels can create
router.post("/create", allowLevels("L1", "L2", "L3", "L4"), createCustomer);

// Edit a customer by ID - All levels can edit
router.patch("/edit/:id", allowLevels("L1", "L2", "L3", "L4"), editCustomer);

// Delete a customer by ID - L2 and L4 can delete (not L3)
router.delete("/delete/:id", allowLevels("L2", "L4"), deleteCustomer);

// Optional: get all customers - All levels can view
router.get("/all", allowLevels("L1", "L2", "L3", "L4"), getAllCustomers);

// Optional: get a single customer - All levels can view
router.get("/:id", allowLevels("L1", "L2", "L3", "L4"), getCustomerById);

module.exports = router;
