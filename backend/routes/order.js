const express = require("express");
const {
  createOrder,
  editOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
} = require("../controllers/orderController.js");
const requireAuth = require("../middleware/requireAuth");
const { allowLevels } = require("../middleware/accessControl");

const router = express.Router();

router.use(requireAuth);

// Create a new order - All levels can create
router.post("/create", allowLevels("L1", "L2", "L3", "L4", "L5"), createOrder);

// Edit an order by ID - All levels can edit
router.patch("/edit/:id", allowLevels("L1", "L2", "L3", "L4", "L5"), editOrder);

// Delete an order by ID - L2, L4, and L5 can delete (not L3)
router.delete("/delete/:id", allowLevels("L2", "L4", "L5"), deleteOrder);

// Get all orders - All levels can view
router.get("/all", allowLevels("L1", "L2", "L3", "L4", "L5"), getAllOrders);

// Get a single order - All levels can view
router.get("/:id", allowLevels("L1", "L2", "L3", "L4", "L5"), getOrderById);

module.exports = router;
