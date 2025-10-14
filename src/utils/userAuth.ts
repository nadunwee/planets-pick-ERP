// User authentication and access control utilities

export type UserLevel = "L1" | "L2" | "L3" | "L4" | "L5";

export interface UserInfo {
  name: string;
  department: string;
  level: UserLevel;
  type: string;
}

/**
 * Get current user information from localStorage
 */
export const getCurrentUser = (): UserInfo | null => {
  const name = localStorage.getItem("name");
  const department = localStorage.getItem("department");
  const level = localStorage.getItem("level") as UserLevel;
  const type = localStorage.getItem("type");

  if (!name || !level) {
    return null;
  }

  return {
    name,
    department: department || "",
    level,
    type: type || "",
  };
};

/**
 * Check if user can download reports
 * Level 1: Cannot download reports
 * Level 2: Can download reports for their function
 * Level 3: Can download all reports
 * Level 4: Can download all reports
 */
export const canDownloadReports = (userLevel: UserLevel): boolean => {
  return userLevel !== "L1";
};

/**
 * Check if user can download a specific report category
 * Level 1: Cannot download any reports
 * Level 2: Can download only their department's reports
 * Level 3: Can download all reports
 * Level 4: Can download all reports
 * Level 5: Can download all reports (Super Admin)
 */
export const canDownloadReportCategory = (
  userLevel: UserLevel,
  userDepartment: string,
  reportCategory: string
): boolean => {
  // Level 1 cannot download anything
  if (userLevel === "L1") {
    return false;
  }

  // Level 5 (Super Admin) can download everything
  if (userLevel === "L5") {
    return true;
  }

  // Level 4 can download everything including Finance reports
  if (userLevel === "L4") {
    return true;
  }

  // Level 3 can download all reports EXCEPT Finance (Finance reports are L4 only)
  if (userLevel === "L3") {
    return reportCategory.toLowerCase() !== "finance";
  }

  // Level 2 can only download reports relevant to their department/function
  if (userLevel === "L2") {
    return isReportRelevantToDepartment(userDepartment, reportCategory);
  }

  return false;
};

/**
 * Map department to relevant report categories
 */
const departmentCategoryMap: Record<string, string[]> = {
  Procurement: ["procurement", "suppliers", "orders"],
  Sales: ["sales", "orders"],
  Finance: ["finance"],
  Inventory: ["inventory"],
  Production: ["production", "orders"],
  "Human Resources": ["hr"],
  HR: ["hr"],
  Administration: [
    "procurement",
    "suppliers",
    "orders",
    "inventory",
    "finance",
  ],
  Wastage: ["wastage"],
};

const isReportRelevantToDepartment = (
  department: string,
  reportCategory: string
): boolean => {
  const relevantCategories = departmentCategoryMap[department] || [];
  return relevantCategories.includes(reportCategory.toLowerCase());
};

export const canManageSuppliers = (level: UserLevel): boolean => {
  // All levels can add suppliers (L1-L5)
  return level === "L1" || level === "L2" || level === "L3" || level === "L4" || level === "L5";
};

export const canDeleteSuppliers = (level: UserLevel): boolean => {
  // Only L2 (Director), L4 (Admin), and L5 (Super Admin) can delete suppliers
  // L3 (Finance Manager) cannot delete items from other departments
  return level === "L2" || level === "L4" || level === "L5";
};

export const canCreatePurchaseOrders = (level: UserLevel): boolean => {
  // L1 can create, L2+ can create and approve
  return level === "L1" || level === "L2" || level === "L3" || level === "L4" || level === "L5";
};

export const canApprovePurchaseOrders = (level: UserLevel): boolean => {
  // Only L2 (Director), L4 (Admin), and L5 (Super Admin) can approve purchase orders
  // L3 (Finance Manager) cannot approve other department items
  return level === "L2" || level === "L4" || level === "L5";
};

export const canMarkDelivered = (level: UserLevel): boolean => {
  // L2 (Director), L4 (Admin), and L5 (Super Admin) can mark delivered
  // L3 (Finance Manager) cannot mark delivered for other department items
  return level === "L2" || level === "L4" || level === "L5";
};

export const canGenerateInvoices = (level: UserLevel): boolean => {
  // Only L3 (Finance Manager), L4 (Admin), and L5 (Super Admin) can generate invoices
  return level === "L3" || level === "L4" || level === "L5";
};

export const canViewInvoiceLibrary = (level: UserLevel): boolean => {
  // All levels can view invoices
  return level === "L1" || level === "L2" || level === "L3" || level === "L4" || level === "L5";
};

export const canManageUsers = (level: UserLevel): boolean => {
  // Only L4 (Admin) and L5 (Super Admin) can add/delete users
  return level === "L4" || level === "L5";
};

export const canApproveUsers = (level: UserLevel): boolean => {
  // Only L4 (Admin) and L5 (Super Admin) can approve/reject user accounts
  return level === "L4" || level === "L5";
};

export const canApproveTransactions = (level: UserLevel): boolean => {
  // Only L4 (Finance Director/Admin) and L5 (Super Admin) can approve transactions
  return level === "L4" || level === "L5";
};

export const canViewReportCategory = (
  userLevel: UserLevel,
  department: string,
  category: string
): boolean => {
  // L1 cannot view any reports
  if (userLevel === "L1") return false;
  
  // L5 (Super Admin) can view all reports
  if (userLevel === "L5") return true;
  
  // L4 can view all reports including Finance
  if (userLevel === "L4") return true;
  
  // L3 can view all reports EXCEPT Finance reports (Finance reports are L4 only)
  if (userLevel === "L3") {
    return category.toLowerCase() !== "finance";
  }
  
  // L2 can only view reports relevant to their department
  if (userLevel === "L2") {
    return isReportRelevantToDepartment(department, category);
  }
  
  return false;
};

/**
 * Get user level display name
 */
export const getUserLevelName = (level: UserLevel): string => {
  const levelNames: Record<UserLevel, string> = {
    L1: "Manager",
    L2: "Director",
    L3: "Finance Manager",
    L4: "Admin/Finance Director",
    L5: "Super Admin",
  };
  return levelNames[level] || level;
};

/**
 * Get user permissions description
 */
export const getUserPermissionsDescription = (level: UserLevel): string => {
  const descriptions: Record<UserLevel, string> = {
    L1: "Manager - Can add new entries, cannot approve or view reports",
    L2: "Director - Can approve department submissions and view/download department reports",
    L3: "Finance Manager - Can view all reports except Finance, add transactions (requires L4 approval)",
    L4: "Admin/Finance Director - Full access including Finance reports and transaction approval",
    L5: "Super Admin - Unrestricted access to all system features and reports",
  };
  return descriptions[level] || "";
};
