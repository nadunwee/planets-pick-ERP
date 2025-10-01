import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Plus,
  Filter,
  Calendar,
  Clock,
  Mail,
  Phone,
  Edit,
  Eye,
  Bot,
  UserCheck,
  UserX,
  CheckCircle,
  DollarSign,
  X,
  Trash2,
  Download,
  FileText,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ScrollToTop from "@/components/ScrollToTop";

// For employees already in system
interface Employee {
  _id?: string; // ✅ add this
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  status: "active" | "on-leave" | "inactive";
  joinDate: string;
  salary: number;
  performance: number;
  attendance: number;
  hasUserAccount?: boolean;
  userId?: string;
  skills: string[];
  avatar?: string;
  shift: "morning" | "evening" | "night";
  emergencyContact: string;
  address: string;
  employeeId: string;
  supervisor?: string;
  contractType: "full-time" | "part-time" | "contract" | "temporary";
  workLocation: string;
  workingHours: number;
  createUser: boolean;
  benefits: string[];
  certifications: string[];
  lastReviewDate?: string;
  nextReviewDate?: string;
  leaveBalance: {
    annual: number;
    sick: number;
    personal: number;
  };
  payrollInfo: {
    bankName: string;
    accountNumber: string;
    taxId: string;
  };
}

// For the Add Employee form (includes createUser checkbox)
type NewEmployee = {
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: string;
  shift: "morning" | "evening" | "night";
  emergencyContact: string;
  address: string;
  contractType: "full-time" | "part-time" | "contract" | "temporary";
  workLocation: string;
  workingHours: string;
  overtimeEligible: boolean;
  skills: string;
  benefits: string;
  certifications: string;
  createUser: boolean; // 👈 only in form
};
interface Attendance {
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  hoursWorked: number;
  overtime: number;
  status: "present" | "absent" | "late" | "half-day";
  location: string;
  device: string;
  notes?: string;
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "annual" | "sick" | "personal" | "maternity" | "paternity";
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  submittedDate: string;
  approvedBy?: string;
  approvedDate?: string;
}

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  overtime: number;
  deductions: number;
  netSalary: number;
  status: "pending" | "processed" | "paid";
  paymentDate?: string;
}
const initialEmployees: Employee[] = [
  {
    id: "1",
    name: "Priya Silva",
    email: "priya.silva@planetspick.lk",
    phone: "+94 77 123 4567",
    position: "Production Supervisor",
    department: "Production",
    status: "active",
    joinDate: "2022-03-15",
    salary: 85000,
    performance: 92,
    attendance: 98,
    skills: ["Quality Control", "Team Management", "Process Optimization"],
    shift: "morning",
    emergencyContact: "+94 77 987 6543",
    address: "123 Main Street, Colombo 03",
    employeeId: "EMP001",
    supervisor: "Amara Jayawardene",
    contractType: "full-time",
    workLocation: "Main Factory",
    workingHours: 40,
    createUser: true,
    benefits: ["Health Insurance", "Provident Fund", "Annual Bonus"],
    certifications: ["Food Safety Level 3", "HACCP Certification"],
    lastReviewDate: "2023-12-01",
    nextReviewDate: "2024-06-01",
    leaveBalance: {
      annual: 15,
      sick: 7,
      personal: 3,
    },
    payrollInfo: {
      bankName: "Commercial Bank",
      accountNumber: "1234567890",
      taxId: "TAX123456789",
    },
  },
  {
    id: "2",
    name: "Kasun Perera",
    email: "kasun.perera@planetsick.lk",
    phone: "+94 71 234 5678",
    position: "Quality Control Specialist",
    department: "Quality Assurance",
    status: "active",
    joinDate: "2021-08-20",
    salary: 75000,
    performance: 88,
    attendance: 95,
    skills: ["Laboratory Testing", "HACCP", "Documentation"],
    shift: "morning",
    emergencyContact: "+94 71 876 5432",
    address: "456 Garden Road, Kandy",
    employeeId: "EMP002",
    supervisor: "Priya Silva",
    contractType: "full-time",
    workLocation: "Quality Lab",
    workingHours: 40,
    createUser: false,
    benefits: ["Health Insurance", "Provident Fund"],
    certifications: ["Laboratory Safety", "ISO 22000"],
    lastReviewDate: "2023-11-15",
    nextReviewDate: "2024-05-15",
    leaveBalance: {
      annual: 12,
      sick: 5,
      personal: 2,
    },
    payrollInfo: {
      bankName: "Bank of Ceylon",
      accountNumber: "0987654321",
      taxId: "TAX987654321",
    },
  },
  {
    id: "3",
    name: "Nimal Fernando",
    email: "nimal.fernando@planetsick.lk",
    phone: "+94 70 345 6789",
    position: "Machine Operator",
    department: "Production",
    status: "on-leave",
    joinDate: "2020-11-10",
    salary: 65000,
    performance: 85,
    attendance: 92,
    skills: ["Machine Operation", "Maintenance", "Safety Protocols"],
    shift: "evening",
    emergencyContact: "+94 70 765 4321",
    address: "789 Lake View, Galle",
    employeeId: "EMP003",
    supervisor: "Priya Silva",
    contractType: "full-time",
    workLocation: "Production Floor",
    workingHours: 40,
    createUser: false,
    benefits: ["Health Insurance", "Provident Fund"],
    certifications: ["Machine Safety", "First Aid"],
    lastReviewDate: "2023-10-20",
    nextReviewDate: "2024-04-20",
    leaveBalance: {
      annual: 8,
      sick: 3,
      personal: 1,
    },
    payrollInfo: {
      bankName: "People's Bank",
      accountNumber: "1122334455",
      taxId: "TAX112233445",
    },
  },
  {
    id: "4",
    name: "Amara Jayawardene",
    email: "amara.jayawardene@planetsick.lk",
    phone: "+94 76 456 7890",
    position: "HR Manager",
    department: "Human Resources",
    status: "active",
    joinDate: "2019-05-12",
    salary: 95000,
    performance: 94,
    attendance: 99,
    skills: ["Employee Relations", "Recruitment", "Policy Development"],
    shift: "morning",
    emergencyContact: "+94 76 654 3210",
    address: "321 Hill Street, Colombo 07",
    employeeId: "EMP004",
    contractType: "full-time",
    workLocation: "Admin Office",
    workingHours: 40,
    createUser: false,
    benefits: [
      "Health Insurance",
      "Provident Fund",
      "Annual Bonus",
      "Car Allowance",
    ],
    certifications: ["HR Management", "Labor Law"],
    lastReviewDate: "2023-12-15",
    nextReviewDate: "2024-06-15",
    leaveBalance: {
      annual: 20,
      sick: 10,
      personal: 5,
    },
    payrollInfo: {
      bankName: "Sampath Bank",
      accountNumber: "5566778899",
      taxId: "TAX556677889",
    },
  },
  {
    id: "5",
    name: "Tharaka Wickramasinghe",
    email: "tharaka.wickramasinghe@planetsick.lk",
    phone: "+94 78 567 8901",
    position: "Maintenance Technician",
    department: "Maintenance",
    status: "active",
    joinDate: "2023-01-08",
    salary: 70000,
    performance: 87,
    attendance: 96,
    skills: [
      "Electrical Systems",
      "Mechanical Repair",
      "Preventive Maintenance",
    ],
    shift: "night",
    emergencyContact: "+94 78 543 2109",
    address: "654 Park Avenue, Negombo",
    employeeId: "EMP005",
    supervisor: "Amara Jayawardene",
    contractType: "full-time",
    workLocation: "Maintenance Workshop",
    workingHours: 40,
    createUser: false,
    benefits: ["Health Insurance", "Provident Fund", "Night Shift Allowance"],
    certifications: ["Electrical Safety", "Mechanical Engineering"],
    lastReviewDate: "2023-11-30",
    nextReviewDate: "2024-05-30",
    leaveBalance: {
      annual: 10,
      sick: 4,
      personal: 2,
    },
    payrollInfo: {
      bankName: "Hatton National Bank",
      accountNumber: "9988776655",
      taxId: "TAX998877665",
    },
  },
];

