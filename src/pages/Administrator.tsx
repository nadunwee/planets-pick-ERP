import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { Users, Shield, UserCheck, UserX, Search } from "lucide-react";
import { getCurrentUser, canApproveUsers } from "@/utils/userAuth";
import api from "@/components/services/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  level: string;
  approved: boolean;
  createdAt?: string;
}

export default function Administrator() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  // Redirect if user doesn't have permission (only L4 can access)
  useEffect(() => {
    if (!currentUser || !canApproveUsers(currentUser.level)) {
      alert("Access Denied: Only administrators can manage users");
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLevels, setUserLevels] = useState<Record<string, string>>({});

  const rolesList = ["All", "admin", "manager", "employee", "viewer"];
  const statusList = ["All", "active", "inactive", "suspended"];

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<User[]>("/users");
      setAllUsers(data);
      const pendingUsers = data.filter((user) => !user.approved);

      setUsers(pendingUsers);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      const status = err?.response?.status;
      const messageText =
        err?.response?.data?.error || err?.message || "Failed to fetch users";
      setError(messageText);
      if (status === 401) {
        message.error("Session expired. Please log in again.");
        navigate("/login");
      }
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

  async function handleApproval(
    userId: string,
    status: boolean | "rejected",
    level?: string
  ) {
    try {
      const { data: updatedUser } = await api.patch<User>(
        `/users/approve/${userId}`,
        {
          approved: status,
          level: level || "L1",
        }
      );
      setUsers((prev) =>
        prev.map((user) => (user._id === userId ? updatedUser : user))
      );
      await fetchUsers();
      message.success("User approval updated");
    } catch (err: any) {
      console.error("Error updating user approval:", err);
      const status = err?.response?.status;
      const messageText =
        err?.response?.data?.error || err?.message || "Failed to update user";
      message.error(messageText);
      if (status === 401) {
        navigate("/login");
      }
    }
  }

  async function handleDelete(userId: string) {
    try {
      await api.delete(`/users/${userId}`);

      message.success("User deleted successfully");

      // Remove user from state
      setUsers((prev) => prev.filter((user) => user._id !== userId));

      // Optionally re-fetch users (if you want to be extra sure)
      await fetchUsers();
    } catch (err: any) {
      console.error("Error deleting user:", err);
      const status = err?.response?.status;
      const messageText =
        err?.response?.data?.error || err?.message || "Failed to delete user";
      message.error(messageText);
      if (status === 401) {
        navigate("/login");
      }
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
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-5 rounded-xl shadow-lg border border-blue-200 hover:scale-105 transform transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Users</p>
              <p className="text-3xl font-bold text-blue-700">
                {allUsers.length}
              </p>
            </div>
            <Users className="text-blue-600" size={28} />
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-gradient-to-br from-orange-100 to-orange-50 p-5 rounded-xl shadow-lg border border-orange-200 hover:scale-105 transform transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">
                Pending Approvals
              </p>
              <p className="text-3xl font-bold text-orange-700">
                {users.length}
              </p>
              <p className="text-xs text-orange-500 flex items-center gap-1 mt-1">
                <UserCheck size={14} />
                Awaiting approval
              </p>
            </div>
            <UserCheck className="text-orange-600" size={28} />
          </div>
        </div>

        {/* Suspended */}
        <div className="bg-gradient-to-br from-red-100 to-red-50 p-5 rounded-xl shadow-lg border border-red-200 hover:scale-105 transform transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Suspended</p>
              <p className="text-3xl font-bold text-red-700">2</p>
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <UserX size={14} />
                Access revoked
              </p>
            </div>
            <UserX className="text-red-600" size={28} />
          </div>
        </div>

        {/* User Roles */}
        <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-5 rounded-xl shadow-lg border border-purple-200 hover:scale-105 transform transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">User Roles</p>
              <p className="text-3xl font-bold text-purple-700">4</p>
              <p className="text-xs text-purple-500 flex items-center gap-1 mt-1">
                <Shield size={14} />
                Defined roles
              </p>
            </div>
            <Shield className="text-purple-600" size={28} />
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
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Pending User Account Approvals ({filteredUsers.length})
                  </h3>
                  <table className="w-full text-left border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border-b px-4 py-3 font-medium text-gray-700">
                          Employee
                        </th>
                        <th className="border-b px-4 py-3 font-medium text-gray-700">
                          Department
                        </th>
                        <th className="border-b px-4 py-3 font-medium text-gray-700">
                          Role
                        </th>
                        <th className="border-b px-4 py-3 font-medium text-gray-700">
                          Request Date
                        </th>
                        <th className="border-b px-4 py-3 font-medium text-gray-700">
                          Access Level
                        </th>
                        <th className="border-b px-4 py-3 font-medium text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="border-b px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900">
                                {user.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {user.email}
                              </p>
                            </div>
                          </td>
                          <td className="border-b px-4 py-3 text-gray-700">
                            {user.department}
                          </td>
                          <td className="border-b px-4 py-3">
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {user.role}
                            </span>
                          </td>
                          <td className="border-b px-4 py-3 text-sm text-gray-600">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="border-b px-4 py-3">
                            <select
                              value={userLevels[user._id] || "L1"}
                              onChange={(e) =>
                                setUserLevels((prev) => ({
                                  ...prev,
                                  [user._id]: e.target.value,
                                }))
                              }
                              className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {["L1", "L2", "L3", "L4"].map((level) => (
                                <option key={level} value={level}>
                                  Level {level}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="border-b px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleApproval(
                                    user._id,
                                    true,
                                    userLevels[user._id] || "L1"
                                  )
                                }
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                              >
                                <UserCheck size={14} />
                                Approve
                              </button>
                              <button
                                onClick={() => handleDelete(user._id)}
                                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors flex items-center gap-1"
                              >
                                <UserX size={14} />
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
            <div className="p-4 space-y-2 space-x-1">
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
        </div>
      </div>
    </div>
  );
}
