import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import {
  ShoppingCart,
  Search,
  Plus,
  Filter,
  DollarSign,
  TrendingUp,
  Package,
  Clock,
  AlertTriangle,
  Globe,
  User,
  MapPin,
  Phone,
  Mail,
  Edit,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  Truck,
  FileText,
  CreditCard,
  Calendar,
  History,
  MessageSquare,
} from "lucide-react";
import CustomerFormModal from "@/components/order-sales/CustomerFormModal";
import OrderFormModal from "@/components/order-sales/OrderFormModal";
import {
  getAllOrders,
  deleteOrder,
  createOrder,
  updateOrder,
  type Order as OrderType,
  type OrderPayload,
} from "@/components/services/orderService";
import api from "@/components/services/api";

type CustomerCreateResponse = {
  message?: string;
  customer?: unknown;
};

export default function OrdersSales() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [dateRange, setDateRange] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [approvalFilter, setApprovalFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"detailed" | "compact">("detailed");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [userLevel, setUserLevel] = useState<string | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderType | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const department = localStorage.getItem("department");

  const getOrderIdentifier = (order: OrderType) =>
    order._id ?? order.id ?? order.orderId;
  const formatCurrency = (value?: number) =>
    typeof value === "number" ? value.toLocaleString() : "0";
  const formatDate = (value?: string | Date) =>
    value ? new Date(value).toLocaleDateString() : "N/A";
  const formatDateTime = (value?: string | Date) =>
    value ? new Date(value).toLocaleString() : "N/A";

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrders();
      // Transform the data to match the expected format
      const transformedOrders = data.map((order: any) => ({
        ...order,
        id: order._id,
        orderNumber: order.orderId,
        orderDate: order.orderedOn,
        expectedDelivery: order.expectedDate,
        items: order.items.map((item: any) => ({
          ...item,
          productName: item.name || item.productName,
        })),
      }));
      setOrders(transformedOrders);
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      // For demo purposes, load some sample data if API fails
      const sampleOrders: OrderType[] = [
        {
          _id: "sample1",
          orderId: "ORD-2024-SAMPLE-001",
          orderedOn: "2024-01-15",
          expectedDate: "2024-01-30",
          priority: "high",
          status: "pending",
          customer: {
            name: "Sample Customer",
            email: "sample@example.com",
            phone: "+1234567890",
            company: "Sample Company Ltd",
            address: "123 Sample Street",
            country: "Sample Country",
          },
          items: [
            {
              productName: "Sample Product",
              name: "Sample Product",
              quantity: 10,
              unit: "pieces",
              unitPrice: 100,
              totalPrice: 1000,
              notes: "Sample product for demo",
            },
          ],
          totalAmount: 1000,
          paymentStatus: "pending",
          paymentMethod: "bank-transfer",
          shippingMethod: "standard",
          notes: "This is sample data since the database is not available",
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-15T10:00:00Z",
        },
      ];
      setOrders(sampleOrders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      await deleteOrder(orderId);
      console.log("✅ Order deleted successfully");
      message.success({
        content: "🗑️ Order deleted successfully",
        duration: 2,
      });
      // Refresh the orders list
      fetchOrders();
    } catch (error) {
      console.error("❌ Error deleting order:", error);
      message.error("Failed to delete order. Please try again.");
    }
  };

  const handleEditOrder = (order: OrderType) => {
    setEditingOrder(order);
    setShowOrderModal(true);
  };

  const handleCreateOrder = async (data: OrderPayload) => {
    try {
      if (editingOrder) {
        // Update existing order
        await updateOrder(editingOrder._id || editingOrder.id!, data);
        console.log("✅ Order updated successfully");
        message.success({
          content: `✏️ Order "${data.orderId}" updated successfully`,
          duration: 3,
        });
      } else {
        // Create new order
        await createOrder(data);
        console.log("✅ Order created successfully");
        // Show notification for new order
        message.success({
          content: (
            <div>
              <strong>✅ New Order Created!</strong>
              <br />
              <span className="text-sm">
                Order #{data.orderId}
                <br />
                Total: LKR {data.totalAmount?.toLocaleString() || "0"} •{" "}
                {data.items.length} item(s)
              </span>
            </div>
          ),
          duration: 5,
          style: {
            marginTop: "20px",
          },
        });
      }
      // Refresh the orders list after creation/update
      fetchOrders();
      setEditingOrder(null); // Reset editing state
    } catch (error) {
      console.error("❌ Error saving order:", error);
      message.error("Failed to save order. Please try again.");
    }
  };

  const handleProcessOrder = async (order: OrderType) => {
    if (
      !window.confirm(
        `Are you sure you want to process order ${
          order.orderNumber || order.orderId
        }?`
      )
    )
      return;

    try {
      // Update the order status to "processing"
      const updateData: Partial<OrderPayload> = {
        status: "processing",
      };

      await updateOrder(order._id || order.id!, updateData);
      console.log("✅ Order marked as processing");

      // Show notification
      message.success({
        content: `🚀 Order ${
          order.orderNumber || order.orderId
        } is now being processed`,
        duration: 3,
      });

      // Refresh the orders list to show updated status
      fetchOrders();
    } catch (error) {
      console.error("❌ Error processing order:", error);
      message.error("Failed to process order. Please try again.");
    }
  };

  useEffect(() => {
    const department = localStorage.getItem("department") || "{}";
    setUserLevel(department);
  }, []);

  const handleCreateCustomer = async (data: any) => {
    try {
      const { data: result } = await api.post<CustomerCreateResponse>(
        "/customers/create",
        data
      );
      message.success(result?.message || "Customer created successfully");
      // Optionally refresh data that depends on customers
    } catch (error: any) {
      console.error("❌ Error creating customer:", error);
      const status = error?.response?.status;
      const messageText =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to create customer";
      message.error(messageText);
      if (status === 401) {
        navigate("/login");
      }
    }
  };

  const downloadReportFile = async (downloadUrl: string, filename: string) => {
    const endpoint = downloadUrl.replace(/^\/api/, "");
    const response = await api.get<Blob>(endpoint, { responseType: "blob" });
    const blobUrl = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  };

  const exportOrderReportPDF = async () => {
    try {
      setIsExporting(true);
      const { data: result } = await api.post<{
        downloadUrl?: string;
        message?: string;
      }>("/reports/generate/order-report");

      if (!result?.downloadUrl) {
        throw new Error(result?.message || "Report download link missing");
      }

      await downloadReportFile(result.downloadUrl, "order-report.pdf");

      message.success("Order report exported successfully");
    } catch (err: any) {
      console.error(err);
      const status = err?.response?.status;
      const messageText =
        err?.response?.data?.error || err?.message || "Failed to export report";
      message.error(messageText);
      if (status === 401) {
        navigate("/login");
      }
    } finally {
      setIsExporting(false);
    }
  };

  const statuses = [
    "All",
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];
  const priorities = ["All", "low", "medium", "high", "urgent"];
  const paymentStatuses = ["All", "paid", "unpaid", "partial", "overdue"];
  const approvalStatuses = ["All", "pending", "approved", "rejected"];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "All" || order.status === selectedStatus;
    const matchesPriority =
      selectedPriority === "All" || order.priority === selectedPriority;
    const matchesPayment =
      paymentFilter === "All" || order.paymentStatus === paymentFilter;
    const matchesApproval =
      approvalFilter === "All" || order.approvalStatus === approvalFilter;
    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesPayment &&
      matchesApproval
    );
  });

  console.log(filteredOrders);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "confirmed":
        return "text-blue-600 bg-blue-100";
      case "processing":
        return "text-purple-600 bg-purple-100";
      case "shipped":
        return "text-indigo-600 bg-indigo-100";
      case "delivered":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "text-gray-600 bg-gray-100";
      case "medium":
        return "text-blue-600 bg-blue-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "urgent":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-100";
      case "partially-paid":
      case "partial":
        return "text-yellow-600 bg-yellow-100";
      case "pending":
      case "unpaid":
        return "text-blue-600 bg-blue-100";
      case "overdue":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const paidOrders = orders.filter((o) => o.paymentStatus === "paid").length;
  const shippedOrders = orders.filter(
    (o) => o.status === "shipped" || o.status === "delivered"
  ).length;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders & Sales</h1>
          <p className="text-gray-600">
            Manage orders, track sales, and analyze performance
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingOrder(null);
              setShowOrderModal(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
          >
            <Plus size={16} />
            New Order
          </button>
          {userLevel === "admin" && (
            <button
              onClick={() => setShowCustomerModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
            >
              <Plus size={16} />
              New Customer
            </button>
          )}
          <button
            onClick={exportOrderReportPDF}
            disabled={isExporting}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download size={16} />
                Export Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Sales Assistant */}
      {/* <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-500 text-white p-2 rounded-lg">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-green-900">AI Sales Insights</h3>
            <p className="text-green-700 text-sm">
              Sales trending 22% above last month. German market showing strong
              demand for VCO. Recommend increasing production capacity by 15%
              for Q2. Optimal pricing strategy suggests 5% increase for premium
              products.
            </p>
          </div>
          <button className="ml-auto bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition">
            View Analytics
          </button>
        </div>
      </div> */}

      {/* Sales Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                LKR {totalRevenue.toLocaleString()}
              </p>
              {/* <p className="text-sm text-green-600 flex items-center gap-1">
                <TrendingUp size={14} />
                +18.7% from last month
              </p> */}
            </div>
            <DollarSign className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
              {/* <p className="text-sm text-blue-600 flex items-center gap-1">
                <TrendingUp size={14} />
                +15.5% from last week
              </p> */}
            </div>
            <ShoppingCart className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-purple-600">
                LKR {Math.round(averageOrderValue).toLocaleString()}
              </p>
              {/* <p className="text-sm text-purple-600 flex items-center gap-1">
                <TrendingUp size={14} />
                +8.2% from last month
              </p> */}
            </div>
            <TrendingUp className="text-purple-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-yellow-600">
                {pendingOrders}
              </p>
              <p className="text-sm text-gray-600">Requires attention</p>
            </div>
            <AlertTriangle className="text-yellow-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <p className="text-2xl font-bold text-green-600">
                {paidOrders}/{totalOrders}
              </p>
              <p className="text-sm text-gray-600">Paid orders</p>
            </div>
            <CreditCard className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Shipped/Delivered</p>
              <p className="text-2xl font-bold text-indigo-600">
                {shippedOrders}
              </p>
              <p className="text-sm text-gray-600">Fulfilled orders</p>
            </div>
            <Truck className="text-indigo-500" size={24} />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search orders, customers, or companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="text-gray-400" size={16} />

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "All"
                    ? "All Status"
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority === "All"
                    ? "All Priority"
                    : priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              {paymentStatuses.map((status) => (
                <option key={status} value={status}>
                  {status === "All"
                    ? "All Payment"
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              {approvalStatuses.map((status) => (
                <option key={status} value={status}>
                  {status === "All"
                    ? "All Approval"
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>

            {/* View Mode Toggle */}
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => setViewMode("detailed")}
                className={`px-3 py-2 rounded-lg text-sm transition ${
                  viewMode === "detailed"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Detailed
              </button>
              <button
                onClick={() => setViewMode("compact")}
                className={`px-3 py-2 rounded-lg text-sm transition ${
                  viewMode === "compact"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Compact
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="bg-white rounded-lg shadow border p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id || order._id}
              className="bg-white rounded-lg shadow border"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">
                          {order.orderNumber || order.orderId}
                        </h3>
                        {order.trackingNumber && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                            <Truck size={10} />
                            Tracking: {order.trackingNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Calendar size={12} />
                        Ordered on{" "}
                        {formatDate(order.orderDate || order.orderedOn)} •
                        Expected:{" "}
                        {formatDate(
                          order.expectedDelivery || order.expectedDate
                        )}
                      </p>
                      {order.actualDelivery && (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle size={12} />
                          Delivered: {formatDate(order.actualDelivery)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(
                        order.priority
                      )}`}
                    >
                      {order.priority} priority
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    {order.approvalStatus && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          order.approvalStatus === "approved"
                            ? "bg-green-100 text-green-700"
                            : order.approvalStatus === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.approvalStatus === "approved" && (
                          <CheckCircle size={10} className="inline mr-1" />
                        )}
                        {order.approvalStatus === "rejected" && (
                          <XCircle size={10} className="inline mr-1" />
                        )}
                        {order.approvalStatus}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Customer Information */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <User size={16} />
                      Customer Details
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">
                        {order.customer?.name || "N/A"}
                      </p>
                      {order.customer?.company && (
                        <p className="text-gray-600">
                          {order.customer?.company || "N/A"}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={12} />
                        {order.customer?.email || "N/A"}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone size={12} />
                        {order.customer?.phone || "N/A"}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={12} />
                        {order.customer?.address || "N/A"}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Globe size={12} />
                        {order.customer?.country || "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Package size={16} />
                      Order Items
                    </h4>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 rounded p-2 text-sm"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">
                                {item.productName || item.name}
                              </p>
                              <p className="text-gray-600">
                                {item.quantity} {item.unit} × LKR{" "}
                                {item.unitPrice.toLocaleString()}
                              </p>
                              {item.specifications && (
                                <p className="text-xs text-gray-500">
                                  {item.specifications}
                                </p>
                              )}
                              {item.notes && (
                                <p className="text-xs text-gray-500">
                                  {item.notes}
                                </p>
                              )}
                            </div>
                            <p className="font-medium">
                              LKR {item.totalPrice.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment & Shipping */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <DollarSign size={16} />
                      Financial Details
                    </h4>
                    <div className="space-y-2 text-sm bg-gray-50 p-3 rounded">
                      {typeof order.subtotal === "number" && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span>LKR {formatCurrency(order.subtotal)}</span>
                        </div>
                      )}
                      {(order.discount ?? 0) > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount ({order.discountType}):</span>
                          <span>-LKR {formatCurrency(order.discount)}</span>
                        </div>
                      )}
                      {(order.tax ?? 0) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Tax ({order.taxRate}%):
                          </span>
                          <span>LKR {formatCurrency(order.tax)}</span>
                        </div>
                      )}
                      {(order.shippingCost ?? 0) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping:</span>
                          <span>LKR {formatCurrency(order.shippingCost)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600 font-medium">
                          Total Amount:
                        </span>
                        <span className="font-bold text-lg text-green-600">
                          LKR {order.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Status:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="capitalize">
                          {order.paymentMethod?.replace("-", " ") || "N/A"}
                        </span>
                      </div>
                      {(order.paymentRecords?.length ?? 0) > 0 && (
                        <div className="border-t pt-2 mt-2">
                          <p className="text-xs text-gray-600 font-medium mb-1">
                            Payment History:
                          </p>
                          {order.paymentRecords?.map((record, idx) => (
                            <div
                              key={idx}
                              className="text-xs text-gray-600 flex justify-between"
                            >
                              <span>{formatDate(record?.date)}</span>
                              <span>LKR {formatCurrency(record?.amount)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <h4 className="font-medium mb-2 flex items-center gap-2 mt-4">
                      <Truck size={16} />
                      Shipping Info
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping:</span>
                        <span className="capitalize">
                          {order.shippingMethod || "N/A"}
                        </span>
                      </div>
                      {order.trackingNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tracking:</span>
                          <span className="font-mono text-xs">
                            {order.trackingNumber}
                          </span>
                        </div>
                      )}
                      {order.shippingAddress && (
                        <div className="bg-gray-50 p-2 rounded text-xs">
                          <p className="font-medium mb-1">Shipping Address:</p>
                          <p>{order.shippingAddress.street || ""}</p>
                          <p>
                            {[
                              order.shippingAddress.city,
                              order.shippingAddress.state,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                          <p>
                            {[
                              order.shippingAddress.zipCode,
                              order.shippingAddress.country,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </div>
                      )}
                      {order.actualDelivery && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivered:</span>
                          <span className="text-green-600">
                            {formatDate(order.actualDelivery)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Timeline/History */}
                {(order.orderHistory?.length ?? 0) > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <History size={16} />
                      Order Timeline
                    </h4>
                    <div className="space-y-2">
                      {order.orderHistory?.map((event, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 text-sm"
                        >
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-medium capitalize">
                                  {event.status}
                                </span>
                                {event.updatedBy && (
                                  <span className="text-gray-600 ml-2">
                                    by {event.updatedBy}
                                  </span>
                                )}
                              </div>
                              <span className="text-gray-500 text-xs">
                                {formatDateTime(event?.timestamp)}
                              </span>
                            </div>
                            {event.notes && (
                              <p className="text-gray-600 text-xs mt-1">
                                {event.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Approval Information */}
                {order.approvalStatus &&
                  order.approvalStatus !== "pending" &&
                  order.approvedBy && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-blue-800 flex items-center gap-2">
                        <CheckCircle size={14} />
                        <strong>Approval:</strong> {order.approvalStatus} by{" "}
                        {order.approvedBy}
                        {order.approvalDate &&
                          ` on ${new Date(
                            order.approvalDate
                          ).toLocaleDateString()}`}
                      </p>
                    </div>
                  )}

                {order.notes && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded flex items-start gap-2">
                    <MessageSquare
                      size={14}
                      className="text-yellow-800 mt-0.5"
                    />
                    <p className="text-sm text-yellow-800">
                      <strong>Notes:</strong> {order.notes}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={14} />
                    Last updated:{" "}
                    {order.updatedAt
                      ? new Date(order.updatedAt).toLocaleString()
                      : "N/A"}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        setExpandedOrder((prev) =>
                          prev === getOrderIdentifier(order)
                            ? null
                            : getOrderIdentifier(order)
                        )
                      }
                      className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition flex items-center gap-1"
                      title="View Details"
                    >
                      <FileText size={14} />
                      {expandedOrder === getOrderIdentifier(order)
                        ? "Hide"
                        : "Details"}
                    </button>
                    <button
                      className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition flex items-center gap-1"
                      title="Generate Invoice"
                    >
                      <FileText size={14} />
                      Invoice
                    </button>
                    <button
                      onClick={() => handleEditOrder(order)}
                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition flex items-center gap-1"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order._id || order.id!)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                    {department != "Inventory" &&
                      order.status !== "processing" &&
                      order.status !== "shipped" &&
                      order.status !== "delivered" &&
                      order.status !== "cancelled" && (
                        <button
                          onClick={() => handleProcessOrder(order)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition"
                        >
                          Process
                        </button>
                      )}
                    {department != "Inventory" &&
                      order.status === "processing" && (
                        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm">
                          Processing...
                        </span>
                      )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-lg shadow border p-8 text-center">
          <ShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No orders found
          </h3>
          <p className="text-gray-600">
            No orders match your current search criteria.
          </p>
        </div>
      )}
      <CustomerFormModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSubmit={handleCreateCustomer}
      />
      <OrderFormModal
        isOpen={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          setEditingOrder(null);
        }}
        onSubmit={handleCreateOrder}
        isEdit={!!editingOrder}
        initialOrder={editingOrder || undefined}
      />
    </div>
  );
}
