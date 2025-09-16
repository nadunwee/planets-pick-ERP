// controllers/employeeController.js
const Employee = require("../models/employeeModel.js");

// Add a new employee
async function addEmployee(req, res) {
  try {
    const employeeData = req.body;

    const employee = new Employee(employeeData);
    await employee.save();

    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Get all employees
async function getEmployees(req, res) {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get single employee by ID
async function getEmployeeById(req, res) {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update employee
async function updateEmployee(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const employee = await Employee.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(200).json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Delete employee
async function deleteEmployee(req, res) {
  try {
    const { id } = req.params;
    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  addEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
