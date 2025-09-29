const express = require("express");
const {
  createCustomer,
  editCustomer,
  deleteCustomer,
  getAllCustomers,
  getCustomerById,
} = require("../controllers/customerController.js");

const router = express.Router();

// Create a new customer
router.post("/create", createCustomer);

// Edit a customer by ID
router.patch("/edit/:id", editCustomer);

// Delete a customer by ID
router.delete("/delete/:id", deleteCustomer);

// Optional: get all customers
router.get("/all", getAllCustomers);

// Optional: get a single customer
router.get("/:id", getCustomerById);

module.exports = router;
