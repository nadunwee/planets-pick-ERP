// User authentication and access control utilities

export type UserLevel = "L1" | "L2" | "L3" | "L4";

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

  // Level 3 and 4 can download everything
  if (userLevel === "L3" || userLevel === "L4") {
    return true;
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
const isReportRelevantToDepartment = (
  department: string,
  reportCategory: string
): boolean => {
  const departmentCategoryMap: Record<string, string[]> = {
    Sales: ["sales"],
    Finance: ["finance"],
    Inventory: ["inventory"],
    Production: ["production"],
    "Human Resources": ["hr"],
    HR: ["hr"],
    Administration: ["system"],
    Wastage: ["wastage"],
  };

  const relevantCategories = departmentCategoryMap[department] || [];
  return relevantCategories.includes(reportCategory.toLowerCase());
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
  };
  return levelNames[level] || level;
};

/**
 * Get user permissions description
 */
export const getUserPermissionsDescription = (level: UserLevel): string => {
  const descriptions: Record<UserLevel, string> = {
    L1: "Can submit requests, cannot download reports",
    L2: "Can approve/decline requests, download department reports",
    L3: "Can download all reports, create transactions",
    L4: "Full access - can create users, approve/decline anything",
  };
  return descriptions[level] || "";
};