const todayAttendance: Attendance[] = [
  {
    employeeId: "1",
    date: "2024-01-15",
    checkIn: "07:30",
    checkOut: "16:45",
    hoursWorked: 9.25,
    overtime: 1.25,
    status: "present",
    location: "Main Gate",
    device: "Card Reader",
  },
  {
    employeeId: "2",
    date: "2024-01-15",
    checkIn: "08:00",
    checkOut: "17:00",
    hoursWorked: 9,
    overtime: 1,
    status: "present",
    location: "Lab Entrance",
    device: "Fingerprint Scanner",
  },
  {
    employeeId: "3",
    date: "2024-01-15",
    checkIn: "",
    checkOut: "",
    hoursWorked: 0,
    overtime: 0,
    status: "absent",
    location: "",
    device: "",
  },
  {
    employeeId: "4",
    date: "2024-01-15",
    checkIn: "08:15",
    checkOut: "",
    hoursWorked: 0,
    overtime: 0,
    status: "present",
    location: "Admin Gate",
    device: "Card Reader",
  },
  {
    employeeId: "5",
    date: "2024-01-15",
    checkIn: "22:00",
    checkOut: "",
    hoursWorked: 0,
    overtime: 0,
    status: "present",
    location: "Workshop Gate",
    device: "Fingerprint Scanner",
  },
];

