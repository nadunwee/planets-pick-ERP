const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/userModel.js");
const { log } = require("console");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET);
};

async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    // create a token
    const name = user.name;
    const token = createToken(user._id);
    const department = user.department;
    const level = user.level;
    res.status(200).json({ email, token, name, department, level });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Get all users
async function getAllUsers(req, res) {
  try {
    const items = await User.find();
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

async function editUserApproval(req, res) {
  const { id } = req.params;
  const { approved, level } = req.body; // get level as well

  try {
    const updates = {
      approved,
      level: level || undefined, // undefined will not overwrite if not provided
    };

    const user = await User.findByIdAndUpdate(id, updates, { new: true });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating user approval:", error);
    res.status(500).json({ error: "Failed to update user approval" });
  }
}

const registerUser = async (req, res) => {
  const { name, email, password, department, role } = req.body;

  try {
    // register with extra fields
    const user = await User.register({
      name,
      email,
      password,
      department,
      role,
      approved: false, // default
      level: "", // leave blank
    });

    // create a token
    const token = createToken(user._id);

    res.status(200).json({
      name: user.name,
      email: user.email,
      department: user.department,
      role: user.role,
      approved: user.approved,
      level: user.level,
      token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// ✅ Approve/Reject User
async function approveUser(req, res) {
  const { id } = req.params;
  const { approved, level } = req.body;

  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Prepare updates
    const updates = {
      approved: approved, // true, false, or "rejected"
      ...(level && { level }), // only update if level is passed
    };

    const user = await User.findByIdAndUpdate(id, updates, { new: true });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error approving user:", errorj);
    res.status(500).json({ error: "Failed to approve user" });
  }
}

module.exports = {
  loginUser,
  getAllUsers,
  editUserApproval,
  registerUser,
  deleteUser,
  approveUser,
};
