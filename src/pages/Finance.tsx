import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  Banknote,
  BarChart3,
  Receipt,
  FileText,
  Calendar,
  Search,
  Download,
  Plus,
  Bot,
  Clock,
  Target,
} from "lucide-react";

interface Transaction {
  id: string;
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
  id: string;
  name: string;
  type: "checking" | "savings" | "credit" | "investment";
  balance: number;
  currency: string;
  bank: string;
  accountNumber: string;
}

interface Budget {
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  period: "monthly" | "quarterly" | "yearly";
}

interface FinancialMetric {
  label: string;
  value: number;
  change: number;
  period: string;
  format: "currency" | "percentage" | "number";
}

const transactions: Transaction[] = [
  {
    id: "1",
    date: "2024-01-15",
    type: "income",
    category: "Sales",
    description: "Payment from Organic Food GmbH - ORD-2024-001",
    amount: 280000,
    account: "Business Checking",
    reference: "INV-2024-001",
    status: "completed",
  },
  {
    id: "2",
    date: "2024-01-15",
    type: "expense",
    category: "Raw Materials",
    description: "Coconut purchase from local suppliers",
    amount: 125000,
    account: "Business Checking",
    reference: "PO-2024-015",
    status: "completed",
  },
  {
    id: "3",
    date: "2024-01-14",
    type: "income",
    category: "Sales",
    description: "Payment from Health Store Canada - ORD-2024-002",
    amount: 120000,
    account: "Business Checking",
    reference: "INV-2024-002",
    status: "pending",
  },
  {
    id: "4",
    date: "2024-01-14",
    type: "expense",
    category: "Operations",
    description: "Monthly electricity bill",
    amount: 450000,
    account: "Business Checking",
    reference: "UTIL-2024-001",
    status: "completed",
  },
  {
    id: "5",
    date: "2024-01-13",
    type: "expense",
    category: "Payroll",
    description: "Employee salaries - January 2024",
    amount: 385000,
    account: "Payroll Account",
    reference: "PAY-2024-001",
    status: "completed",
  },
];

const accounts: Account[] = [
  {
    id: "1",
    name: "Business Checking",
    type: "checking",
    balance: 1250000,
    currency: "LKR",
    bank: "Commercial Bank of Ceylon",
    accountNumber: "****6789",
  },
  {
    id: "2",
    name: "Savings Account",
    type: "savings",
    balance: 850000,
    currency: "LKR",
    bank: "Bank of Ceylon",
    accountNumber: "****1234",
  },
  {
    id: "3",
    name: "Payroll Account",
    type: "checking",
    balance: 425000,
    currency: "LKR",
    bank: "Commercial Bank of Ceylon",
    accountNumber: "****5678",
  },
  {
    id: "4",
    name: "Export Revenue USD",
    type: "checking",
    balance: 15500,
    currency: "USD",
    bank: "Commercial Bank of Ceylon",
    accountNumber: "****9012",
  },
];

const budgets: Budget[] = [
  {
    category: "Raw Materials",
    allocated: 800000,
    spent: 650000,
    remaining: 150000,
    period: "monthly",
  },
  {
    category: "Payroll",
    allocated: 400000,
    spent: 385000,
    remaining: 15000,
    period: "monthly",
  },
  {
    category: "Operations",
    allocated: 200000,
    spent: 165000,
    remaining: 35000,
    period: "monthly",
  },
  {
    category: "Marketing",
    allocated: 100000,
    spent: 75000,
    remaining: 25000,
    period: "monthly",
  },
  {
    category: "Equipment",
    allocated: 300000,
    spent: 125000,
    remaining: 175000,
    period: "quarterly",
  },
];

