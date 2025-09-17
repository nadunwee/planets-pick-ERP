const express = require("express");

const {
  loginUser,
  getAllUsers,
  editUserApproval,
  registerUser,
  deleteUser,
} = require("../controllers/userController.js");

const router = express.Router();

router.post("/login", loginUser);
router.post("/createUser", registerUser);
router.get("/all_users", getAllUsers);
router.delete("/:id", deleteUser);
router.patch("/edit_approval/:id", editUserApproval);

module.exports = router;
