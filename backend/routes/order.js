const express = require("express");
const {
  createOrder,
  editOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
} = require("../controllers/orderController.js");

const router = express.Router();

// Create a new order
router.post("/create", createOrder);

// Edit an order by ID
router.patch("/edit/:id", editOrder);

// Delete an order by ID
router.delete("/delete/:id", deleteOrder);

// Get all orders
router.get("/all", getAllOrders);

// Get a single order
router.get("/:id", getOrderById);

module.exports = router;
