const express = require("express");

const { loginUser } = require("../controllers/userController.js");

const router = express.Router();

router.post("/login", loginUser);
// router.delete("/user/:id", deleteUser);

module.exports = router;
