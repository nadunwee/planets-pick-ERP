const Employee = require("../models/employeeModel.js");
const User = require("../models/userModel.js");
const mongoose = require("mongoose");

// Add a new employee
async function addEmployee(req, res) {
  try {
    const employeeData = req.body;

    // Create employee first
    const employee = new Employee(employeeData);
    await employee.save();

    // Create user account if requested
    if (employeeData.createUser || employeeData.hasUserAccount) {
      try {
        const user = new User({
          email: employee.email,
          name: employee.name,
          department: employee.department || "General",
          role: employee.position || "Employee",
          password: employeeData.password || "changeme123!",
          approved: false, // Always needs admin approval
        });

        await user.save();

        // Update employee with user reference
        employee.hasUserAccount = true;
        employee.userId = user._id;
        await employee.save();

        res.status(201).json({
          employee,
          message:
            "Employee created and user account request sent to admin for approval",
        });
      } catch (userError) {
        // If user creation fails, still return success for employee creation
        console.error("User creation failed:", userError);
        res.status(201).json({
          employee,
          warning:
            "Employee created but user account creation failed. Try again later.",
        });
      }
    } else {
      res.status(201).json({ employee });
    }
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

    // Check if employee already has a user account
    const hasExistingUser = employee.userId && employee.hasUserAccount;

    // If employee has existing user account, prevent unchecking hasUserAccount
    if (hasExistingUser && updates.hasUserAccount === false) {
      return res.status(400).json({
        error:
          "Cannot remove user account for employee who already has one. Delete employee instead if needed.",
      });
    }

    // Apply updates to employee
    Object.assign(employee, updates);
    await employee.save();

    // Handle new user account creation request
    if ((updates.createUser || updates.hasUserAccount) && !hasExistingUser) {
      try {
        const user = new User({
          email: employee.email,
          name: employee.name,
          department: employee.department || "General",
          role: employee.position || "Employee",
          password: updates.password || "changeme123!",
          approved: false, // Always needs admin approval
        });

        await user.save();

        employee.hasUserAccount = true;
        employee.userId = user._id;
        await employee.save();

        return res.status(200).json({
          employee,
          message:
            "Employee updated and user account request sent to admin for approval",
        });
      } catch (userError) {
        console.error("User creation failed during update:", userError);
        return res.status(200).json({
          employee,
          warning:
            "Employee updated but user account creation failed. Try again later.",
        });
      }
    }

    // If employee has existing user account, sync the updates to user table
    if (hasExistingUser && employee.userId) {
      try {
        const user = await User.findById(employee.userId);
        if (user) {
          // Update user fields that correspond to employee fields
          user.name = employee.name;
          user.email = employee.email;
          user.department = employee.department || user.department;
          user.role = employee.position || user.role;
          await user.save();
          
          return res.status(200).json({
            employee,
            message: "Employee and user account updated successfully",
          });
        }
      } catch (userError) {
        console.error("User update failed:", userError);
        return res.status(200).json({
          employee,
          warning: "Employee updated but user account sync failed.",
        });
      }
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

    if (!id) return res.status(400).json({ error: "Missing employee ID" });

    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    // If employee has linked user account, delete from users table
    if (employee.userId) {
      try {
        await User.findByIdAndDelete(employee.userId);
        console.log(
          `User account ${employee.userId} deleted for employee ${employee.name}`
        );
      } catch (userDeleteError) {
        console.error("Failed to delete user account:", userDeleteError);
        // Continue with employee soft delete even if user deletion fails
      }
    }

    // Soft delete employee (mark as inactive)
    employee.status = "inactive";
    employee.hasUserAccount = false; // Clear user account flag
    employee.userId = null; // Clear user reference
    await employee.save();

    res.status(200).json({
      message: `Employee ${employee.name} has been deactivated successfully${
        employee.userId ? " and user account removed" : ""
      }`,
    });
  } catch (error) {
    console.error("Delete employee error:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
}

module.exports = {
  addEmployee,
  getEmployees: async (req, res) => {
    try {
      // Filter out inactive employees by default unless specifically requested
      const showInactive = req.query.showInactive === "true";
      const filter = showInactive ? {} : { status: { $ne: "inactive" } };

      const employees = await Employee.find(filter)
        .populate("userId", "approved")
        .sort({ createdAt: -1 });
      res.status(200).json(employees);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getEmployeeById: async (req, res) => {
    try {
      const employee = await Employee.findById(req.params.id).populate(
        "userId",
        "approved"
      );
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
 