// routes/user.js
const express = require("express");
const {
  loginUser,
  getAllUsers,
  editUserApproval,
  registerUser,
  deleteUser,
} = require("../controllers/userController.js");

const router = express.Router();

// User authentication
router.post("/login", loginUser);

// ✅ Create a new user (RESTful)
router.post("/", registerUser);

// List users
router.get("/", getAllUsers);

// Edit user approval
router.patch("/:id", editUserApproval);

// Delete user
router.delete("/:id", deleteUser);

module.exports = router;
