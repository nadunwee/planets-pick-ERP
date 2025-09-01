import { useState, useEffect } from "react";
import { Plus, Users, AlertCircle, FileText, ShoppingCart } from "lucide-react";
import SupplierForm from "../components/suppliers/SupplierForm";
import type { Supplier as SupplierType } from "../components/suppliers/SupplierForm";
import { fetchSuppliers, createSupplier, updateSupplier, deleteSupplier } from "../utils/api";

import PurchaseOrders from "../components/purchase-orders/PurchaseOrders";
import ReportsDashboard from "../components/reports/ReportsDashboard";



const categories = ["All", "Raw Materials", "Packaging", "Finished Products"];

export default function Procurement() {
  const [activeTab, setActiveTab] = useState<"suppliers" | "purchaseOrders" | "reports">("suppliers");
  const [suppliers, setSuppliers] = useState<SupplierType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingSupplier, setEditingSupplier] = useState<SupplierType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch suppliers from backend
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const data = await fetchSuppliers();
        const normalized = data.items.map((s: SupplierType) => ({ ...s, _id: s._id }));
        setSuppliers(normalized);
      } catch (err) {
        console.error("Error fetching suppliers:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSuppliers();
  }, []);

  // Filters
  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Summary
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.status === "active").length;
  const inactiveSuppliers = suppliers.filter(s => s.status === "inactive").length;

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
      try {
        await deleteSupplier(_id);
        setSuppliers(prev => prev.filter(s => s._id !== _id));
      } catch (err) {
        console.error("Error deleting supplier:", err);
      }
    }
  };

  const handleFormSubmit = async (data: SupplierType) => {
    try {
      if (editingSupplier?._id) {
        const updated = await updateSupplier(editingSupplier._id, data);
        setSuppliers(prev => prev.map(s => (s._id === updated._id ? updated : s)));
      } else {
        const created = await createSupplier(data);
        setSuppliers(prev => [...prev, created]);
      }
    } catch (err) {
      console.error("Error saving supplier:", err);
    } finally {
      setShowForm(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading suppliers...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Procurement Management</h1>
          <p className="text-gray-600">Manage suppliers, purchase orders, and reports</p>
        </div>
        {activeTab === "suppliers" && (
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
          className={`px-4 py-2 flex items-center gap-2 ${activeTab === "suppliers" ? "border-b-2 border-green-600 text-green-600" : "text-gray-600"}`}
          onClick={() => setActiveTab("suppliers")}
        >
          <Users size={16} /> Suppliers
        </button>
        <button
          className={`px-4 py-2 flex items-center gap-2 ${activeTab === "purchaseOrders" ? "border-b-2 border-green-600 text-green-600" : "text-gray-600"}`}
          onClick={() => setActiveTab("purchaseOrders")}
        >
          <ShoppingCart size={16} /> Purchase Orders
        </button>
        <button
          className={`px-4 py-2 flex items-center gap-2 ${activeTab === "reports" ? "border-b-2 border-green-600 text-green-600" : "text-gray-600"}`}
          onClick={() => setActiveTab("reports")}
        >
          <FileText size={16} /> Reports
        </button>
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
                  <p className="text-2xl font-bold text-green-600">{activeSuppliers}</p>
                </div>
                <Users className="text-green-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inactive Suppliers</p>
                  <p className="text-2xl font-bold text-red-600">{inactiveSuppliers}</p>
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
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Supplier Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {filteredSuppliers.map(s => (
              <div key={s._id} className="bg-white p-4 rounded-lg shadow border hover:shadow-lg transition">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-lg text-gray-900">{s.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {s.status || "active"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Category: {s.category || "N/A"}</p>
                <p className="text-sm text-gray-600">Contact Person: {s.contactPerson || "N/A"}</p>
                <p className="text-sm text-gray-600">Phone: {s.phone || "N/A"}</p>
                <p className="text-sm text-gray-600">Email: {s.email || "N/A"}</p>
                <p className="text-sm text-gray-600">Address: {s.address || "N/A"}</p>
                <p className="text-sm text-gray-600">Country: {s.country || "N/A"}</p>

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
              </div>
            ))}
          </div>

          {filteredSuppliers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No suppliers found matching your criteria.</p>
            </div>
          )}

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex justify-center items-center">
              <div
                className="absolute inset-0 bg-black bg-opacity-40"
                onClick={() => setShowForm(false)}
              />
              <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-lg z-10">
                <SupplierForm
                  initialData={editingSupplier || undefined}
                  onSubmit={handleFormSubmit}
                />
                <button
                  onClick={() => setShowForm(false)}
                  className="mt-2 w-full px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "purchaseOrders" && (
        <div className="mt-4">
          <PurchaseOrders />
        </div>
      )}

      {activeTab === "reports" && (
        <div className="mt-4">
          <ReportsDashboard />
        </div>
      )}
    </div>
  );
}
