const express = require("express");

const {
  loginUser,
  getAllUsers,
  editUser,
  editUserApproval,
  registerUser,
} = require("../controllers/userController.js");

const router = express.Router();

router.post("/login", loginUser);
router.post("/createUser", registerUser);
router.get("/all_users", getAllUsers);
// router.delete("/user/:id", deleteUser);
router.patch("/edit_approval/:id", editUserApproval);

module.exports = router;
