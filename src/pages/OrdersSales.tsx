import { useEffect, useState } from "react";
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
  Bot,
  Globe,
  User,
  MapPin,
  Phone,
  Mail,
  Edit,
  Download,
  Trash2,
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

export default function OrdersSales() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [dateRange, setDateRange] = useState("all");
  const [userLevel, setUserLevel] = useState<string | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderType | null>(null);
  const department = localStorage.getItem("department");

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
      // Refresh the orders list
      fetchOrders();
    } catch (error) {
      console.error("❌ Error deleting order:", error);
      alert("Failed to delete order. Please try again.");
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
      } else {
        // Create new order
        await createOrder(data);
        console.log("✅ Order created successfully");
      }
      // Refresh the orders list after creation/update
      fetchOrders();
      setEditingOrder(null); // Reset editing state
    } catch (error) {
      console.error("❌ Error saving order:", error);
    }
  };

  useEffect(() => {
    const level = localStorage.getItem("level") || "{}";
    setUserLevel(level);
  }, []);

  const handleCreateCustomer = async (data: any) => {
    try {
      const res = await fetch("http://localhost:4000/api/customers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      console.log("✅ Customer created:", result);
    } catch (error) {
      console.error("❌ Error creating customer:", error);
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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "All" || order.status === selectedStatus;
    const matchesPriority =
      selectedPriority === "All" || order.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
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
          {userLevel === "L1" && (
            <button
              onClick={() => setShowCustomerModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
            >
              <Plus size={16} />
              New Customer
            </button>
          )}
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* AI Sales Assistant */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
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
      </div>

      {/* Sales Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                LKR {totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 flex items-center gap-1">
                <TrendingUp size={14} />
                +18.7% from last month
              </p>
            </div>
            <DollarSign className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
              <p className="text-sm text-blue-600 flex items-center gap-1">
                <TrendingUp size={14} />
                +15.5% from last week
              </p>
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
              <p className="text-sm text-purple-600 flex items-center gap-1">
                <TrendingUp size={14} />
                +8.2% from last month
              </p>
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
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-col lg:flex-row gap-4">
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
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={16} />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "All"
                      ? "All Status"
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
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
                      <h3 className="font-semibold text-lg">
                        {order.orderNumber || order.orderId}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Ordered on {order.orderDate || order.orderedOn} •
                        Expected: {order.expectedDelivery || order.expectedDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
                      Payment & Shipping
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-bold text-lg">
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
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping:</span>
                        <span className="capitalize">
                          {order.shippingMethod || "N/A"}
                        </span>
                      </div>
                      {order.actualDelivery && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivered:</span>
                          <span className="text-green-600">
                            {order.actualDelivery}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
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
                  <div className="flex gap-2">
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
                    {department != "Inventory" && (
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition">
                        Process
                      </button>
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
