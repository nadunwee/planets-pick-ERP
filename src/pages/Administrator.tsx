import { useState } from "react";
import {
  Users,
  Shield,
  Settings,
  UserPlus,
  UserCheck,
  UserX,
  Search,
  Plus,
  Activity,
} from "lucide-react";



export default function Administrator() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const rolesList = ["All", "admin", "manager", "employee", "viewer"];
  const statusList = ["All", "active", "inactive", "suspended"];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Administrator Dashboard
          </h1>
          <p className="text-gray-600">
            Manage user access, roles, and system permissions
          </p>
        </div>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
            <UserPlus size={16} />
            Add User
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition">
            <Plus size={16} />
            Add Role
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition">
            <Settings size={16} />
            System Settings
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-blue-600">25</p>
              <p className="text-sm text-blue-600 flex items-center gap-1">
                <Users size={14} />
                System users
              </p>
            </div>
            <Users className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-green-600">22</p>
              <p className="text-sm text-green-600 flex items-center gap-1">
                <UserCheck size={14} />
                Currently active
              </p>
            </div>
            <UserCheck className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Suspended</p>
              <p className="text-2xl font-bold text-red-600">2</p>
              <p className="text-sm text-red-600 flex items-center gap-1">
                <UserX size={14} />
                Access revoked
              </p>
            </div>
            <UserX className="text-red-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">User Roles</p>
              <p className="text-2xl font-bold text-purple-600">4</p>
              <p className="text-sm text-purple-600 flex items-center gap-1">
                <Shield size={14} />
                Defined roles
              </p>
            </div>
            <Shield className="text-purple-500" size={24} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Users Management */}
          <div className="bg-white rounded-lg shadow border">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Users size={20} />
                User Management
              </h2>
            </div>

            {/* Filters */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {rolesList.map((role) => (
                      <option key={role} value={role}>
                        {role === "All" ? "All Roles" : role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statusList.map((status) => (
                      <option key={status} value={status}>
                        {status === "All" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="text-center text-gray-500 py-8">
                <Users size={48} className="mx-auto mb-4 text-gray-300" />
                <p>User management interface will be implemented here</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow border">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-2">
              <button className="w-full bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition text-sm">
                Add New User
              </button>
              <button className="w-full bg-green-600 text-white py-2 px-3 rounded hover:bg-green-700 transition text-sm">
                Create Role
              </button>
              <button className="w-full bg-purple-600 text-white py-2 px-3 rounded hover:bg-purple-700 transition text-sm">
                Bulk Import
              </button>
              <button className="w-full bg-yellow-600 text-white py-2 px-3 rounded hover:bg-yellow-700 transition text-sm">
                Export Users
              </button>
              <button className="w-full bg-indigo-600 text-white py-2 px-3 rounded hover:bg-indigo-700 transition text-sm">
                Audit Logs
              </button>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-lg shadow border">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Activity size={20} />
                System Health
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Sessions</span>
                <span className="text-sm font-medium text-green-600">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Failed Logins</span>
                <span className="text-sm font-medium text-red-600">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Security Alerts</span>
                <span className="text-sm font-medium text-yellow-600">1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Uptime</span>
                <span className="text-sm font-medium text-blue-600">99.9%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