const financialMetrics: FinancialMetric[] = [
  {
    label: "Total Revenue",
    value: 2450000,
    change: 18.7,
    period: "this month",
    format: "currency",
  },
  {
    label: "Total Expenses",
    value: 1850000,
    change: 12.3,
    period: "this month",
    format: "currency",
  },
  {
    label: "Net Profit",
    value: 600000,
    change: 24.5,
    period: "this month",
    format: "currency",
  },
  {
    label: "Profit Margin",
    value: 24.5,
    change: 3.2,
    period: "this month",
    format: "percentage",
  },
  {
    label: "Cash Flow",
    value: 325000,
    change: -5.8,
    period: "this month",
    format: "currency",
  },
  {
    label: "ROI",
    value: 15.8,
    change: 2.1,
    period: "this quarter",
    format: "percentage",
  },
];

export default function Finance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

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

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedType === "All" || transaction.type === selectedType;
    const matchesCategory =
      selectedCategory === "All" || transaction.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

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

  const getTypeColor = (type: string) => {
    return type === "income" ? "text-green-600" : "text-red-600";
  };

  const totalBalance = accounts.reduce((sum, account) => {
    if (account.currency === "LKR") return sum + account.balance;
    return sum + account.balance * 320; // Assuming USD to LKR conversion
  }, 0);

  const monthlyIncome = transactions
    .filter((t) => t.type === "income" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = transactions
    .filter((t) => t.type === "expense" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingPayments = transactions.filter(
    (t) => t.status === "pending"
  ).length;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Finance Management
          </h1>
          <p className="text-gray-600">
            Monitor financial performance, manage budgets, and track cash flow
          </p>
        </div>
        <div className="flex gap-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition">
            <Plus size={16} />
            Add Transaction
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
            <Bot size={16} />
            Financial AI
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* AI Financial Assistant */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-500 text-white p-2 rounded-lg">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-green-900">
              AI Financial Insights
            </h3>
            <p className="text-green-700 text-sm">
              Cash flow trending positive with 24.5% profit margin increase.
              Recommend setting aside 20% for Q2 expansion. Expense optimization
              suggests renegotiating supplier contracts could save 8% on raw
              materials.
            </p>
          </div>
          <button className="ml-auto bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition">
            View Analysis
          </button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Balance</p>
              <p className="text-2xl font-bold text-blue-600">
                LKR {totalBalance.toLocaleString()}
              </p>
              <p className="text-sm text-blue-600 flex items-center gap-1">
                <TrendingUp size={14} />
                +12.5% from last month
              </p>
            </div>
            <Banknote className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Income</p>
              <p className="text-2xl font-bold text-green-600">
                LKR {monthlyIncome.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 flex items-center gap-1">
                <TrendingUp size={14} />
                +18.7% from last month
              </p>
            </div>
            <TrendingUp className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                LKR {monthlyExpenses.toLocaleString()}
              </p>
              <p className="text-sm text-red-600 flex items-center gap-1">
                <TrendingUp size={14} />
                +12.3% from last month
              </p>
            </div>
            <TrendingDown className="text-red-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-yellow-600">
                {pendingPayments}
              </p>
              <p className="text-sm text-gray-600">Requires attention</p>
            </div>
            <Clock className="text-yellow-500" size={24} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Metrics */}
          <div className="bg-white rounded-lg shadow border">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <BarChart3 size={20} />
                Key Financial Metrics
              </h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {financialMetrics.map((metric, idx) => (
                  <div
                    key={idx}
                    className="text-center p-3 bg-gray-50 rounded-lg"
                  >
                    <p className="text-sm text-gray-600">{metric.label}</p>
                    <p className="text-xl font-bold text-gray-900">
                      {metric.format === "currency"
                        ? `LKR ${metric.value.toLocaleString()}`
                        : metric.format === "percentage"
                        ? `${metric.value}%`
                        : metric.value.toLocaleString()}
                    </p>
                    <p
                      className={`text-sm ${
                        metric.change >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {metric.change >= 0 ? "+" : ""}
                      {metric.change}% {metric.period}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-lg shadow border">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Receipt size={20} />
                Recent Transactions
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
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {types.map((type) => (
                      <option key={type} value={type}>
                        {type === "All"
                          ? "All Types"
                          : type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="border rounded-lg p-3 hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">
                            {transaction.description}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                              transaction.status
                            )}`}
                          >
                            {transaction.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>
                            {transaction.category} • {transaction.account}
                          </p>
                          <p className="flex items-center gap-2">
                            <Calendar size={12} />
                            {transaction.date}
                            {transaction.reference && (
                              <>
                                • <FileText size={12} /> {transaction.reference}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-lg font-bold ${getTypeColor(
                            transaction.type
                          )}`}
                        >
                          {transaction.type === "income" ? "+" : "-"}LKR{" "}
                          {transaction.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Accounts Overview */}
          <div className="bg-white rounded-lg shadow border">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <CreditCard size={20} />
                Accounts
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {accounts.map((account) => (
                <div key={account.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{account.name}</h4>
                      <p className="text-xs text-gray-500">
                        {account.bank} • {account.accountNumber}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        account.type === "checking"
                          ? "bg-blue-100 text-blue-600"
                          : account.type === "savings"
                          ? "bg-green-100 text-green-600"
                          : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      {account.type}
                    </span>
                  </div>
                  <p className="font-bold text-lg">
                    {account.currency} {account.balance.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Overview */}
          <div className="bg-white rounded-lg shadow border">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Target size={20} />
                Budget Overview
              </h2>
            </div>
            <div className="p-4 space-y-4">
              {budgets.map((budget, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-sm">{budget.category}</h4>
                    <span className="text-xs text-gray-500 capitalize">
                      {budget.period}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Spent: LKR {budget.spent.toLocaleString()}</span>
                      <span>
                        Budget: LKR {budget.allocated.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          budget.spent / budget.allocated > 0.9
                            ? "bg-red-500"
                            : budget.spent / budget.allocated > 0.7
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            (budget.spent / budget.allocated) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>
                        {Math.round((budget.spent / budget.allocated) * 100)}%
                        used
                      </span>
                      <span>
                        LKR {budget.remaining.toLocaleString()} remaining
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow border">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-2">
              <button className="w-full bg-green-600 text-white py-2 px-3 rounded hover:bg-green-700 transition text-sm">
                Record Payment
              </button>
              <button className="w-full bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition text-sm">
                Generate Invoice
              </button>
              <button className="w-full bg-purple-600 text-white py-2 px-3 rounded hover:bg-purple-700 transition text-sm">
                Financial Report
              </button>
              <button className="w-full bg-yellow-600 text-white py-2 px-3 rounded hover:bg-yellow-700 transition text-sm">
                Budget Planning
              </button>
              <button className="w-full bg-indigo-600 text-white py-2 px-3 rounded hover:bg-indigo-700 transition text-sm">
                Tax Calculator
              </button>
            </div>
          </div>

          {/* AI Finance Suggestions */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
            <div className="p-4 border-b border-emerald-200">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Bot className="text-emerald-600" size={20} />
                AI Finance Assistant
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-white rounded-lg p-3 border">
                <h4 className="font-medium text-sm mb-1">
                  Cash Flow Optimization
                </h4>
                <p className="text-xs text-gray-600">
                  Consider delaying non-critical expenses by 10 days to improve
                  cash flow
                </p>
                <button className="mt-2 text-xs bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700 transition">
                  View Details
                </button>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <h4 className="font-medium text-sm mb-1">
                  Investment Opportunity
                </h4>
                <p className="text-xs text-gray-600">
                  Surplus cash of LKR 500K could earn 8% in short-term deposits
                </p>
                <button className="mt-2 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition">
                  Calculate Returns
                </button>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <h4 className="font-medium text-sm mb-1">Tax Planning</h4>
                <p className="text-xs text-gray-600">
                  Q1 tax liability estimated at LKR 185K - plan accordingly
                </p>
                <button className="mt-2 text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 transition">
                  Plan Taxes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
