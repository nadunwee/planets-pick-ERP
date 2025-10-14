import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  Factory,
  Activity,
  Briefcase,
  AlertTriangle,
  Target,
  UserCheck,
} from "lucide-react";
import DashboardChatbot from "@/components/DashboardChatbot";

interface DashboardMetrics {
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
  financial: {
    netWorth: number;
    totalAssets: number;
    totalLiabilities: number;
    revenue: number;
    expenses: number;
    netProfit: number;
    revenueChange: number;
    expenseChange: number;
    profitChange: number;
  };
  employees: {
    total: number;
    active: number;
    onLeave: number;
    totalPayroll: number;
    change: number;
  };
  inventory: {
    totalValue: number;
    totalItems: number;
    lowStockItems: number;
    stockHealthPercentage: string;
  };
  production: {
    totalBatches: number;
    completedBatches: number;
    activeBatches: number;
    totalYield: number;
    targetYield: number;
    yieldEfficiency: string;
    change: number;
  };
  sales: {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    totalSales: number;
    averageOrderValue: string;
    orderChange: number;
    salesChange: number;
  };
  customers: {
    total: number;
    new: number;
  };
  users: {
    total: number;
    pending: number;
  };
  trends: {
    revenue: Array<{ month: string; value: number }>;
  };
}

