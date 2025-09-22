const Employee = require("../models/employeeModel.js");
const User = require("../models/userModel.js");
const mongoose = require("mongoose");

// Add a new employee
async function addEmployee(req, res) {
  try {
    const employeeData = req.body;

    const employee = new Employee(employeeData);
    await employee.save();

    // Create user if requested
    if (employee.hasUserAccount) {
      const user = new User({
        email: employee.email,
        name: employee.name,
        department: employee.department || "General",
        role: employee.position || "Employee",
        password: employee.password || "changeme123!", // default if not provided
        approved: false,
      });

      await user.save();
      employee.userId = user._id;
      await employee.save();
    }

    res.status(201).json({ employee });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Update employee
async function updateEmployee(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) return res.status(400).json({ error: "Missing employee ID" });

    let employee = await Employee.findById(id);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    // Prevent unchecking hasUserAccount if user already exists
    if (employee.userId && updates.hasUserAccount === false) {
      delete updates.hasUserAccount;
    }

    // Apply updates
    Object.assign(employee, updates);
    await employee.save();

    // If HR promotes employee to user
    if (employee.hasUserAccount && !employee.userId) {
      const user = new User({
        email: employee.email,
        name: employee.name,
        department: employee.department || "General",
        role: employee.position || "Employee",
        password: "changeme123!",
        approved: false,
      });

      await user.save();
      employee.userId = user._id;
      await employee.save();
    }

    return res.status(200).json({ employee });
  } catch (error) {
    console.error("Update employee error:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
}

// Delete employee (soft delete + optional user deletion)
async function deleteEmployee(req, res) {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);

    if (!employee) return res.status(404).json({ error: "Employee not found" });

    // If employee has linked user, delete user (hard delete)
    if (employee.userId) {
      await User.findByIdAndDelete(employee.userId);
    }

    // Soft delete employee
    employee.status = "inactive";
    await employee.save();

    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Delete employee error:", error);
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  addEmployee,
  getEmployees: async (req, res) => {
    try {
      const employees = await Employee.find().sort({ createdAt: -1 });
      res.status(200).json(employees);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getEmployeeById: async (req, res) => {
    try {
      const employee = await Employee.findById(req.params.id);
      if (!employee)
        return res.status(404).json({ error: "Employee not found" });
      res.status(200).json(employee);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  updateEmployee,
  deleteEmployee,
};
