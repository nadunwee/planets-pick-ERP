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
  Bot,
  UserCheck,
  UserX,
  CheckCircle,
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
}

interface Attendance {
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  hoursWorked: number;
  overtime: number;
  status: "present" | "absent" | "late" | "half-day";
}

const employees: Employee[] = [
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
  },
  {
    employeeId: "2",
    date: "2024-01-15",
    checkIn: "08:00",
    checkOut: "17:00",
    hoursWorked: 9,
    overtime: 1,
    status: "present",
  },
  {
    employeeId: "3",
    date: "2024-01-15",
    checkIn: "",
    checkOut: "",
    hoursWorked: 0,
    overtime: 0,
    status: "absent",
  },
  {
    employeeId: "4",
    date: "2024-01-15",
    checkIn: "08:15",
    checkOut: "",
    hoursWorked: 0,
    overtime: 0,
    status: "present",
  },
  {
    employeeId: "5",
    date: "2024-01-15",
    checkIn: "22:00",
    checkOut: "",
    hoursWorked: 0,
    overtime: 0,
    status: "present",
  },
];

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

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
    const attendance = todayAttendance.find(a => a.employeeId === employeeId);
    return attendance?.status || "absent";
  };

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === "active").length;
  const onLeaveEmployees = employees.filter(e => e.status === "on-leave").length;
  const presentToday = todayAttendance.filter(a => a.status === "present").length;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600">Manage workforce, attendance, and performance</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition">
            <Plus size={16} />
            Add Employee
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
            <Bot size={16} />
            AI Insights
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
              Priya Silva shows 15% productivity increase this month. Consider for leadership training.
              Optimal shift scheduling suggests moving 2 employees to evening shift for better coverage.
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
                  <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                    <Eye size={16} />
                  </button>
                  <button className="p-1 text-gray-600 hover:bg-gray-50 rounded">
                    <Edit size={16} />
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
                {filteredEmployees.map((employee) => (
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
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(employee.status)}`}>
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
                        <button className="p-1 text-gray-600 hover:bg-gray-50 rounded">
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
    </div>
  );
}