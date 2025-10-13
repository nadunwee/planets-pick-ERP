const Employee = require("../models/employeeModel");
const User = require("../models/userModel");
const EmployeeChangeRequest = require("../models/EmployeeChangeRequest");

const isHRDepartment = (department = "") => {
  const normalized = department.trim().toLowerCase();
  return normalized === "human resources" || normalized === "hr";
};

const ensureHRRequester = (user) => {
  return user && isHRDepartment(user.department) && user.level === "L1";
};

const ensureHRApprover = (user) => {
  if (!user) return false;
  if (user.level === "L4") return true;
  return user.level === "L2" && isHRDepartment(user.department);
};

const createUserAccountIfNeeded = async (employee, payload = {}) => {
  if (!payload) return { warning: null };

  const shouldCreateUser = payload.createUser || payload.hasUserAccount;
  if (!shouldCreateUser || employee.userId) {
    return { warning: null };
  }

  try {
    const user = new User({
      email: employee.email,
      name: employee.name,
      department: employee.department || "General",
      role: employee.position || "Employee",
      password: payload.password || "changeme123!",
      level: payload.level || "L1",
      approved: false,
    });

    await user.save();
    employee.hasUserAccount = true;
    employee.userId = user._id;
    await employee.save();

    return {
      warning: null,
      message:
        "Employee updated and user account request sent to admin for approval",
    };
  } catch (error) {
    console.error("User account creation failed during approval:", error);
    return {
      warning:
        "Employee saved but user account creation failed. Try again later.",
    };
  }
};

exports.submitEmployeeChangeRequest = async (req, res) => {
  try {
    const user = req.user;

    if (!ensureHRRequester(user)) {
      return res.status(403).json({
        error:
          "Only HR Managers (L1) can submit employee change requests for approval",
      });
    }

    const { actionType, employeeId, payload, reason } = req.body;

    if (!actionType || !["create", "update", "delete"].includes(actionType)) {
      return res.status(400).json({ error: "Invalid or missing action type" });
    }

    if ((actionType === "update" || actionType === "delete") && !employeeId) {
      return res
        .status(400)
        .json({ error: "Employee ID is required for this action" });
    }

    const request = await EmployeeChangeRequest.create({
      actionType,
      employeeId: employeeId || null,
      payload: payload || {},
      requestedBy: user._id,
      requestedByName: user.name,
      requestedByLevel: user.level,
      requestedByDepartment: user.department,
      approvalNote: reason || null,
    });

    res.status(201).json({
      message: "Change request submitted for director approval",
      request,
    });
  } catch (error) {
    console.error("Error submitting employee change request:", error);
    res.status(500).json({
      error: error.message || "Failed to submit change request",
    });
  }
};

exports.getEmployeeChangeRequests = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const filter = {};
    const { status } = req.query;

    if (status) {
      filter.status = status;
    }

    if (user.level === "L1") {
      filter.requestedBy = user._id;
    } else if (!ensureHRApprover(user)) {
      return res.status(403).json({
        error: "You do not have permission to view change requests",
      });
    }

    const requests = await EmployeeChangeRequest.find(filter)
      .populate("employeeId", "name email department position status")
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error("Error fetching change requests:", error);
    res.status(500).json({
      error: error.message || "Failed to load change requests",
    });
  }
};

exports.approveEmployeeChangeRequest = async (req, res) => {
  try {
    const user = req.user;
    if (!ensureHRApprover(user)) {
      return res.status(403).json({
        error: "Only HR Directors (L2) or Admins (L4) can approve requests",
      });
    }

    const { id } = req.params;
    const { approvalNote } = req.body || {};

    const request = await EmployeeChangeRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: "Change request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: "Request already processed" });
    }

    let responsePayload = {};

    if (request.actionType === "create") {
      const employee = new Employee(request.payload || {});
      await employee.save();

      const { warning, message } = await createUserAccountIfNeeded(
        employee,
        request.payload
      );

      responsePayload.employee = employee;
      responsePayload.message =
        message || "Employee created successfully via approval";
      responsePayload.warning = warning;
    }

    if (request.actionType === "update") {
      if (!request.employeeId) {
        return res.status(400).json({
          error: "Change request is missing the target employee",
        });
      }

      const employee = await Employee.findById(request.employeeId);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const hasExistingUser = employee.userId && employee.hasUserAccount;
      if (hasExistingUser && request.payload?.hasUserAccount === false) {
        return res.status(400).json({
          error:
            "Cannot remove user account for employee who already has an account",
        });
      }

      Object.assign(employee, request.payload || {});
      await employee.save();

      const { warning, message } = await createUserAccountIfNeeded(
        employee,
        request.payload
      );

      if (hasExistingUser && employee.userId) {
        try {
          const linkedUser = await User.findById(employee.userId);
          if (linkedUser) {
            linkedUser.name = employee.name;
            linkedUser.email = employee.email;
            linkedUser.department =
              employee.department || linkedUser.department;
            linkedUser.role = employee.position || linkedUser.role;
            await linkedUser.save();
          }
        } catch (syncError) {
          console.error("Failed to sync user account updates:", syncError);
        }
      }

      responsePayload.employee = employee;
      responsePayload.message =
        message || "Employee updated successfully via approval";
      responsePayload.warning = warning;
    }

    if (request.actionType === "delete") {
      if (!request.employeeId) {
        return res.status(400).json({
          error: "Change request is missing the target employee",
        });
      }

      const employee = await Employee.findById(request.employeeId);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      if (employee.userId) {
        try {
          await User.findByIdAndDelete(employee.userId);
        } catch (deleteError) {
          console.error("Failed to remove linked user:", deleteError);
        }
      }

      employee.status = "inactive";
      employee.hasUserAccount = false;
      employee.userId = null;
      await employee.save();

      responsePayload.employee = employee;
      responsePayload.message = "Employee deactivated successfully";
    }

    request.status = "approved";
    request.approvedBy = user._id;
    request.approvedByName = user.name;
    request.approvalNote = approvalNote || request.approvalNote;
    await request.save();

    res.json({
      ...responsePayload,
      request,
    });
  } catch (error) {
    console.error("Error approving change request:", error);
    res.status(500).json({
      error: error.message || "Failed to approve change request",
    });
  }
};

exports.rejectEmployeeChangeRequest = async (req, res) => {
  try {
    const user = req.user;
    if (!ensureHRApprover(user)) {
      return res.status(403).json({
        error: "Only HR Directors (L2) or Admins (L4) can reject requests",
      });
    }

    const { id } = req.params;
    const { approvalNote } = req.body || {};

    const request = await EmployeeChangeRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: "Change request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: "Request already processed" });
    }

    request.status = "rejected";
    request.approvedBy = user._id;
    request.approvedByName = user.name;
    request.approvalNote = approvalNote || request.approvalNote;
    await request.save();

    res.json({
      message: "Change request rejected",
      request,
    });
  } catch (error) {
    console.error("Error rejecting change request:", error);
    res.status(500).json({
      error: error.message || "Failed to reject change request",
    });
  }
};
