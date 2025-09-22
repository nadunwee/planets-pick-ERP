import { use, useEffect, useState } from "react";
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
  Eye,
  Edit,
  Download,
} from "lucide-react";
import CustomerFormModal from "@/components/order-sales/CustomerFormModal";
import OrderFormModal from "@/components/order-sales/OrderFormModal";

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    company?: string;
    address: string;
    country: string;
  };
  items: OrderItem[];
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "partially-paid" | "overdue";
  paymentMethod: "bank-transfer" | "credit-card" | "cash" | "cryptocurrency";
  shippingMethod: "standard" | "express" | "overnight" | "pickup";
  notes?: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  specifications?: string;
}

const orders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    customer: {
      name: "Hans Mueller",
      email: "hans.mueller@organicfood.de",
      phone: "+49 30 123456789",
      company: "Organic Food GmbH",
      address: "Hauptstraße 123, Berlin",
      country: "Germany",
    },
    items: [
      {
        productId: "vco-500",
        productName: "Virgin Coconut Oil",
        quantity: 200,
        unit: "L",
        unitPrice: 1200,
        totalPrice: 240000,
        specifications: "500ml bottles, organic certified",
      },
      {
        productId: "djf-1kg",
        productName: "Dried Jackfruit",
        quantity: 50,
        unit: "kg",
        unitPrice: 800,
        totalPrice: 40000,
      },
    ],
    status: "confirmed",
    priority: "high",
    orderDate: "2024-01-10",
    expectedDelivery: "2024-01-25",
    totalAmount: 280000,
    paymentStatus: "paid",
    paymentMethod: "bank-transfer",
    shippingMethod: "express",
    notes: "Export order - requires phytosanitary certificate",
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    customer: {
      name: "Sarah Johnson",
      email: "sarah@healthstore.ca",
      phone: "+1 416 555 0123",
      company: "Health Store Canada",
      address: "789 Queen Street, Toronto",
      country: "Canada",
    },
    items: [
      {
        productId: "vco-250",
        productName: "Virgin Coconut Oil",
        quantity: 100,
        unit: "L",
        unitPrice: 1200,
        totalPrice: 120000,
        specifications: "250ml bottles",
      },
    ],
    status: "processing",
    priority: "medium",
    orderDate: "2024-01-12",
    expectedDelivery: "2024-01-28",
    totalAmount: 120000,
    paymentStatus: "partially-paid",
    paymentMethod: "credit-card",
    shippingMethod: "standard",
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    customer: {
      name: "Rajesh Gupta",
      email: "rajesh@spicesworld.in",
      phone: "+91 98765 43210",
      company: "Spices World Pvt Ltd",
      address: "MG Road, Mumbai",
      country: "India",
    },
    items: [
      {
        productId: "djf-500g",
        productName: "Dried Jackfruit",
        quantity: 200,
        unit: "kg",
        unitPrice: 800,
        totalPrice: 160000,
        specifications: "500g packets, premium grade",
      },
    ],
    status: "shipped",
    priority: "high",
    orderDate: "2024-01-08",
    expectedDelivery: "2024-01-20",
    actualDelivery: "2024-01-19",
    totalAmount: 160000,
    paymentStatus: "paid",
    paymentMethod: "bank-transfer",
    shippingMethod: "express",
  },
  {
    id: "4",
    orderNumber: "ORD-2024-004",
    customer: {
      name: "Emma Wilson",
      email: "emma@localmarket.au",
      phone: "+61 2 9876 5432",
      company: "Local Market Australia",
      address: "Circular Quay, Sydney",
      country: "Australia",
    },
    items: [
      {
        productId: "vco-1l",
        productName: "Virgin Coconut Oil",
        quantity: 300,
        unit: "L",
        unitPrice: 1200,
        totalPrice: 360000,
        specifications: "1L bottles, retail packaging",
      },
    ],
    status: "pending",
    priority: "urgent",
    orderDate: "2024-01-14",
    expectedDelivery: "2024-02-01",
    totalAmount: 360000,
    paymentStatus: "pending",
    paymentMethod: "credit-card",
    shippingMethod: "standard",
    notes: "Rush order - customer requested expedited processing",
  },
];

export default function OrdersSales() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [dateRange, setDateRange] = useState("all");
  const [userLevel, setUserLevel] = useState<string | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const handleCreateOrder = async (data: any) => {
    try {
      const res = await fetch("http://localhost:4000/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      console.log("✅ Order created:", result);
    } catch (error) {
      console.error("❌ Error creating order:", error);
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
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "All" || order.status === selectedStatus;
    const matchesPriority =
      selectedPriority === "All" || order.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

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
        return "text-yellow-600 bg-yellow-100";
      case "pending":
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
  const averageOrderValue = totalRevenue / totalOrders;

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
            onClick={() => setShowOrderModal(true)}
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
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow border">
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {order.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Ordered on {order.orderDate} • Expected:{" "}
                      {order.expectedDelivery}
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
                    <p className="font-medium">{order.customer.name}</p>
                    {order.customer.company && (
                      <p className="text-gray-600">{order.customer.company}</p>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail size={12} />
                      {order.customer.email}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={12} />
                      {order.customer.phone}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={12} />
                      {order.customer.address}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Globe size={12} />
                      {order.customer.country}
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
                      <div key={idx} className="bg-gray-50 rounded p-2 text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-gray-600">
                              {item.quantity} {item.unit} × LKR{" "}
                              {item.unitPrice.toLocaleString()}
                            </p>
                            {item.specifications && (
                              <p className="text-xs text-gray-500">
                                {item.specifications}
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
                        {order.paymentMethod.replace("-", " ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="capitalize">{order.shippingMethod}</span>
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
                  Last updated: 2 hours ago
                </div>
                <div className="flex gap-2">
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition flex items-center gap-1">
                    <Eye size={14} />
                    View
                  </button>
                  <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition flex items-center gap-1">
                    <Edit size={14} />
                    Edit
                  </button>
                  <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition">
                    Process
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
        onClose={() => setShowOrderModal(false)}
        onSubmit={handleCreateOrder}
      />
    </div>
  );
}