const leaveRequests: LeaveRequest[] = [
  {
    id: "1",
    employeeId: "3",
    employeeName: "Nimal Fernando",
    type: "sick",
    startDate: "2024-01-15",
    endDate: "2024-01-17",
    days: 3,
    reason: "Medical appointment and recovery",
    status: "approved",
    submittedDate: "2024-01-14",
    approvedBy: "Amara Jayawardene",
    approvedDate: "2024-01-14",
  },
  {
    id: "2",
    employeeId: "2",
    employeeName: "Kasun Perera",
    type: "annual",
    startDate: "2024-02-01",
    endDate: "2024-02-05",
    days: 5,
    reason: "Family vacation",
    status: "pending",
    submittedDate: "2024-01-10",
  },
];

const payrollRecords: PayrollRecord[] = [
  {
    id: "1",
    employeeId: "1",
    employeeName: "Priya Silva",
    month: "December",
    year: 2023,
    basicSalary: 85000,
    allowances: 5000,
    overtime: 8500,
    deductions: 12000,
    netSalary: 86500,
    status: "paid",
    paymentDate: "2023-12-31",
  },
  {
    id: "2",
    employeeId: "2",
    employeeName: "Kasun Perera",
    month: "December",
    year: 2023,
    basicSalary: 75000,
    allowances: 3000,
    overtime: 6000,
    deductions: 10500,
    netSalary: 73500,
    status: "paid",
    paymentDate: "2023-12-31",
  },
];

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(
    null
  );
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [reportStartDate, setReportStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [reportEndDate, setReportEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [newEmployee, setNewEmployee] = useState<NewEmployee>({
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "Production",
    salary: "",
    shift: "morning",
    emergencyContact: "",
    address: "",
    contractType: "full-time",
    workLocation: "",
    workingHours: "40",
    overtimeEligible: true,
    skills: "",
    benefits: "",
    certifications: "",
    createUser: false, // 👈 default unchecked
  });

  const departments = [
    "All",
    "Production",
    "Quality Assurance",
    "Human Resources",
    "Maintenance",
    "Procurement",
    "Inventory",
  ];

  // Reset pagination when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDepartment]);

  // Fetch employees from backend on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/employees");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch employees");
        setEmployees(data);
      } catch (error: any) {
        console.error(error);
        alert(error.message);
      }
    };
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "All" ||
      employee.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Pagination logic
  const paginatedEmployees = filteredEmployees.slice(
    0,
    currentPage * itemsPerPage
  );

  const handleSeeMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "on-leave":
        return "text-yellow-600 bg-yellow-100";
      case "inactive":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getAttendanceStatus = (employeeId: string) => {
    const attendance = todayAttendance.find((a) => a.employeeId === employeeId);
    return attendance?.status || "absent";
  };

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === "active").length;
  const onLeaveEmployees = employees.filter(
    (e) => e.status === "on-leave"
  ).length;
  const presentToday = todayAttendance.filter(
    (a) => a.status === "present"
  ).length;
  const pendingLeaveRequests = leaveRequests.filter(
    (r) => r.status === "pending"
  ).length;
  // Calculate total payroll from sum of all employee salaries
  const totalPayrollAmount = employees.reduce(
    (sum, employee) => sum + (employee.salary || 0),
    0
  );

  const handleAddEmployee = async () => {
    try {
      const employeeId = `EMP${String(employees.length + 1).padStart(3, "0")}`;

      // Prepare employee data for backend
      const employeeData = {
        name: newEmployee.name,
        email: newEmployee.email,
        phone: newEmployee.phone,
        position: newEmployee.position,
        department: newEmployee.department,
        salary: parseFloat(newEmployee.salary),
        shift: newEmployee.shift,
        emergencyContact: newEmployee.emergencyContact,
        address: newEmployee.address,
        contractType: newEmployee.contractType,
        workLocation: newEmployee.workLocation,
        workingHours: parseInt(newEmployee.workingHours),
        skills: newEmployee.skills,
        benefits: newEmployee.benefits,
        certifications: newEmployee.certifications,
        createUser: newEmployee.createUser, // This tells backend to create user
        overtimeEligible: newEmployee.overtimeEligible,
      };

      // Send POST request to backend
      const response = await fetch("http://localhost:4000/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add employee");
      }

      // Update local state with the employee returned from backend
      const newEmployeeForUI: Employee = {
        ...data.employee,
        id: data.employee._id,
        joinDate: new Date(data.employee.createdAt).toISOString().split("T")[0],
        employeeId,
        performance: 85,
        attendance: 95,
        leaveBalance: {
          annual: 20,
          sick: 10,
          personal: 5,
        },
        payrollInfo: {
          bankName: "Commercial Bank",
          accountNumber: "1234567890",
          taxId: "TAX123456789",
        },
      };

      setEmployees([...employees, newEmployeeForUI]);

      // Show appropriate message
      if (data.message) {
        alert(data.message);
      } else if (data.warning) {
        alert(data.warning);
      } else {
        alert("Employee added successfully!");
      }

      // Reset form and close modal
      setShowAddModal(false);
      setNewEmployee({
        name: "",
        email: "",
        phone: "",
        position: "",
        department: "Production",
        salary: "",
        shift: "morning",
        emergencyContact: "",
        address: "",
        contractType: "full-time",
        workLocation: "",
        workingHours: "40",
        overtimeEligible: true,
        createUser: false, // ✅ added this
        skills: "",
        benefits: "",
        certifications: "",
      });

      alert("Employee added successfully!");
    } catch (error: any) {
      alert(error.message);
    }
  };

  // --- State for checkbox ---
  const [createUserChecked, setCreateUserChecked] = useState(false);
  const [createUserDisabled, setCreateUserDisabled] = useState(false);

  // --- Open Edit Modal ---
  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);

    // Check if employee already has a user account
    const hasExistingUser = employee.userId && employee.hasUserAccount;

    if (hasExistingUser) {
      setCreateUserChecked(true);
      setCreateUserDisabled(true); // Cannot change if already a user
    } else {
      setCreateUserChecked(false);
      setCreateUserDisabled(false); // Can tick/untick for new user request
    }

    setShowEditModal(true);
  };

  // --- Update Employee Handler ---
  const handleUpdateEmployee = async () => {
    if (!editingEmployee) return;

    try {
      const employeeId = editingEmployee._id || editingEmployee.id;
      if (!employeeId) {
        alert("Employee ID is missing!");
        return;
      }

      // Prepare update data
      const updateData = {
        ...editingEmployee,
        createUser: createUserChecked && !editingEmployee.userId, // Only set if not already a user
      };

      // Send PUT request to backend
      const response = await fetch(
        `http://localhost:4000/api/employees/${employeeId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update employee");
      }

      const updatedEmployee = data.employee;

      // Update local state
      setEmployees((prev) =>
        prev.map((emp) =>
          (emp._id || emp.id) === (updatedEmployee._id || updatedEmployee.id)
            ? { ...emp, ...updatedEmployee, id: updatedEmployee._id }
            : emp
        )
      );

      // Show appropriate message
      if (data.message) {
        alert(data.message);
      } else if (data.warning) {
        alert(data.warning);
      } else {
        alert("Employee updated successfully!");
      }

      // Reset modal state
      setShowEditModal(false);
      setEditingEmployee(null);
      setCreateUserChecked(false);
      setCreateUserDisabled(false);
    } catch (error: any) {
      console.error("Error updating employee:", error.message);
      alert("Failed to update employee: " + error.message);
    }
  };

  // --- Open Delete Modal ---
  const handleDeleteEmployee = (employee: Employee) => {
    setDeletingEmployee(employee);
    setShowDeleteModal(true);
  };

  // --- Confirm Delete Employee ---
  const confirmDeleteEmployee = async () => {
    if (!deletingEmployee) return;

    try {
      const employeeId = deletingEmployee._id || deletingEmployee.id;
      if (!employeeId) {
        alert("Employee ID is missing!");
        return;
      }

      // Call backend DELETE API
      const res = await fetch(
        `http://localhost:4000/api/employees/${employeeId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete employee");
      }

      // Remove from local state
      setEmployees((prev) =>
        prev.filter((emp) => (emp._id || emp.id) !== employeeId)
      );

      alert(data.message || "Employee deleted successfully");

      // Close modal and reset state
      setShowDeleteModal(false);
      setDeletingEmployee(null);
    } catch (error: any) {
      console.error("Error deleting employee:", error);
      alert("Failed to delete employee: " + error.message);
    }
  };

  const handleAttendanceUpdate = (
    employeeId: string,
    status: "present" | "absent" | "late" | "half-day"
  ) => {
    const existingAttendance = todayAttendance.find(
      (a) => a.employeeId === employeeId && a.date === selectedDate
    );

    if (existingAttendance) {
      // Update existing attendance
      // In a real app, you'd update the state here
      console.log(`Updating attendance for ${employeeId} to ${status}`);
    } else {
      // Create new attendance record
      // In a real app, you'd add this to state
      console.log(
        `Creating new attendance for ${employeeId} with status ${status}`
      );
    }
  };

  // Export functions
  const exportToExcel = () => {
    const dataToExport = filteredEmployees.map((employee) => ({
      "Employee ID": employee.employeeId || employee.id,
      Name: employee.name,
      Email: employee.email,
      Phone: employee.phone,
      Position: employee.position,
      Department: employee.department,
      Status: employee.status,
      "Join Date": employee.joinDate,
      Salary: employee.salary,
      Performance: employee.performance,
      Attendance: employee.attendance,
      Skills: Array.isArray(employee.skills)
        ? employee.skills.join(", ")
        : employee.skills,
      "Has User Account": employee.hasUserAccount ? "Yes" : "No",
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");

    // Auto-fit column widths
    const wscols = [
      { wch: 12 }, // Employee ID
      { wch: 20 }, // Name
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 20 }, // Position
      { wch: 18 }, // Department
      { wch: 12 }, // Status
      { wch: 12 }, // Join Date
      { wch: 12 }, // Salary
      { wch: 12 }, // Performance
      { wch: 12 }, // Attendance
      { wch: 30 }, // Skills
      { wch: 15 }, // Has User Account
    ];
    ws["!cols"] = wscols;

    XLSX.writeFile(
      wb,
      `employees_list_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text("Employee List", 14, 22);

    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);

    // Prepare data for table
    const tableData = filteredEmployees.map((employee) => [
      employee.employeeId || employee.id,
      employee.name,
      employee.email,
      employee.phone,
      employee.position,
      employee.department,
      employee.status,
      employee.joinDate,
      `$${employee.salary}`,
      `${employee.performance}%`,
      `${employee.attendance}%`,
      employee.hasUserAccount ? "Yes" : "No",
    ]);

    // Create table
    autoTable(doc, {
      head: [
        [
          "ID",
          "Name",
          "Email",
          "Phone",
          "Position",
          "Department",
          "Status",
          "Join Date",
          "Salary",
          "Performance",
          "Attendance",
          "User Account",
        ],
      ],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: {
        0: { cellWidth: 15 }, // ID
        1: { cellWidth: 25 }, // Name
        2: { cellWidth: 30 }, // Email
        3: { cellWidth: 20 }, // Phone
        4: { cellWidth: 25 }, // Position
        5: { cellWidth: 20 }, // Department
        6: { cellWidth: 15 }, // Status
        7: { cellWidth: 18 }, // Join Date
        8: { cellWidth: 15 }, // Salary
        9: { cellWidth: 15 }, // Performance
        10: { cellWidth: 15 }, // Attendance
        11: { cellWidth: 15 }, // User Account
      },
    });

    doc.save(`employees_list_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const generateAttendanceReport = () => {
    // This would generate a comprehensive report
    const reportData = {
      startDate: reportStartDate,
      endDate: reportEndDate,
      totalEmployees: employees.length,
      attendanceSummary: employees.map((emp) => ({
        name: emp.name,
        department: emp.department,
        attendance: todayAttendance.filter((a) => a.employeeId === emp.id)
          .length,
        present: todayAttendance.filter(
          (a) => a.employeeId === emp.id && a.status === "present"
        ).length,
        absent: todayAttendance.filter(
          (a) => a.employeeId === emp.id && a.status === "absent"
        ).length,
        late: todayAttendance.filter(
          (a) => a.employeeId === emp.id && a.status === "late"
        ).length,
      })),
    };

    // In a real app, this would export to PDF/Excel
    console.log("Attendance Report:", reportData);
    alert(
      "Report generated! Check console for details. In production, this would export to PDF/Excel."
    );
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Employee Management
          </h1>
          <p className="text-gray-600">
            Manage workforce, attendance, and performance
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
          >
            <Plus size={16} />
            Add Employee
          </button>
          <button
            onClick={() => setShowAttendanceModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition"
          >
            <Clock size={16} />
            Manage Attendance
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
          >
            <Calendar size={16} />
            Reports
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
            <Bot size={16} />
            AI Insights
          </button>
          <button
            onClick={exportToExcel}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition"
          >
            <Download size={16} />
            Export Excel
          </button>
          <button
            onClick={exportToPDF}
            className="bg-rose-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-rose-700 transition"
          >
            <FileText size={16} />
            Export PDF
          </button>
        </div>
      </div>
      {/* AI HR Assistant */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 text-white p-2 rounded-lg">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">AI HR Insights</h3>
            <p className="text-blue-700 text-sm">
              Priya Silva shows 15% productivity increase this month. Consider
              for leadership training. Optimal shift scheduling suggests moving
              2 employees to evening shift for better coverage.
            </p>
          </div>
          <button className="ml-auto bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition">
            View Recommendations
          </button>
        </div>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-blue-600">
                {totalEmployees}
              </p>
            </div>
            <Users className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {activeEmployees}
              </p>
            </div>
            <UserCheck className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">On Leave</p>
              <p className="text-2xl font-bold text-yellow-600">
                {onLeaveEmployees}
              </p>
            </div>
            <UserX className="text-yellow-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Present Today</p>
              <p className="text-2xl font-bold text-purple-600">
                {presentToday}
              </p>
            </div>
            <CheckCircle className="text-purple-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Leave</p>
              <p className="text-2xl font-bold text-orange-600">
                {pendingLeaveRequests}
              </p>
            </div>
            <Clock className="text-orange-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Payroll</p>
              <p className="text-2xl font-bold text-indigo-600">
                Rs. {totalPayrollAmount.toLocaleString()}
              </p>
            </div>
            <DollarSign className="text-indigo-500" size={24} />
          </div>
        </div>
      </div>
      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" size={16} />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 rounded text-sm transition ${
                viewMode === "grid" ? "bg-white shadow" : "text-gray-600"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1 rounded text-sm transition ${
                viewMode === "table" ? "bg-white shadow" : "text-gray-600"
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>
      {/* Employees List */}
      {viewMode === "grid" ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedEmployees.map((employee) => (
              <div
                key={employee.id}
                className="bg-white rounded-lg shadow border p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {employee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">
                          {employee.name}
                        </h3>
                        {employee.hasUserAccount && employee.userId && (
                          <div
                            className="flex items-center"
                            title="Has user account"
                          >
                            <UserCheck size={16} className="text-green-500" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {employee.position}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                      employee.status
                    )}`}
                  >
                    {employee.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={14} />
                    {employee.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={14} />
                    {employee.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} />
                    Joined: {employee.joinDate}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4"></div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {employee.skills.slice(0, 2).map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {employee.skills.length > 2 && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        +{employee.skills.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Clock size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-600 capitalize">
                      {employee.shift} shift
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEditEmployee(employee)}
                      className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(employee)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Today's Attendance Status */}
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Today's Status:
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        getAttendanceStatus(employee.id) === "present"
                          ? "bg-green-100 text-green-600"
                          : getAttendanceStatus(employee.id) === "late"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {getAttendanceStatus(employee.id)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* See More Button */}
          {currentPage * itemsPerPage < filteredEmployees.length && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleSeeMore}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                See More (
                {Math.min(
                  itemsPerPage,
                  filteredEmployees.length - currentPage * itemsPerPage
                )}{" "}
                more)
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium">Employee</th>
                  <th className="text-left p-4 font-medium">Department</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Performance</th>
                  <th className="text-left p-4 font-medium">Attendance</th>
                  <th className="text-left p-4 font-medium">Today</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEmployees.map((employee) => (
                  <tr key={employee.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {employee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{employee.name}</p>
                            {employee.hasUserAccount && employee.userId && (
                              <div title="Has user account">
                                <UserCheck
                                  size={14}
                                  className="text-green-500"
                                />
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {employee.position}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{employee.department}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                          employee.status
                        )}`}
                      >
                        {employee.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${employee.performance}%` }}
                          />
                        </div>
                        <span className="text-sm">{employee.performance}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${employee.attendance}%` }}
                          />
                        </div>
                        <span className="text-sm">{employee.attendance}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          getAttendanceStatus(employee.id) === "present"
                            ? "bg-green-100 text-green-600"
                            : getAttendanceStatus(employee.id) === "late"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {getAttendanceStatus(employee.id)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditEmployee(employee)}
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* See More Button for Table View */}
          {currentPage * itemsPerPage < filteredEmployees.length && (
            <div className="flex justify-center p-4 border-t">
              <button
                onClick={handleSeeMore}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                See More (
                {Math.min(
                  itemsPerPage,
                  filteredEmployees.length - currentPage * itemsPerPage
                )}{" "}
                more)
              </button>
            </div>
          )}
        </div>
      )}
      {filteredEmployees.length === 0 && (
        <div className="bg-white rounded-lg shadow border p-8 text-center">
          <Users className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No employees found
          </h3>
          <p className="text-gray-600">
            No employees match your current search criteria.
          </p>
        </div>
      )}
      {/* Leave Requests and Payroll Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow border p-4">
          <h3 className="font-semibold text-lg mb-4">Leave Requests</h3>
          <div className="space-y-3">
            {leaveRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{request.employeeName}</p>
                  <p className="text-sm text-gray-600">
                    {request.type} - {request.days} days
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    request.status === "approved"
                      ? "bg-green-100 text-green-600"
                      : request.status === "pending"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-4">
          <h3 className="font-semibold text-lg mb-4">Payroll Summary</h3>
          <div className="space-y-3">
            {payrollRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{record.employeeName}</p>
                  <p className="text-sm text-gray-600">
                    {record.month} {record.year}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    Rs. {record.netSalary.toLocaleString()}
                  </p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      record.status === "paid"
                        ? "bg-green-100 text-green-600"
                        : record.status === "processed"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {record.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add New Employee</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">
                  Basic Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newEmployee.name}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={newEmployee.phone}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position *
                  </label>
                  <input
                    type="text"
                    value={newEmployee.position}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        position: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter job position"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={newEmployee.department}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        department: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Production">Production</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Inventory">Inventory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary (Rs.) *
                  </label>
                  <input
                    type="number"
                    value={newEmployee.salary}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, salary: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter salary amount"
                  />
                </div>
              </div>

              {/* Employment Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">
                  Employment Details
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shift *
                  </label>
                  <select
                    value={newEmployee.shift}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        shift: e.target.value as
                          | "morning"
                          | "evening"
                          | "night",
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="morning">Morning</option>
                    <option value="evening">Evening</option>
                    <option value="night">Night</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contract Type *
                  </label>
                  <select
                    value={newEmployee.contractType}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        contractType: e.target.value as
                          | "full-time"
                          | "part-time"
                          | "contract"
                          | "temporary",
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="temporary">Temporary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Location
                  </label>
                  <input
                    type="text"
                    value={newEmployee.workLocation}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        workLocation: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter work location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Working Hours
                  </label>
                  <input
                    type="number"
                    value={newEmployee.workingHours}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        workingHours: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Hours per week"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newEmployee.createUser} // tied to newEmployee.createUser
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        createUser: e.target.checked, // update state on toggle
                      })
                    }
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Create User
                  </label>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold text-gray-700 border-b pb-2">
                Additional Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="tel"
                    value={newEmployee.emergencyContact}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        emergencyContact: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Emergency contact number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={newEmployee.address}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        address: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={newEmployee.skills}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, skills: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Quality Control, Team Management, Process Optimization"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Benefits (comma separated)
                </label>
                <input
                  type="text"
                  value={newEmployee.benefits}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, benefits: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Health Insurance, Provident Fund, Annual Bonus"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certifications (comma separated)
                </label>
                <input
                  type="text"
                  value={newEmployee.certifications}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      certifications: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Food Safety Level 3, HACCP Certification"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEmployee}
                disabled={
                  !newEmployee.name ||
                  !newEmployee.email ||
                  !newEmployee.phone ||
                  !newEmployee.position ||
                  !newEmployee.salary
                }
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add Employee
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Employee Modal */}
      {showEditModal && editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                Edit Employee: {editingEmployee.name}
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEmployee(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">
                  Basic Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editingEmployee.name}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={editingEmployee.email}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={editingEmployee.phone}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position *
                  </label>
                  <input
                    type="text"
                    value={editingEmployee.position}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        position: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter job position"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={editingEmployee.department}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        department: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Production">Production</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Inventory">Inventory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary (Rs.) *
                  </label>
                  <input
                    type="number"
                    value={editingEmployee.salary}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        salary: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter salary amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editingEmployee.status}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        status: e.target.value as
                          | "active"
                          | "on-leave"
                          | "inactive",
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="active">Active</option>
                    <option value="on-leave">On Leave</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Employment Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">
                  Employment Details
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shift *
                  </label>
                  <select
                    value={editingEmployee.shift}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        shift: e.target.value as
                          | "morning"
                          | "evening"
                          | "night",
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="morning">Morning</option>
                    <option value="evening">Evening</option>
                    <option value="night">Night</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contract Type *
                  </label>
                  <select
                    value={editingEmployee.contractType}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        contractType: e.target.value as
                          | "full-time"
                          | "part-time"
                          | "contract"
                          | "temporary",
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="temporary">Temporary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Location
                  </label>
                  <input
                    type="text"
                    value={editingEmployee.workLocation}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        workLocation: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter work location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Working Hours
                  </label>
                  <input
                    type="number"
                    value={editingEmployee.workingHours}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        workingHours: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Hours per week"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Performance (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingEmployee.performance}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        performance: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attendance (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingEmployee.attendance}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        attendance: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold text-gray-700 border-b pb-2">
                Additional Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="tel"
                    value={editingEmployee.emergencyContact}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        emergencyContact: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Emergency contact number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={editingEmployee.address}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        address: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={editingEmployee.skills.join(", ")}
                  onChange={(e) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      skills: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Quality Control, Team Management, Process Optimization"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Benefits (comma separated)
                </label>
                <input
                  type="text"
                  value={editingEmployee.benefits.join(", ")}
                  onChange={(e) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      benefits: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Health Insurance, Provident Fund, Annual Bonus"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certifications (comma separated)
                </label>
                <input
                  type="text"
                  value={editingEmployee.certifications.join(", ")}
                  onChange={(e) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      certifications: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Food Safety Level 3, HACCP Certification"
                />
              </div>

              {/* User Account Creation */}
              <div className="col-span-full">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="createUserEdit"
                    checked={createUserChecked}
                    disabled={createUserDisabled}
                    onChange={(e) => setCreateUserChecked(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="createUserEdit"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Create User Account{" "}
                    {createUserDisabled &&
                      "(Already has an account or account creation request has been sent)"}
                  </label>
                </div>
                {createUserChecked && !createUserDisabled && (
                  <p className="mt-1 text-xs text-gray-500">
                    A user account request will be sent to the admin for
                    approval
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEmployee(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateEmployee}
                disabled={
                  !editingEmployee.name ||
                  !editingEmployee.email ||
                  !editingEmployee.phone ||
                  !editingEmployee.position ||
                  !editingEmployee.salary
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Update Employee
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Attendance Management Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Daily Attendance Management</h2>
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Date Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-lg shadow border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium">Employee</th>
                      <th className="text-left p-4 font-medium">Department</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Check In</th>
                      <th className="text-left p-4 font-medium">Check Out</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => {
                      const attendance = todayAttendance.find(
                        (a) =>
                          a.employeeId === employee.id &&
                          a.date === selectedDate
                      );
                      return (
                        <tr
                          key={employee.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {employee.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                              <div>
                                <p className="font-medium">{employee.name}</p>
                                <p className="text-sm text-gray-600">
                                  {employee.position}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-sm">{employee.department}</td>
                          <td className="p-4">
                            <select
                              value={attendance?.status || "absent"}
                              onChange={(e) =>
                                handleAttendanceUpdate(
                                  employee.id,
                                  e.target.value as
                                    | "present"
                                    | "absent"
                                    | "late"
                                    | "half-day"
                                )
                              }
                              className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                            >
                              <option value="present">Present</option>
                              <option value="absent">Absent</option>
                              <option value="late">Late</option>
                              <option value="half-day">Half Day</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <input
                              type="time"
                              value={attendance?.checkIn || ""}
                              onChange={(e) => {
                                // In a real app, this would update check-in time
                                console.log(
                                  `Check-in time updated for ${employee.id}: ${e.target.value}`
                                );
                              }}
                              className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                              placeholder="HH:MM"
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="time"
                              value={attendance?.checkOut || ""}
                              onChange={(e) => {
                                // In a real app, this would update check-out time
                                console.log(
                                  `Check-out time updated for ${employee.id}: ${e.target.value}`
                                );
                              }}
                              className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                              placeholder="HH:MM"
                            />
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() =>
                                handleAttendanceUpdate(employee.id, "present")
                              }
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
                            >
                              Mark Present
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(
                    "Attendance saved! In production, this would update the database."
                  );
                  setShowAttendanceModal(false);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Save Attendance
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Reports Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Generate Reports</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Employee List Export */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">
                  Employee List Export
                </h3>
                <p className="text-gray-600 mb-4">
                  Export complete employee data to Excel format
                </p>
                <button
                  onClick={exportToExcel}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Export to Excel
                </button>
              </div>

              {/* Attendance Report */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">
                  Attendance Report
                </h3>
                <p className="text-gray-600 mb-4">
                  Generate detailed attendance report for specific time period
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={reportStartDate}
                      onChange={(e) => setReportStartDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={reportEndDate}
                      onChange={(e) => setReportEndDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={generateAttendanceReport}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Generate Report
                  </button>
                  <button
                    onClick={() => {
                      alert(
                        "PDF export ready! In production, this would download a PDF file."
                      );
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Export to PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end mt-6 pt-4 border-t">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && deletingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Delete Employee
                </h2>
                <p className="text-gray-600">This action cannot be undone.</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deletingEmployee.name}</span>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Position: {deletingEmployee.position}
                <br />
                Department: {deletingEmployee.department}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingEmployee(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteEmployee}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete Employee
              </button>
            </div>
          </div>
        </div>
      )}{" "}
    <ScrollToTop />
    </div>
  );
}