const API_BASE = "http://localhost:4000/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30days");
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const username = localStorage.getItem("name");
    if (!username) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<DashboardMetrics>(
        `${API_BASE}/dashboard/metrics`,
        {
          params: { period },
        }
      );
      setMetrics(response.data);
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-LK").format(value);
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "30days":
        return "Last 30 Days";
      case "6months":
        return "Last 6 Months";
      case "1year":
        return "Last 1 Year";
      case "2years":
        return "Last 2 Years";
      case "5years":
        return "Last 5 Years";
      default:
        return period;
    }
  };

  const renderChangeIndicator = (change: number) => {
    const isPositive = change >= 0;
    return (
      <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        <span>{isPositive ? "+" : ""}{change.toFixed(1)}%</span>
      </div>
    );
  };

  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    color,
    subtitle,
  }: {
    title: string;
    value: string;
    change?: number;
    icon: any;
    color: string;
    subtitle?: string;
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        {change !== undefined && renderChangeIndicator(change)}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  const SectionCard = ({
    title,
    icon: Icon,
    color,
    children,
  }: {
    title: string;
    icon: any;
    color: string;
    children: React.ReactNode;
  }) => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className={`${color} px-6 py-4 flex items-center gap-3`}>
        <Icon size={24} className="text-white" />
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <AlertTriangle size={48} className="mx-auto mb-4" />
          <p className="text-lg font-semibold">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <>
      <header className="hidden lg:flex justify-between h-16 items-center bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800 shadow-lg px-6">
        <h1 className="text-xl font-bold text-white">
          Business Intelligence Dashboard
        </h1>
        <div className="text-right">
          <span className="font-semibold text-white">
            {localStorage.getItem("name") || "Admin User"}
          </span>
          <p className="text-sm text-blue-100">Executive Overview</p>
        </div>
      </header>

      <div className="bg-gray-50 min-h-screen p-6 space-y-6">
        {/* Period Selector */}
        <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Performance Overview
            </h2>
            <p className="text-sm text-gray-600">
              Viewing data for: {getPeriodLabel(period)}
            </p>
          </div>
          <div className="flex gap-2">
            {["30days", "6months", "1year", "2years", "5years"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  period === p
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {p === "30days" && "30D"}
                {p === "6months" && "6M"}
                {p === "1year" && "1Y"}
                {p === "2years" && "2Y"}
                {p === "5years" && "5Y"}
              </button>
            ))}
          </div>
        </div>

        {/* Key Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Net Worth"
            value={formatCurrency(metrics.financial.netWorth)}
            icon={Briefcase}
            color="bg-gradient-to-br from-purple-600 to-purple-700"
            subtitle={`Assets: ${formatCurrency(metrics.financial.totalAssets)}`}
          />
          <MetricCard
            title="Revenue"
            value={formatCurrency(metrics.financial.revenue)}
            change={metrics.financial.revenueChange}
            icon={DollarSign}
            color="bg-gradient-to-br from-green-600 to-green-700"
          />
          <MetricCard
            title="Net Profit"
            value={formatCurrency(metrics.financial.netProfit)}
            change={metrics.financial.profitChange}
            icon={TrendingUp}
            color="bg-gradient-to-br from-blue-600 to-blue-700"
          />
          <MetricCard
            title="Expenses"
            value={formatCurrency(metrics.financial.expenses)}
            change={metrics.financial.expenseChange}
            icon={Activity}
            color="bg-gradient-to-br from-orange-600 to-orange-700"
          />
        </div>

        {/* Operations Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Active Employees"
            value={formatNumber(metrics.employees.active)}
            change={metrics.employees.change}
            icon={Users}
            color="bg-gradient-to-br from-indigo-600 to-indigo-700"
            subtitle={`${metrics.employees.onLeave} on leave`}
          />
          <MetricCard
            title="Inventory Value"
            value={formatCurrency(metrics.inventory.totalValue)}
            icon={Package}
            color="bg-gradient-to-br from-teal-600 to-teal-700"
            subtitle={`${metrics.inventory.totalItems} items total`}
          />
          <MetricCard
            title="Total Sales"
            value={formatCurrency(metrics.sales.totalSales)}
            change={metrics.sales.salesChange}
            icon={ShoppingCart}
            color="bg-gradient-to-br from-pink-600 to-pink-700"
            subtitle={`${metrics.sales.totalOrders} orders`}
          />
          <MetricCard
            title="Production Efficiency"
            value={`${metrics.production.yieldEfficiency}%`}
            change={metrics.production.change}
            icon={Factory}
            color="bg-gradient-to-br from-yellow-600 to-yellow-700"
            subtitle={`${metrics.production.completedBatches} batches completed`}
          />
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Financial Overview */}
          <SectionCard
            title="Financial Health"
            icon={DollarSign}
            color="bg-gradient-to-r from-green-600 to-green-700"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600 font-medium">Total Assets</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(metrics.financial.totalAssets)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600 font-medium">
                  Total Liabilities
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(metrics.financial.totalLiabilities)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b bg-green-50 p-3 rounded-lg">
                <span className="text-gray-900 font-semibold">Net Worth</span>
                <span className="text-xl font-bold text-green-700">
                  {formatCurrency(metrics.financial.netWorth)}
                </span>
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Profit Margin</span>
                  <span className="font-semibold text-gray-900">
                    {metrics.financial.revenue > 0
                      ? (
                          (metrics.financial.netProfit /
                            metrics.financial.revenue) *
                          100
                        ).toFixed(2)
                      : "0.00"}
                    %
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Employee Overview */}
          <SectionCard
            title="Workforce Management"
            icon={Users}
            color="bg-gradient-to-r from-indigo-600 to-indigo-700"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600 font-medium">
                  Active Employees
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {formatNumber(metrics.employees.active)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600 font-medium">On Leave</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatNumber(metrics.employees.onLeave)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b bg-indigo-50 p-3 rounded-lg">
                <span className="text-gray-900 font-semibold">
                  Monthly Payroll
                </span>
                <span className="text-xl font-bold text-indigo-700">
                  {formatCurrency(metrics.employees.totalPayroll)}
                </span>
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">System Users</span>
                  <span className="font-semibold text-gray-900">
                    {formatNumber(metrics.users.total)}
                  </span>
                </div>
                {metrics.users.pending > 0 && (
                  <div className="flex items-center gap-2 text-sm text-orange-600 mt-2">
                    <AlertTriangle size={14} />
                    <span>{metrics.users.pending} pending approvals</span>
                  </div>
                )}
              </div>
            </div>
          </SectionCard>

          {/* Inventory Status */}
          <SectionCard
            title="Inventory Management"
            icon={Package}
            color="bg-gradient-to-r from-teal-600 to-teal-700"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600 font-medium">Total Items</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatNumber(metrics.inventory.totalItems)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600 font-medium">
                  Low Stock Items
                </span>
                <span
                  className={`text-lg font-bold ${
                    metrics.inventory.lowStockItems > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {formatNumber(metrics.inventory.lowStockItems)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b bg-teal-50 p-3 rounded-lg">
                <span className="text-gray-900 font-semibold">
                  Total Value
                </span>
                <span className="text-xl font-bold text-teal-700">
                  {formatCurrency(metrics.inventory.totalValue)}
                </span>
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Stock Health</span>
                  <span className="font-semibold text-gray-900">
                    {metrics.inventory.stockHealthPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-teal-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${metrics.inventory.stockHealthPercentage}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Production Overview */}
          <SectionCard
            title="Production Performance"
            icon={Factory}
            color="bg-gradient-to-r from-yellow-600 to-yellow-700"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600 font-medium">
                  Total Batches
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {formatNumber(metrics.production.totalBatches)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600 font-medium">Completed</span>
                <span className="text-lg font-bold text-green-600">
                  {formatNumber(metrics.production.completedBatches)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600 font-medium">Active</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatNumber(metrics.production.activeBatches)}
                </span>
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Yield Efficiency</span>
                  <span className="font-semibold text-gray-900">
                    {metrics.production.yieldEfficiency}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(parseFloat(metrics.production.yieldEfficiency), 100)}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>
                    Actual: {formatNumber(metrics.production.totalYield)}
                  </span>
                  <span>
                    Target: {formatNumber(metrics.production.targetYield)}
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Sales Overview */}
          <SectionCard
            title="Sales Performance"
            icon={ShoppingCart}
            color="bg-gradient-to-r from-pink-600 to-pink-700"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600 font-medium">Total Orders</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatNumber(metrics.sales.totalOrders)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600 font-medium">Completed</span>
                <span className="text-lg font-bold text-green-600">
                  {formatNumber(metrics.sales.completedOrders)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600 font-medium">Pending</span>
                <span className="text-lg font-bold text-orange-600">
                  {formatNumber(metrics.sales.pendingOrders)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b bg-pink-50 p-3 rounded-lg">
                <span className="text-gray-900 font-semibold">
                  Total Sales
                </span>
                <span className="text-xl font-bold text-pink-700">
                  {formatCurrency(metrics.sales.totalSales)}
                </span>
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Average Order Value</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(parseFloat(metrics.sales.averageOrderValue))}
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Customer Metrics */}
          <SectionCard
            title="Customer Base"
            icon={UserCheck}
            color="bg-gradient-to-r from-cyan-600 to-cyan-700"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600 font-medium">
                  Total Customers
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {formatNumber(metrics.customers.total)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b bg-cyan-50 p-3 rounded-lg">
                <span className="text-gray-900 font-semibold">
                  New Customers ({getPeriodLabel(period)})
                </span>
                <span className="text-xl font-bold text-cyan-700">
                  {formatNumber(metrics.customers.new)}
                </span>
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Growth Rate</span>
                  <span className="font-semibold text-gray-900">
                    {metrics.customers.total > 0
                      ? (
                          (metrics.customers.new / metrics.customers.total) *
                          100
                        ).toFixed(2)
                      : "0.00"}
                    %
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Growth Indicator Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target size={20} className="text-blue-600" />
            Growth Summary ({getPeriodLabel(period)})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Revenue Growth</p>
              {renderChangeIndicator(metrics.financial.revenueChange)}
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Profit Growth</p>
              {renderChangeIndicator(metrics.financial.profitChange)}
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Employee Growth</p>
              {renderChangeIndicator(metrics.employees.change)}
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Sales Growth</p>
              {renderChangeIndicator(metrics.sales.salesChange)}
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Production Growth</p>
              {renderChangeIndicator(metrics.production.change)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Dashboard Chatbot */}
      {metrics && <DashboardChatbot metrics={metrics} period={period} />}
    </>
  );
}
