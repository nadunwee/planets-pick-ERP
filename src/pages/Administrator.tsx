import { useEffect, useState } from "react";
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

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  level: string;
  approved: string;
}

export default function Administrator() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rolesList = ["All", "admin", "manager", "employee", "viewer"];
  const statusList = ["All", "active", "inactive", "suspended"];

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:4000/api/user/all_users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data: User[] = await res.json();
      const pendingUsers = data.filter((user) => user.approved === "false");
      setUsers(pendingUsers);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "All" || user.role === selectedRole;
    const matchesStatus = selectedStatus === "All";
    return matchesSearch && matchesRole && matchesStatus;
  });

  async function handleApproval(userId: string, status: boolean | "rejected") {
    try {
      const res = await fetch(
        `http://localhost:4000/api/user/edit_approval/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ approved: status }),
        }
      );
      if (!res.ok) throw new Error("Failed to update user approval");
      const updatedUser = await res.json();
      // Update state to reflect change
      setUsers((prev) =>
        prev.map((user) => (user._id === userId ? updatedUser : user))
      );
      await fetchUsers();
    } catch (err: any) {
      console.error(err.message);
    }
  }

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
                        {role === "All"
                          ? "All Roles"
                          : role.charAt(0).toUpperCase() + role.slice(1)}
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
                        {status === "All"
                          ? "All Status"
                          : status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="p-4">
              {loading ? (
                <p>Loading users...</p>
              ) : error ? (
                <p className="text-red-600">{error}</p>
              ) : filteredUsers.length === 0 ? (
                <p className="text-gray-600">No pending users found.</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="border-b px-4 py-2">Name</th>
                      <th className="border-b px-4 py-2">Email</th>
                      <th className="border-b px-4 py-2">Role</th>
                      <th className="border-b px-4 py-2">Status</th>
                      {/* <th className="border-b px-4 py-2">Actions</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td className="border-b px-4 py-2">{user.name}</td>
                        <td className="border-b px-4 py-2">{user.email}</td>
                        <td className="border-b px-4 py-2">{user.role}</td>
                        {/* <td className="border-b px-4 py-2">{user.approved}</td> */}
                        <td className="border-b px-4 py-2 flex gap-2">
                          <button
                            onClick={() => handleApproval(user._id, true)}
                            className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproval(user._id, "rejected")}
                            className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
