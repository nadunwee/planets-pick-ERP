import { useState } from "react";
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
  UserCheck,
  UserX,
  CheckCircle,
  DollarSign,
  X,
  Trash2,
} from "lucide-react";

interface Employee {
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
  overtimeEligible: boolean;
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

interface Attendance {
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  hoursWorked: number;
  overtime: number;
  status: "present" | "absent" | "late" | "half-day" | "not-set";
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
    overtimeEligible: true,
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
    overtimeEligible: true,
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
    overtimeEligible: true,
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
    overtimeEligible: false,
    benefits: ["Health Insurance", "Provident Fund", "Annual Bonus", "Car Allowance"],
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
    skills: ["Electrical Systems", "Mechanical Repair", "Preventive Maintenance"],
    shift: "night",
    emergencyContact: "+94 78 543 2109",
    address: "654 Park Avenue, Negombo",
    employeeId: "EMP005",
    supervisor: "Amara Jayawardene",
    contractType: "full-time",
    workLocation: "Maintenance Workshop",
    workingHours: 40,
    overtimeEligible: true,
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
  const [attendanceData, setAttendanceData] = useState<Attendance[]>(todayAttendance);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportStartDate, setReportStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0]);
  const todayDateString = new Date().toISOString().split('T')[0];
  const isReadOnlyDate = selectedDate !== todayDateString;
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "Production",
    salary: "",
    shift: "morning" as "morning" | "evening" | "night",
    emergencyContact: "",
    address: "",
    contractType: "full-time" as "full-time" | "part-time" | "contract" | "temporary",
    workLocation: "",
    workingHours: "40",
    overtimeEligible: true,
    skills: "",
    benefits: "",
    certifications: "",
  });

  const departments = ["All", "Production", "Quality Assurance", "Human Resources", "Maintenance"];

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === "All" || employee.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

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
    const attendance = attendanceData.find(a => a.employeeId === employeeId);
    return attendance?.status || "absent";
  };

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === "active").length;
  const onLeaveEmployees = employees.filter(e => e.status === "on-leave").length;
  const presentToday = attendanceData.filter(a => a.status === "present").length;
  const pendingLeaveRequests = leaveRequests.filter(r => r.status === "pending").length;
  const totalPayrollAmount = payrollRecords.reduce((sum, record) => sum + record.netSalary, 0);

  const handleAddEmployee = () => {
    const employeeId = `EMP${String(employees.length + 1).padStart(3, '0')}`;
    const newEmployeeData: Employee = {
      id: String(employees.length + 1),
      name: newEmployee.name,
      email: newEmployee.email,
      phone: newEmployee.phone,
      position: newEmployee.position,
      department: newEmployee.department,
      status: "active",
      joinDate: new Date().toISOString().split('T')[0],
      salary: parseFloat(newEmployee.salary),
      performance: 85,
      attendance: 95,
      skills: newEmployee.skills.split(',').map(s => s.trim()).filter(s => s),
      shift: newEmployee.shift,
      emergencyContact: newEmployee.emergencyContact,
      address: newEmployee.address,
      employeeId,
      contractType: newEmployee.contractType,
      workLocation: newEmployee.workLocation,
      workingHours: parseInt(newEmployee.workingHours),
      overtimeEligible: newEmployee.overtimeEligible,
      benefits: newEmployee.benefits.split(',').map(s => s.trim()).filter(s => s),
      certifications: newEmployee.certifications.split(',').map(s => s.trim()).filter(s => s),
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

    setEmployees([...employees, newEmployeeData]);
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
      skills: "",
      benefits: "",
      certifications: "",
    });
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowEditModal(true);
  };

  const handleUpdateEmployee = () => {
    if (!editingEmployee) return;

    const updatedEmployees = employees.map(emp => 
      emp.id === editingEmployee.id ? editingEmployee : emp
    );
    setEmployees(updatedEmployees);
    setShowEditModal(false);
    setEditingEmployee(null);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setDeletingEmployee(employee);
    setShowDeleteModal(true);
  };

  const confirmDeleteEmployee = () => {
    if (!deletingEmployee) return;

    const updatedEmployees = employees.filter(emp => emp.id !== deletingEmployee.id);
    setEmployees(updatedEmployees);
    setShowDeleteModal(false);
    setDeletingEmployee(null);
  };

  const handleAttendanceUpdate = (employeeId: string, status: "present" | "absent" | "late" | "half-day" | "not-set") => {
    setAttendanceData(prev => {
      const index = prev.findIndex(a => a.employeeId === employeeId && a.date === selectedDate);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = { ...updated[index], status };
        return updated;
      }
      return [
        ...prev,
        {
          employeeId,
          date: selectedDate,
          checkIn: "",
          checkOut: "",
          hoursWorked: 0,
          overtime: 0,
          status,
          location: "",
          device: "",
        },
      ];
    });
  };

  const generateAttendanceReport = () => {
    // This would generate a comprehensive report
    const reportData = {
      startDate: reportStartDate,
      endDate: reportEndDate,
      totalEmployees: employees.length,
      attendanceSummary: employees.map(emp => ({
        name: emp.name,
        department: emp.department,
        attendance: attendanceData.filter(a => a.employeeId === emp.id).length,
        present: attendanceData.filter(a => a.employeeId === emp.id && a.status === "present").length,
        absent: attendanceData.filter(a => a.employeeId === emp.id && a.status === "absent").length,
        late: attendanceData.filter(a => a.employeeId === emp.id && a.status === "late").length
      }))
    };
    
    // In a real app, this would export to PDF/Excel
    console.log("Attendance Report:", reportData);
    alert("Report generated! Check console for details. In production, this would export to PDF/Excel.");
  };

  const exportToExcel = () => {
    // This would export employee data to Excel
    const excelData = employees.map(emp => ({
      "Employee ID": emp.employeeId,
      "Name": emp.name,
      "Email": emp.email,
      "Phone": emp.phone,
      "Position": emp.position,
      "Department": emp.department,
      "Status": emp.status,
      "Join Date": emp.joinDate,
      "Salary": emp.salary,
      "Performance": emp.performance,
      "Attendance": emp.attendance
    }));
    
    console.log("Excel Export Data:", excelData);
    alert("Excel export ready! Check console for details. In production, this would download an Excel file.");
  };

  const handleTimeChange = (
    employeeId: string,
    field: "checkIn" | "checkOut",
    value: string
  ) => {
    setAttendanceData(prev => {
      const index = prev.findIndex(a => a.employeeId === employeeId && a.date === selectedDate);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value } as Attendance;
        return updated;
      }
      return [
        ...prev,
        {
          employeeId,
          date: selectedDate,
          checkIn: field === "checkIn" ? value : "",
          checkOut: field === "checkOut" ? value : "",
          hoursWorked: 0,
          overtime: 0,
          status: "present",
          location: "",
          device: "",
        },
      ];
    });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600">Manage workforce, attendance, and performance</p>
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
          </div>
      </div>

      {/* AI HR Insights section commented out */}
      {/**
       * <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
       *   <div className="flex items-center gap-3">
       *     <div className="bg-blue-500 text-white p-2 rounded-lg">
       *       <Bot size={20} />
       *     </div>
       *     <div>
       *       <h3 className="font-semibold text-blue-900">AI HR Insights</h3>
       *       <p className="text-blue-700 text-sm">
       *         Priya Silva shows 15% productivity increase this month. Consider for leadership training.
       *         Optimal shift scheduling suggests moving 2 employees to evening shift for better coverage.
       *       </p>
       *     </div>
       *     <button className="ml-auto bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition">
       *       View Recommendations
       *     </button>
       *   </div>
       * </div>
       */}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-blue-600">{totalEmployees}</p>
            </div>
            <Users className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{activeEmployees}</p>
            </div>
            <UserCheck className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">On Leave</p>
              <p className="text-2xl font-bold text-yellow-600">{onLeaveEmployees}</p>
            </div>
            <UserX className="text-yellow-500" size={24} />
          </div>
        </div>
                 <div className="bg-white p-4 rounded-lg shadow border">
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm text-gray-600">Present Today</p>
               <p className="text-2xl font-bold text-purple-600">{presentToday}</p>
             </div>
             <CheckCircle className="text-purple-500" size={24} />
           </div>
         </div>
         <div className="bg-white p-4 rounded-lg shadow border">
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm text-gray-600">Pending Leave</p>
               <p className="text-2xl font-bold text-orange-600">{pendingLeaveRequests}</p>
             </div>
             <Clock className="text-orange-500" size={24} />
           </div>
         </div>
         <div className="bg-white p-4 rounded-lg shadow border">
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm text-gray-600">Total Payroll</p>
               <p className="text-2xl font-bold text-indigo-600">Rs. {totalPayrollAmount.toLocaleString()}</p>
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => (
            <div key={employee.id} className="bg-white rounded-lg shadow border p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {employee.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{employee.name}</h3>
                    <p className="text-sm text-gray-600">{employee.position}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(employee.status)}`}>
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

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Performance</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${employee.performance}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{employee.performance}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Attendance</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${employee.attendance}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{employee.attendance}%</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Skills</p>
                <div className="flex flex-wrap gap-1">
                  {employee.skills.slice(0, 2).map((skill, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
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
                   <span className="text-xs text-gray-600 capitalize">{employee.shift} shift</span>
                 </div>
                 <div className="flex gap-1">
                   <button 
                     onClick={() => { setViewEmployee(employee); setShowViewModal(true); }}
                     className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                   >
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
                  <span className="text-xs text-gray-500">Today's Status:</span>
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
                {filteredEmployees.map((employee) => {
                  const attendance = attendanceData.find(a => a.employeeId === employee.id && a.date === selectedDate);
                  return (
                    <tr key={employee.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {employee.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <p className="font-medium">{employee.name}</p>
                            <p className="text-sm text-gray-600">{employee.position}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">{employee.department}</td>
                      <td className="p-4">
                        <select
                          value={attendance?.status || "absent"}
                          onChange={(e) => handleAttendanceUpdate(
                            employee.id, 
                            e.target.value as "present" | "absent" | "late" | "half-day"
                          )}
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
                          onChange={(e) => handleTimeChange(employee.id, "checkIn", e.target.value)}
                          className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                          placeholder="HH:MM"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="time"
                          value={attendance?.checkOut || ""}
                          onChange={(e) => handleTimeChange(employee.id, "checkOut", e.target.value)}
                          className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                          placeholder="HH:MM"
                        />
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleAttendanceUpdate(employee.id, "present")}
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
      )}

             {filteredEmployees.length === 0 && (
         <div className="bg-white rounded-lg shadow border p-8 text-center">
           <Users className="mx-auto text-gray-400 mb-4" size={48} />
           <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
           <p className="text-gray-600">No employees match your current search criteria.</p>
         </div>
       )}

       {/* Leave Requests and Payroll Summary */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white rounded-lg shadow border p-4">
           <h3 className="font-semibold text-lg mb-4">Leave Requests</h3>
           <div className="space-y-3">
             {leaveRequests.map((request) => (
               <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                 <div>
                   <p className="font-medium">{request.employeeName}</p>
                   <p className="text-sm text-gray-600">{request.type} - {request.days} days</p>
                 </div>
                 <span className={`px-2 py-1 rounded-full text-xs ${
                   request.status === "approved" ? "bg-green-100 text-green-600" :
                   request.status === "pending" ? "bg-yellow-100 text-yellow-600" :
                   "bg-red-100 text-red-600"
                 }`}>
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
               <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                 <div>
                   <p className="font-medium">{record.employeeName}</p>
                   <p className="text-sm text-gray-600">{record.month} {record.year}</p>
                 </div>
                 <div className="text-right">
                   <p className="font-medium">Rs. {record.netSalary.toLocaleString()}</p>
                   <span className={`px-2 py-1 rounded-full text-xs ${
                     record.status === "paid" ? "bg-green-100 text-green-600" :
                     record.status === "processed" ? "bg-blue-100 text-blue-600" :
                     "bg-yellow-100 text-yellow-600"
                   }`}>
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
                 <h3 className="font-semibold text-gray-700 border-b pb-2">Basic Information</h3>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                   <input
                     type="text"
                     value={newEmployee.name}
                     onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                     className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                     placeholder="Enter full name"
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                   <input
                     type="email"
                     value={newEmployee.email}
                     onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                     className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                     placeholder="Enter email address"
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                   <input
                     type="tel"
                     value={newEmployee.phone}
                     onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                     className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                     placeholder="Enter phone number"
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                   <input
                     type="text"
                     value={newEmployee.position}
                     onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                     className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                     placeholder="Enter job position"
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                   <select
                     value={newEmployee.department}
                     onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                     className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                   >
                     <option value="Production">Production</option>
                     <option value="Quality Assurance">Quality Assurance</option>
                     <option value="Human Resources">Human Resources</option>
                     <option value="Maintenance">Maintenance</option>
                   </select>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Salary (Rs.) *</label>
                   <input
                     type="number"
                     value={newEmployee.salary}
                     onChange={(e) => setNewEmployee({...newEmployee, salary: e.target.value})}
                     className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                     placeholder="Enter salary amount"
                   />
                 </div>
               </div>

               {/* Employment Details */}
               <div className="space-y-4">
                 <h3 className="font-semibold text-gray-700 border-b pb-2">Employment Details</h3>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Shift *</label>
                   <select
                     value={newEmployee.shift}
                     onChange={(e) => setNewEmployee({...newEmployee, shift: e.target.value as "morning" | "evening" | "night"})}
                     className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                   >
                     <option value="morning">Morning</option>
                     <option value="evening">Evening</option>
                     <option value="night">Night</option>
                   </select>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type *</label>
                   <select
                     value={newEmployee.contractType}
                     onChange={(e) => setNewEmployee({...newEmployee, contractType: e.target.value as "full-time" | "part-time" | "contract" | "temporary"})}
                     className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                   >
                     <option value="full-time">Full Time</option>
                     <option value="part-time">Part Time</option>
                     <option value="contract">Contract</option>
                     <option value="temporary">Temporary</option>
                   </select>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Work Location</label>
                   <input
                     type="text"
                     value={newEmployee.workLocation}
                     onChange={(e) => setNewEmployee({...newEmployee, workLocation: e.target.value})}
                     className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                     placeholder="Enter work location"
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Working Hours</label>
                   <input
                     type="number"
                     value={newEmployee.workingHours}
                     onChange={(e) => setNewEmployee({...newEmployee, workingHours: e.target.value})}
                     className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                     placeholder="Hours per week"
                   />
                 </div>

                 <div className="flex items-center">
                   <input
                     type="checkbox"
                     checked={newEmployee.overtimeEligible}
                     onChange={(e) => setNewEmployee({...newEmployee, overtimeEligible: e.target.checked})}
                     className="mr-2"
                   />
                   <label className="text-sm font-medium text-gray-700">Overtime Eligible</label>
                 </div>
               </div>
             </div>

             {/* Additional Information */}
             <div className="mt-6 space-y-4">
               <h3 className="font-semibold text-gray-700 border-b pb-2">Additional Information</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                   <input
                     type="tel"
                     value={newEmployee.emergencyContact}
                     onChange={(e) => setNewEmployee({...newEmployee, emergencyContact: e.target.value})}
                     className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                     placeholder="Emergency contact number"
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                   <input
                     type="text"
                     value={newEmployee.address}
                     onChange={(e) => setNewEmployee({...newEmployee, address: e.target.value})}
                     className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                     placeholder="Enter address"
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                 <input
                   type="text"
                   value={newEmployee.skills}
                   onChange={(e) => setNewEmployee({...newEmployee, skills: e.target.value})}
                   className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                   placeholder="e.g., Quality Control, Team Management, Process Optimization"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Benefits (comma separated)</label>
                 <input
                   type="text"
                   value={newEmployee.benefits}
                   onChange={(e) => setNewEmployee({...newEmployee, benefits: e.target.value})}
                   className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                   placeholder="e.g., Health Insurance, Provident Fund, Annual Bonus"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Certifications (comma separated)</label>
                 <input
                   type="text"
                   value={newEmployee.certifications}
                   onChange={(e) => setNewEmployee({...newEmployee, certifications: e.target.value})}
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
                 disabled={!newEmployee.name || !newEmployee.email || !newEmployee.phone || !newEmployee.position || !newEmployee.salary}
                 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                <h2 className="text-xl font-bold">Edit Employee: {editingEmployee.name}</h2>
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
                  <h3 className="font-semibold text-gray-700 border-b pb-2">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={editingEmployee.name}
                      onChange={(e) => setEditingEmployee({...editingEmployee, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={editingEmployee.email}
                      onChange={(e) => setEditingEmployee({...editingEmployee, email: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={editingEmployee.phone}
                      onChange={(e) => setEditingEmployee({...editingEmployee, phone: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                    <input
                      type="text"
                      value={editingEmployee.position}
                      onChange={(e) => setEditingEmployee({...editingEmployee, position: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter job position"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                    <select
                      value={editingEmployee.department}
                      onChange={(e) => setEditingEmployee({...editingEmployee, department: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Production">Production</option>
                      <option value="Quality Assurance">Quality Assurance</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary (Rs.) *</label>
                    <input
                      type="number"
                      value={editingEmployee.salary}
                      onChange={(e) => setEditingEmployee({...editingEmployee, salary: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter salary amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editingEmployee.status}
                      onChange={(e) => setEditingEmployee({...editingEmployee, status: e.target.value as "active" | "on-leave" | "inactive"})}
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
                  <h3 className="font-semibold text-gray-700 border-b pb-2">Employment Details</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shift *</label>
                    <select
                      value={editingEmployee.shift}
                      onChange={(e) => setEditingEmployee({...editingEmployee, shift: e.target.value as "morning" | "evening" | "night"})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="morning">Morning</option>
                      <option value="evening">Evening</option>
                      <option value="night">Night</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type *</label>
                    <select
                      value={editingEmployee.contractType}
                      onChange={(e) => setEditingEmployee({...editingEmployee, contractType: e.target.value as "full-time" | "part-time" | "contract" | "temporary"})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="temporary">Temporary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Location</label>
                    <input
                      type="text"
                      value={editingEmployee.workLocation}
                      onChange={(e) => setEditingEmployee({...editingEmployee, workLocation: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter work location"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Working Hours</label>
                    <input
                      type="number"
                      value={editingEmployee.workingHours}
                      onChange={(e) => setEditingEmployee({...editingEmployee, workingHours: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Hours per week"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingEmployee.overtimeEligible}
                      onChange={(e) => setEditingEmployee({...editingEmployee, overtimeEligible: e.target.checked})}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">Overtime Eligible</label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Performance (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editingEmployee.performance}
                      onChange={(e) => setEditingEmployee({...editingEmployee, performance: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attendance (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editingEmployee.attendance}
                      onChange={(e) => setEditingEmployee({...editingEmployee, attendance: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mt-6 space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Additional Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                    <input
                      type="tel"
                      value={editingEmployee.emergencyContact}
                      onChange={(e) => setEditingEmployee({...editingEmployee, emergencyContact: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Emergency contact number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={editingEmployee.address}
                      onChange={(e) => setEditingEmployee({...editingEmployee, address: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                  <input
                    type="text"
                    value={editingEmployee.skills.join(', ')}
                    onChange={(e) => setEditingEmployee({...editingEmployee, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Quality Control, Team Management, Process Optimization"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Benefits (comma separated)</label>
                  <input
                    type="text"
                    value={editingEmployee.benefits.join(', ')}
                    onChange={(e) => setEditingEmployee({...editingEmployee, benefits: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Health Insurance, Provident Fund, Annual Bonus"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Certifications (comma separated)</label>
                  <input
                    type="text"
                    value={editingEmployee.certifications.join(', ')}
                    onChange={(e) => setEditingEmployee({...editingEmployee, certifications: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Food Safety Level 3, HACCP Certification"
                  />
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
                  disabled={!editingEmployee.name || !editingEmployee.email || !editingEmployee.phone || !editingEmployee.position || !editingEmployee.salary}
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
                 <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
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
                         const attendance = attendanceData.find(a => a.employeeId === employee.id && a.date === selectedDate);
                         return (
                           <tr key={employee.id} className="border-b hover:bg-gray-50">
                             <td className="p-4">
                               <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                   {employee.name.split(" ").map(n => n[0]).join("")}
                                 </div>
                                 <div>
                                   <p className="font-medium">{employee.name}</p>
                                   <p className="text-sm text-gray-600">{employee.position}</p>
                                 </div>
                               </div>
                             </td>
                             <td className="p-4 text-sm">{employee.department}</td>
                             <td className="p-4">
                              <select
                                 value={attendance?.status || "not-set"}
                                 onChange={(e) => handleAttendanceUpdate(
                                   employee.id, 
                                   e.target.value as "present" | "absent" | "late" | "half-day" | "not-set"
                                )}
                                disabled={isReadOnlyDate}
                                className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 ${isReadOnlyDate ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                               >
                                 <option value="not-set">Not Set</option>
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
                                 onChange={(e) => handleTimeChange(employee.id, "checkIn", e.target.value)}
                                disabled={isReadOnlyDate || attendance?.status === "absent"}
                                className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                                  isReadOnlyDate || attendance?.status === "absent" ? "bg-gray-100 cursor-not-allowed" : ""
                                 }`}
                                 placeholder="HH:MM"
                               />
                             </td>
                             <td className="p-4">
                              <input
                                 type="time"
                                 value={attendance?.checkOut || ""}
                                 onChange={(e) => handleTimeChange(employee.id, "checkOut", e.target.value)}
                                disabled={isReadOnlyDate || attendance?.status === "absent"}
                                className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                                  isReadOnlyDate || attendance?.status === "absent" ? "bg-gray-100 cursor-not-allowed" : ""
                                 }`}
                                 placeholder="HH:MM"
                               />
                             </td>
                             <td className="p-4">
                              <button
                                 onClick={() => {
                                   const currentStatus = attendance?.status || "not-set";
                                   let newStatus: "present" | "absent" | "late" | "half-day" | "not-set";
                                   if (currentStatus === "present") {
                                     newStatus = "absent";
                                   } else if (currentStatus === "absent") {
                                     newStatus = "present";
                                   } else {
                                     newStatus = "present";
                                   }
                                   handleAttendanceUpdate(employee.id, newStatus);
                                 }}
                                disabled={isReadOnlyDate || (attendance?.status || "not-set") === "not-set"}
                                className={`px-3 py-1 rounded text-sm transition ${
                                  isReadOnlyDate
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : (attendance?.status || "not-set") === "not-set"
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : (attendance?.status || "not-set") === "absent" 
                                    ? "bg-red-600 text-white hover:bg-red-700" 
                                    : (attendance?.status || "not-set") === "present"
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                               >
                                 Mark
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
                    alert("Attendance saved! In production, this would update the database.");
                    setShowAttendanceModal(false);
                  }}
                  disabled={isReadOnlyDate}
                  className={`px-4 py-2 rounded-lg transition text-white ${isReadOnlyDate ? 'bg-gray-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
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
                   <h3 className="font-semibold text-lg mb-3">Employee List Export</h3>
                   <p className="text-gray-600 mb-4">Export complete employee data to Excel format</p>
                   <button
                     onClick={exportToExcel}
                     className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                   >
                     Export to Excel
                   </button>
                 </div>

                 {/* Attendance Report */}
                 <div className="border rounded-lg p-4">
                   <h3 className="font-semibold text-lg mb-3">Attendance Report</h3>
                   <p className="text-gray-600 mb-4">Generate detailed attendance report for specific time period</p>
                   
                   <div className="grid grid-cols-2 gap-4 mb-4">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                       <input
                         type="date"
                         value={reportStartDate}
                         onChange={(e) => setReportStartDate(e.target.value)}
                         className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
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
                         alert("PDF export ready! In production, this would download a PDF file.");
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

         {/* Delete Employee Confirmation Modal */}
         {showDeleteModal && deletingEmployee && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div className="bg-white rounded-lg p-6 w-full max-w-md">
               <div className="flex items-center gap-3 mb-4">
                 <div className="bg-red-100 p-2 rounded-full">
                   <Trash2 className="text-red-600" size={24} />
                 </div>
                 <div>
                   <h2 className="text-xl font-bold text-gray-900">Delete Employee</h2>
                   <p className="text-gray-600">This action cannot be undone.</p>
                 </div>
               </div>
               
               <div className="mb-6">
                 <p className="text-gray-700">
                   Are you sure you want to delete <span className="font-semibold">{deletingEmployee.name}</span>?
                 </p>
                 <p className="text-sm text-gray-500 mt-2">
                   Position: {deletingEmployee.position}<br />
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
         )}

         {/* View Employee Modal */}
         {showViewModal && viewEmployee && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold">Employee Details: {viewEmployee.name}</h2>
                 <button
                   onClick={() => { setShowViewModal(false); setViewEmployee(null); }}
                   className="text-gray-500 hover:text-gray-700"
                 >
                   <X size={24} />
                 </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-3">
                   <div>
                     <p className="text-xs text-gray-500">Employee ID</p>
                     <p className="font-medium">{viewEmployee.employeeId}</p>
                   </div>
                   <div>
                     <p className="text-xs text-gray-500">Position</p>
                     <p className="font-medium">{viewEmployee.position}</p>
                   </div>
                   <div>
                     <p className="text-xs text-gray-500">Department</p>
                     <p className="font-medium">{viewEmployee.department}</p>
                   </div>
                   <div>
                     <p className="text-xs text-gray-500">Status</p>
                     <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(viewEmployee.status)}`}>{viewEmployee.status}</span>
                   </div>
                   <div>
                     <p className="text-xs text-gray-500">Join Date</p>
                     <p className="font-medium">{viewEmployee.joinDate}</p>
                   </div>
                   <div>
                     <p className="text-xs text-gray-500">Shift</p>
                     <p className="font-medium capitalize">{viewEmployee.shift}</p>
                   </div>
                   <div>
                     <p className="text-xs text-gray-500">Contract Type</p>
                     <p className="font-medium capitalize">{viewEmployee.contractType}</p>
                   </div>
                 </div>

                 <div className="space-y-3">
                   <div className="flex items-center gap-2 text-sm text-gray-700">
                     <Mail size={14} />
                     <span>{viewEmployee.email}</span>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-gray-700">
                     <Phone size={14} />
                     <span>{viewEmployee.phone}</span>
                   </div>
                   <div>
                     <p className="text-xs text-gray-500">Emergency Contact</p>
                     <p className="font-medium">{viewEmployee.emergencyContact}</p>
                   </div>
                   <div>
                     <p className="text-xs text-gray-500">Address</p>
                     <p className="font-medium">{viewEmployee.address}</p>
                   </div>
                   <div>
                     <p className="text-xs text-gray-500">Work Location</p>
                     <p className="font-medium">{viewEmployee.workLocation}</p>
                   </div>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                 <div className="bg-gray-50 rounded-lg p-4">
                   <p className="text-xs text-gray-500">Salary (Rs.)</p>
                   <p className="text-lg font-semibold">{viewEmployee.salary.toLocaleString()}</p>
                 </div>
                 <div className="bg-gray-50 rounded-lg p-4">
                   <p className="text-xs text-gray-500">Performance</p>
                   <p className="text-lg font-semibold">{viewEmployee.performance}%</p>
                 </div>
                 <div className="bg-gray-50 rounded-lg p-4">
                   <p className="text-xs text-gray-500">Attendance</p>
                   <p className="text-lg font-semibold">{viewEmployee.attendance}%</p>
                 </div>
               </div>

               <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <p className="text-xs text-gray-500 mb-1">Skills</p>
                   <div className="flex flex-wrap gap-1">
                     {viewEmployee.skills.map((s, i) => (
                       <span key={i} className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">{s}</span>
                     ))}
                   </div>
                 </div>
                 <div>
                   <p className="text-xs text-gray-500 mb-1">Benefits</p>
                   <div className="flex flex-wrap gap-1">
                     {viewEmployee.benefits.map((b, i) => (
                       <span key={i} className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">{b}</span>
                     ))}
                   </div>
                 </div>
                 <div>
                   <p className="text-xs text-gray-500 mb-1">Certifications</p>
                   <div className="flex flex-wrap gap-1">
                     {viewEmployee.certifications.map((c, i) => (
                       <span key={i} className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs">{c}</span>
                     ))}
                   </div>
                 </div>
                 <div className="grid grid-cols-3 gap-3">
                   <div className="bg-gray-50 rounded-lg p-3">
                     <p className="text-xs text-gray-500">Annual Leave</p>
                     <p className="font-medium">{viewEmployee.leaveBalance.annual}</p>
                   </div>
                   <div className="bg-gray-50 rounded-lg p-3">
                     <p className="text-xs text-gray-500">Sick Leave</p>
                     <p className="font-medium">{viewEmployee.leaveBalance.sick}</p>
                   </div>
                   <div className="bg-gray-50 rounded-lg p-3">
                     <p className="text-xs text-gray-500">Personal Leave</p>
                     <p className="font-medium">{viewEmployee.leaveBalance.personal}</p>
                   </div>
                 </div>
               </div>

               <div className="mt-6">
                 <h3 className="font-semibold text-gray-700 mb-2">Payroll Info</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="bg-gray-50 rounded-lg p-3">
                     <p className="text-xs text-gray-500">Bank</p>
                     <p className="font-medium">{viewEmployee.payrollInfo.bankName}</p>
                   </div>
                   <div className="bg-gray-50 rounded-lg p-3">
                     <p className="text-xs text-gray-500">Account #</p>
                     <p className="font-medium">{viewEmployee.payrollInfo.accountNumber}</p>
                   </div>
                   <div className="bg-gray-50 rounded-lg p-3">
                     <p className="text-xs text-gray-500">Tax ID</p>
                     <p className="font-medium">{viewEmployee.payrollInfo.taxId}</p>
                   </div>
                 </div>
               </div>

               <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                 <button
                   onClick={() => { setShowViewModal(false); setViewEmployee(null); }}
                   className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                 >
                   Close
                 </button>
               </div>
             </div>
           </div>
         )}
       </div>
     );
   }