import { useState, useEffect } from "react";
import axios from "axios";
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Plus,
  X,
  Download,
  Edit2,
  Trash2,
} from "lucide-react";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// --- Register ChartJS components ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// --- TYPES ---
interface Transaction {
  _id: string;
  date: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  account: string;
  reference?: string;
  status: "completed" | "pending" | "failed";
}

interface Account {
  _id: string;
  name: string;
  type: "checking" | "savings" | "credit" | "investment";
  balance: number;
  currency: string;
  bank: string;
  accountNumber: string;
}

interface Budget {
  _id: string;
  category: string;
  allocated: number;
  spent: number;
  period: "monthly" | "quarterly" | "yearly";
}

interface ReportType {
  id: string;
  name: string;
  format: "pdf" | "excel" | "csv";
}

interface AssetLiability {
  _id: string;
  type: "asset" | "liability";
  subtype: "current" | "non-current";
  name: string;
  value: number;
  date: string;
  status: "active" | "sold" | "settled";
}

// --- API ---
const API = axios.create({
  baseURL: "http://localhost:4000/api/finance",
});

export default function Finance() {
  // --- STATES ---
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [assetsLiabilities, setAssetsLiabilities] = useState<AssetLiability[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // --- Modals ---
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToEdit, setTransactionToEdit] =
    useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);

  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense" | "asset" | "liability",
    subType: "current" as "current" | "non-current",
    category: "",
    description: "",
    amount: "",
    account: "",
    reference: "",
    date: new Date().toISOString().split("T")[0],
    // For assets/liabilities
    name: "",
    value: "",
  });

  const types = ["All", "income", "expense"];
  const categories = [
    "All",
    "Sales",
    "Raw Materials",
    "Operations",
    "Payroll",
    "Marketing",
    "Equipment",
  ];
  const reportTypes: ReportType[] = [
    { id: "1", name: "Monthly Report", format: "pdf" },
    { id: "2", name: "Quarterly Report", format: "excel" },
  ];

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tRes, aRes, bRes, alRes] = await Promise.all([
          API.get<Transaction[]>("/transactions"),
          API.get<Account[]>("/accounts"),
          API.get<Budget[]>("/budgets"),
          API.get<AssetLiability[]>("/assets-liabilities"),
        ]);
        setTransactions(tRes.data);
        setAccounts(aRes.data);
        setBudgets(bRes.data);
        setAssetsLiabilities(alRes.data);
      } catch (err: any) {
        console.error("Fetch error:", err.response?.data || err.message);
      }
    };
    fetchData();
  }, []);

  // --- FILTERED TRANSACTIONS ---
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "All" || t.type === selectedType;
    const matchesCategory =
      selectedCategory === "All" || t.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  // --- CALCULATIONS ---
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalAssets = assetsLiabilities
    .filter((al) => al.type === "asset")
    .reduce((sum, al) => sum + al.value, 0);
  const totalLiabilities = assetsLiabilities
    .filter((al) => al.type === "liability")
    .reduce((sum, al) => sum + al.value, 0);

  const netWorth = totalAssets - totalLiabilities;

  // --- ASSET CHART DATA ---
  const assets = assetsLiabilities
    .filter((al) => al.type === "asset")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const liabilities = assetsLiabilities
    .filter((al) => al.type === "liability")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const currentAssetsData = {
    labels: assets
      .filter((a) => a.subtype === "current")
      .map((a) => a.name),
    datasets: [
      {
        label: "Current Assets",
        data: assets
          .filter((a) => a.subtype === "current")
          .map((a) => a.value),
        backgroundColor: "rgba(59, 130, 246, 0.6)",
      },
    ],
  };

  const nonCurrentAssetsData = {
    labels: assets
      .filter((a) => a.subtype === "non-current")
      .map((a) => a.name),
    datasets: [
      {
        label: "Non-current Assets",
        data: assets
          .filter((a) => a.subtype === "non-current")
          .map((a) => a.value),
        backgroundColor: "rgba(16, 185, 129, 0.6)",
      },
    ],
  };

  const currentLiabilitiesData = {
    labels: liabilities
      .filter((l) => l.subtype === "current")
      .map((l) => l.name),
    datasets: [
      {
        label: "Current Liabilities",
        data: liabilities
          .filter((l) => l.subtype === "current")
          .map((l) => l.value),
        backgroundColor: "rgba(239, 68, 68, 0.6)",
      },
    ],
  };

  const nonCurrentLiabilitiesData = {
    labels: liabilities
      .filter((l) => l.subtype === "non-current")
      .map((l) => l.name),
    datasets: [
      {
        label: "Non-current Liabilities",
        data: liabilities
          .filter((l) => l.subtype === "non-current")
          .map((l) => l.value),
        backgroundColor: "rgba(245, 158, 11, 0.6)",
      },
    ],
  };

  // --- UTILS ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };
  const getTypeColor = (type: string) =>
    type === "income" || type === "asset"
      ? "text-green-600"
      : type === "expense" || type === "liability"
      ? "text-red-600"
      : "text-gray-600";

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      type: "expense",
      category: "",
      subType: "current",
      description: "",
      amount: "",
      account: "",
      reference: "",
      date: new Date().toISOString().split("T")[0],
      name: "",
      value: "",
    });
  };

  // --- CRUD HANDLERS ---
  const handleAddTransaction = async () => {
    if (
      !formData.category ||
      !formData.description ||
      !formData.amount ||
      !formData.account
    ) {
      alert("Please fill all required fields");
      return;
    }
    try {
      const res = await API.post<Transaction>("/transactions", {
        ...formData,
        amount: Number(formData.amount),
      });
      setTransactions([res.data, ...transactions]);
      setShowAddModal(false);
      resetForm();
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      alert("Failed to add transaction");
    }
  };

  const handleEditTransaction = (t: Transaction) => {
    setTransactionToEdit(t);
    setFormData({
      type: t.type,
      category: t.category,
      description: t.description,
      amount: t.amount.toString(),
      account: t.account,
      reference: t.reference || "",
      date: t.date.split("T")[0],
    });
    setShowEditModal(true);
  };

  const handleUpdateTransaction = async () => {
    if (!transactionToEdit) return;
    try {
      const res = await API.put<Transaction>(
        `/transactions/${transactionToEdit._id}`,
        {
          ...formData,
          amount: Number(formData.amount),
        }
      );
      setTransactions(
        transactions.map((t) => (t._id === res.data._id ? res.data : t))
      );
      setShowEditModal(false);
      setTransactionToEdit(null);
      resetForm();
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      alert("Failed to update transaction");
    }
  };

  const handleDeleteTransaction = (t: Transaction) => {
    setTransactionToDelete(t);
    setShowDeleteModal(true);
  };

  const confirmDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    try {
      await API.delete(`/transactions/${transactionToDelete._id}`);
      setTransactions(
        transactions.filter((t) => t._id !== transactionToDelete._id)
      );
      setShowDeleteModal(false);
      setTransactionToDelete(null);
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      alert("Failed to delete transaction");
    }
  };

  const setShowDownloadReports = (show: boolean) => {
    console.log("Download reports clicked", show);
  };

  // --- ADD ASSET/LIABILITY HANDLER ---
  const handleAddAssetLiability = async () => {
    if (!formData.type || !formData.subType || !formData.name || !formData.value) {
      alert("Please fill all required fields");
      return;
    }
    try {
      const res = await API.post<AssetLiability>("/assets-liabilities", {
        type: formData.type,
        subtype: formData.subType,
        name: formData.name,
        value: Number(formData.value),
        date: formData.date,
      });
      setAssetsLiabilities([res.data, ...assetsLiabilities]);
      setShowAddAssetModal(false);
      resetForm();
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      alert("Failed to add asset/liability");
    }
  };

  // --- RENDER ---
  return (
    <div className="p-4 space-y-6">
      {/* Header + Add Buttons */}
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Finance Management
          </h1>
          <p className="text-gray-600">
            Monitor financial performance, manage budgets, and track cash flow
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
          >
            <Plus size={16} /> Add Transaction
          </button>
          <button
            onClick={() => setShowAddAssetModal(true)}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-yellow-700 transition"
          >
            <Plus size={16} /> Add Asset / Liability
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
            Financial AI
          </button>
          <button
            onClick={() => setShowDownloadReports(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
          >
            <FileText size={16} /> Download Reports
          </button>
        </div>
      </div>

      {/* Summary Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">Total Income</h3>
          <p className="text-2xl font-bold text-green-700">
            {totalIncome.toLocaleString("en-LK", {
              style: "currency",
              currency: "LKR",
            })}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-700">
            {totalExpenses.toLocaleString("en-LK", {
              style: "currency",
              currency: "LKR",
            })}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">Total Assets</h3>
          <p className="text-2xl font-bold text-blue-700">
            {totalAssets.toLocaleString("en-LK", {
              style: "currency",
              currency: "LKR",
            })}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">
            Total Liabilities
          </h3>
          <p className="text-2xl font-bold text-yellow-700">
            {totalLiabilities.toLocaleString("en-LK", {
              style: "currency",
              currency: "LKR",
            })}
          </p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">Net Worth</h3>
          <p className="text-2xl font-bold text-indigo-700">
            {netWorth.toLocaleString("en-LK", {
              style: "currency",
              currency: "LKR",
            })}
          </p>
        </div>
      </div>

      {/* ASSET/LIABILITY MODAL */}
      {showAddAssetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl w-full max-w-md relative p-6">
            <button
              onClick={() => setShowAddAssetModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-semibold mb-4">
              Add Asset / Liability
            </h2>
            <form className="space-y-4">
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg p-2 w-full"
              >
                <option value="asset">Asset</option>
                <option value="liability">Liability</option>
              </select>
              <select
                name="subType"
                value={formData.subType}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg p-2 w-full"
              >
                <option value="current">Current</option>
                <option value="non-current">Non-current</option>
              </select>
              <input
                type="text"
                name="name"
                placeholder="Asset/Liability Name"
                value={formData.name}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
              <input
                type="number"
                name="value"
                placeholder="Value"
                value={formData.value}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
              <button
                type="button"
                onClick={handleAddAssetLiability}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold hover:from-yellow-600 hover:to-orange-600 transition"
              >
                Add
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl w-full max-w-md relative p-6">
            <button
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
            >
              <X size={24} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`p-3 rounded-full ${
                  formData.type === "income"
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {formData.type === "income" ? (
                  <TrendingUp size={20} />
                ) : (
                  <TrendingDown size={20} />
                )}
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {showAddModal ? "Add" : "Edit"} Transaction
              </h2>
            </div>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                <input
                  type="text"
                  name="category"
                  placeholder="Category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
              </div>
              <input
                type="text"
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  name="amount"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="account"
                  placeholder="Account"
                  value={formData.account}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
                <input
                  type="text"
                  name="reference"
                  placeholder="Reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
              </div>
              <button
                type="button"
                onClick={
                  showAddModal ? handleAddTransaction : handleUpdateTransaction
                }
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:from-indigo-600 hover:to-purple-600 transition"
              >
                {showAddModal ? "Add Transaction" : "Update Transaction"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && transactionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p>
              Are you sure you want to delete transaction{" "}
              <span className="font-bold">
                {transactionToDelete.description}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTransaction}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <div className="p-4 flex gap-2 flex-wrap items-center">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded p-2 flex-1 min-w-[200px]"
          />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border rounded p-2"
          >
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded p-2"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Description
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Category
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Account
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Amount
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-4 text-center text-gray-500">
                  No transactions found.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((t) => (
                <tr key={t._id}>
                  <td className="px-4 py-2">
                    {new Date(t.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{t.description}</td>
                  <td className="px-4 py-2">{t.category}</td>
                  <td className="px-4 py-2">{t.account}</td>
                  <td
                    className={`px-4 py-2 font-semibold ${getTypeColor(
                      t.type
                    )}`}
                  >
                    {t.amount.toLocaleString("en-LK", {
                      style: "currency",
                      currency: "LKR",
                    })}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                        t.status
                      )}`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => handleEditTransaction(t)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition flex items-center gap-1"
                    >
                      <Edit2 size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(t)}
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition flex items-center gap-1"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-700 font-semibold mb-2">
            Non-current Assets
          </h3>
          <Bar data={nonCurrentAssetsData} />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-700 font-semibold mb-2">Current Assets</h3>
          <Bar data={currentAssetsData} />
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-700 font-semibold mb-2">
            Non-current Liabilities
          </h3>
          <Bar data={nonCurrentLiabilitiesData} />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-700 font-semibold mb-2">
            Current Liabilities
          </h3>
          <Bar data={currentLiabilitiesData} />
        </div>
      </div>
    </div>
  );
}
