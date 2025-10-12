// routes/user.js
const express = require("express");
const {
  loginUser,
  getAllUsers,
  editUserApproval,
  registerUser,
  deleteUser,
  approveUser,
} = require("../controllers/userController.js");
const requireAuth = require("../middleware/requireAuth");
const { allowLevels } = require("../middleware/accessControl");

const router = express.Router();

// User authentication (no auth required)
router.post("/login", loginUser);

// ✅ Create a new user (RESTful) - only L4 can create users
router.post("/", requireAuth, allowLevels("L4"), registerUser);

// List users - only L4 can view all users
router.get("/", requireAuth, allowLevels("L4"), getAllUsers);

// Edit user approval - only L4 can edit
router.patch("/:id", requireAuth, allowLevels("L4"), editUserApproval);

// Delete user - only L4 can delete
router.delete("/:id", requireAuth, allowLevels("L4"), deleteUser);

// Approve user - only L4 can approve
router.patch("/approve/:id", requireAuth, allowLevels("L4"), approveUser);

module.exports = router;
