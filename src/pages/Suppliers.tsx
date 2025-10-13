import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { Plus, Users, AlertCircle, FileText, ShoppingCart } from "lucide-react";
import SupplierForm from "../components/suppliers/SupplierForm";
import type { Supplier as SupplierType } from "../types";
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  submitProcurementChangeRequest,
} from "../utils/api";

import PurchaseOrders from "../components/purchase-orders/PurchaseOrders";
import ReportsDashboard from "../components/reports/ReportsDashboard";
import {
  getCurrentUser,
  canManageSuppliers,
  canDownloadReports,
  canCreatePurchaseOrders,
} from "../utils/userAuth";

const categories = ["All", "Raw Materials", "Packaging", "Finished Products"];

export default function Procurement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "suppliers" | "purchaseOrders" | "reports"
  >("suppliers");
  const [suppliers, setSuppliers] = useState<SupplierType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingSupplier, setEditingSupplier] = useState<SupplierType | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentUser = useMemo(() => getCurrentUser(), []);
  const userLevel = currentUser?.level;
  const isProcurementManagerL1 =
    currentUser?.level === "L1" && currentUser?.department === "Procurement";
  const allowSupplierManagement = userLevel
    ? canManageSuppliers(userLevel)
    : false;
  const allowPurchaseOrders = userLevel
    ? canCreatePurchaseOrders(userLevel)
    : false;
  const allowReports = userLevel ? canDownloadReports(userLevel) : false;

  // Fetch suppliers from backend
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const data = await fetchSuppliers();
        const items = Array.isArray((data as any)?.items)
          ? ((data as any).items as SupplierType[])
          : Array.isArray(data)
          ? (data as SupplierType[])
          : [];
        const normalized = items.map((s: SupplierType) => ({
          ...s,
          _id: s._id,
        }));
        setSuppliers(normalized);
      } catch (err: any) {
        console.error("Error fetching suppliers:", err);
        if (err?.status === 401) {
          message.error(
            err.message || "Your session expired. Please log in again."
          );
          navigate("/login");
        } else {
          message.error(err?.message || "Failed to load suppliers.");
        }
      } finally {
        setLoading(false);
      }
    };
    loadSuppliers();
  }, [navigate]);

  // Filters
  const filteredSuppliers = suppliers.filter((s) => {
    const matchesSearch = s.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Summary
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter((s) => s.status === "active").length;
  const inactiveSuppliers = suppliers.filter(
    (s) => s.status === "inactive"
  ).length;

  // Handlers
  const handleCreate = () => {
    setEditingSupplier(null);
    setShowForm(true);
  };

  const handleEdit = (supplier: SupplierType) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const handleDelete = async (_id?: string) => {
    if (!_id) return;
    if (confirm("Are you sure you want to delete this supplier?")) {
      if (isProcurementManagerL1) {
        try {
          const reason = window.prompt(
            "Provide a note for your Procurement Director (optional):",
            ""
          );
          if (reason === null) {
            return;
          }

          const response = await submitProcurementChangeRequest({
            entityType: "supplier",
            actionType: "delete",
            targetId: _id,
            reason,
          });

          message.success(
            response.message ||
              "Supplier deletion request submitted for approval."
          );
        } catch (err: any) {
          console.error("Error submitting delete request:", err);
          if (err?.status === 401) {
            message.error(err.message || "Unauthorized. Please log in again.");
            navigate("/login");
          } else {
            message.error(
              err?.message || "Failed to submit supplier delete request."
            );
          }
        }
        return;
      }

      try {
        await deleteSupplier(_id);
        setSuppliers((prev) => prev.filter((s) => s._id !== _id));
        message.success("Supplier deleted successfully");
      } catch (err) {
        console.error("Error deleting supplier:", err);
        if ((err as any)?.status === 401) {
          message.error(
            (err as any).message || "Unauthorized. Please log in again."
          );
          navigate("/login");
        } else {
          message.error((err as any)?.message || "Failed to delete supplier.");
        }
      }
    }
  };

  const handleFormSubmit = async (data: SupplierType) => {
    try {
      if (isProcurementManagerL1) {
        const reason = window.prompt(
          "Provide a note for your Procurement Director (optional):",
          ""
        );
        if (reason === null) {
          return;
        }

        const response = await submitProcurementChangeRequest({
          entityType: "supplier",
          actionType: editingSupplier?._id ? "update" : "create",
          targetId: editingSupplier?._id || undefined,
          payload: data as unknown as Record<string, unknown>,
          reason,
        });

        message.success(
          response.message || "Supplier change request submitted for approval."
        );
        setShowForm(false);
        setEditingSupplier(null);
        return;
      }

      if (editingSupplier?._id) {
        const updated = await updateSupplier(editingSupplier._id, data);
        setSuppliers((prev) =>
          prev.map((s) => (s._id === updated._id ? updated : s))
        );
        message.success("Supplier updated successfully");
      } else {
        const created = await createSupplier(data);
        setSuppliers((prev) => [...prev, created]);
        message.success("Supplier created successfully");
      }
      setShowForm(false);
      setEditingSupplier(null);
    } catch (err) {
      console.error("Error saving supplier:", err);
      if ((err as any)?.status === 401) {
        message.error(
          (err as any).message || "Unauthorized. Please log in again."
        );
        navigate("/login");
      } else {
        message.error((err as any)?.message || "Failed to save supplier.");
      }
      throw err; // Re-throw to let the form handle the error
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">Loading suppliers...</div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Procurement Management
          </h1>
          <p className="text-gray-600">
            Manage suppliers, purchase orders, and reports
          </p>
        </div>
        {activeTab === "suppliers" && allowSupplierManagement && (
          <button
            onClick={handleCreate}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition w-fit"
          >
            <Plus size={16} /> Add Supplier
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 flex items-center gap-2 ${
            activeTab === "suppliers"
              ? "border-b-2 border-green-600 text-green-600"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("suppliers")}
        >
          <Users size={16} /> Suppliers
        </button>
        {allowPurchaseOrders && (
          <button
            className={`px-4 py-2 flex items-center gap-2 ${
              activeTab === "purchaseOrders"
                ? "border-b-2 border-green-600 text-green-600"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("purchaseOrders")}
          >
            <ShoppingCart size={16} /> Purchase Orders
          </button>
        )}
        {allowReports && (
          <button
            className={`px-4 py-2 flex items-center gap-2 ${
              activeTab === "reports"
                ? "border-b-2 border-green-600 text-green-600"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("reports")}
          >
            <FileText size={16} /> Reports
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === "suppliers" && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Suppliers</p>
                  <p className="text-2xl font-bold">{totalSuppliers}</p>
                </div>
                <Users className="text-blue-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Suppliers</p>
                  <p className="text-2xl font-bold text-green-600">
                    {activeSuppliers}
                  </p>
                </div>
                <Users className="text-green-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inactive Suppliers</p>
                  <p className="text-2xl font-bold text-red-600">
                    {inactiveSuppliers}
                  </p>
                </div>
                <AlertCircle className="text-red-500" size={24} />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow border flex flex-col lg:flex-row gap-4 mt-4">
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Supplier Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {filteredSuppliers.map((s) => (
              <div
                key={s._id}
                className="bg-white p-4 rounded-lg shadow border hover:shadow-lg transition"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {s.name}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      s.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {s.status || "active"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Category: {s.category || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Contact Person: {s.contactPerson || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Phone: {s.phone || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Email: {s.email || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Address: {s.address || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Country: {s.country || "N/A"}
                </p>

                {allowSupplierManagement && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(s)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s._id)}
                      className="flex-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredSuppliers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">
                No suppliers found matching your criteria.
              </p>
            </div>
          )}

          {/* Form Modal */}
          <SupplierForm
            open={showForm}
            onClose={() => {
              setShowForm(false);
              setEditingSupplier(null);
            }}
            initial={editingSupplier}
            onSubmit={handleFormSubmit}
          />
        </>
      )}

      {activeTab === "purchaseOrders" && allowPurchaseOrders && (
        <div className="mt-4">
          <PurchaseOrders />
        </div>
      )}

      {activeTab === "reports" && allowReports && (
        <div className="mt-4">
          <ReportsDashboard />
        </div>
      )}

      {!allowSupplierManagement && activeTab === "suppliers" && (
        <div className="text-sm text-gray-500">
          You have read-only access to supplier records.
        </div>
      )}

      {!allowPurchaseOrders && activeTab === "purchaseOrders" && (
        <div className="mt-4 text-sm text-gray-500">
          You do not have permission to manage purchase orders. Contact your
          administrator.
        </div>
      )}

      {!allowReports && activeTab === "reports" && (
        <div className="mt-4 text-sm text-gray-500">
          Reports are restricted for your access level.
        </div>
      )}
    </div>
  );
}
