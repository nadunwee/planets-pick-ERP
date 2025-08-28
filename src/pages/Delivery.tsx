import { useState } from "react";
import {
  Truck,
  Search,
  Plus,
  Filter,
  MapPin,
  Calendar,
  Clock,
  Package,
  CheckCircle,
  AlertTriangle,
  Navigation,
  Bot,
  Eye,
  Edit,
  Phone,
  Mail,
  User,
  DollarSign,
} from "lucide-react";

interface Delivery {
  id: string;
  deliveryNumber: string;
  orderNumber: string;
  status: "pending" | "picked-up" | "in-transit" | "out-for-delivery" | "delivered" | "failed" | "returned";
  priority: "low" | "medium" | "high" | "urgent";
  customer: {
    name: string;
    company?: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
  };
  items: DeliveryItem[];
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  pickupDate: string;
  deliveryMethod: "standard" | "express" | "overnight" | "same-day";
  cost: number;
  weight: number;
  dimensions: string;
  notes?: string;
  route?: string;
  driver?: string;
  vehicleNumber?: string;
}

interface DeliveryItem {
  productName: string;
  quantity: number;
  unit: string;
  weight: number;
}

interface DeliveryMetric {
  metric: string;
  value: number | string;
  change: number;
  unit: string;
  color: string;
}

const deliveries: Delivery[] = [
  {
    id: "1",
    deliveryNumber: "DL-2024-001",
    orderNumber: "ORD-2024-001",
    status: "in-transit",
    priority: "high",
    customer: {
      name: "Hans Mueller",
      company: "Organic Food GmbH",
      email: "hans.mueller@organicfood.de",
      phone: "+49 30 123456789",
      address: "Hauptstraße 123",
      city: "Berlin",
      country: "Germany",
      postalCode: "10117",
    },
    items: [
      { productName: "Virgin Coconut Oil", quantity: 200, unit: "L", weight: 180 },
      { productName: "Dried Jackfruit", quantity: 50, unit: "kg", weight: 50 },
    ],
    carrier: "DHL Express",
    trackingNumber: "1234567890",
    estimatedDelivery: "2024-01-25",
    pickupDate: "2024-01-20",
    deliveryMethod: "express",
    cost: 25000,
    weight: 230,
    dimensions: "120x80x60 cm",
    notes: "Fragile items - handle with care. Requires signature on delivery.",
    route: "Colombo → Dubai → Frankfurt → Berlin",
    driver: "Klaus Weber",
    vehicleNumber: "B-DE-1234",
  },
  {
    id: "2",
    deliveryNumber: "DL-2024-002",
    orderNumber: "ORD-2024-002",
    status: "out-for-delivery",
    priority: "medium",
    customer: {
      name: "Sarah Johnson",
      company: "Health Store Canada",
      email: "sarah@healthstore.ca",
      phone: "+1 416 555 0123",
      address: "789 Queen Street",
      city: "Toronto",
      country: "Canada",
      postalCode: "M5V 0N2",
    },
    items: [
      { productName: "Virgin Coconut Oil", quantity: 100, unit: "L", weight: 90 },
    ],
    carrier: "FedEx",
    trackingNumber: "0987654321",
    estimatedDelivery: "2024-01-28",
    pickupDate: "2024-01-22",
    deliveryMethod: "standard",
    cost: 18000,
    weight: 90,
    dimensions: "80x60x40 cm",
    route: "Colombo → Toronto",
    driver: "Mike Thompson",
    vehicleNumber: "ON-CA-5678",
  },
  {
    id: "3",
    deliveryNumber: "DL-2024-003",
    orderNumber: "ORD-2024-003",
    status: "delivered",
    priority: "high",
    customer: {
      name: "Rajesh Gupta",
      company: "Spices World Pvt Ltd",
      email: "rajesh@spicesworld.in",
      phone: "+91 98765 43210",
      address: "MG Road",
      city: "Mumbai",
      country: "India",
      postalCode: "400001",
    },
    items: [
      { productName: "Dried Jackfruit", quantity: 200, unit: "kg", weight: 200 },
    ],
    carrier: "Blue Dart",
    trackingNumber: "BD123456789",
    estimatedDelivery: "2024-01-20",
    actualDelivery: "2024-01-19",
    pickupDate: "2024-01-15",
    deliveryMethod: "express",
    cost: 15000,
    weight: 200,
    dimensions: "100x70x50 cm",
    route: "Colombo → Mumbai",
  },
  {
    id: "4",
    deliveryNumber: "DL-2024-004",
    orderNumber: "ORD-2024-004",
    status: "pending",
    priority: "urgent",
    customer: {
      name: "Emma Wilson",
      company: "Local Market Australia",
      email: "emma@localmarket.au",
      phone: "+61 2 9876 5432",
      address: "Circular Quay",
      city: "Sydney",
      country: "Australia",
      postalCode: "2000",
    },
    items: [
      { productName: "Virgin Coconut Oil", quantity: 300, unit: "L", weight: 270 },
    ],
    carrier: "Australia Post",
    trackingNumber: "AP987654321",
    estimatedDelivery: "2024-02-01",
    pickupDate: "2024-01-25",
    deliveryMethod: "express",
    cost: 35000,
    weight: 270,
    dimensions: "150x100x80 cm",
    notes: "Rush delivery required. Customer contacted for expedited processing.",
    route: "Colombo → Singapore → Sydney",
  },
];

const deliveryMetrics: DeliveryMetric[] = [
  { metric: "On-Time Delivery", value: 94, change: 5.2, unit: "%", color: "green" },
  { metric: "Average Delivery Time", value: 7.2, change: -0.8, unit: "days", color: "blue" },
  { metric: "Delivery Cost", value: 22500, change: -8.5, unit: "LKR", color: "purple" },
  { metric: "Customer Satisfaction", value: 4.8, change: 0.3, unit: "/5", color: "yellow" },
];

export default function Delivery() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedCarrier, setSelectedCarrier] = useState("All");

  const statuses = ["All", "pending", "picked-up", "in-transit", "out-for-delivery", "delivered", "failed", "returned"];
  const carriers = ["All", "DHL Express", "FedEx", "Blue Dart", "Australia Post", "UPS"];

  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesSearch = delivery.deliveryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "All" || delivery.status === selectedStatus;
    const matchesCarrier = selectedCarrier === "All" || delivery.carrier === selectedCarrier;
    return matchesSearch && matchesStatus && matchesCarrier;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "picked-up":
        return "text-blue-600 bg-blue-100";
      case "in-transit":
        return "text-purple-600 bg-purple-100";
      case "out-for-delivery":
        return "text-indigo-600 bg-indigo-100";
      case "delivered":
        return "text-green-600 bg-green-100";
      case "failed":
        return "text-red-600 bg-red-100";
      case "returned":
        return "text-gray-600 bg-gray-100";
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="text-yellow-500" size={16} />;
      case "picked-up":
        return <Package className="text-blue-500" size={16} />;
      case "in-transit":
        return <Truck className="text-purple-500" size={16} />;
      case "out-for-delivery":
        return <Navigation className="text-indigo-500" size={16} />;
      case "delivered":
        return <CheckCircle className="text-green-500" size={16} />;
      case "failed":
        return <AlertTriangle className="text-red-500" size={16} />;
      case "returned":
        return <Package className="text-gray-500" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
    }
  };

  const totalDeliveries = deliveries.length;
  const pendingDeliveries = deliveries.filter(d => d.status === "pending").length;
  const inTransitDeliveries = deliveries.filter(d => ["picked-up", "in-transit", "out-for-delivery"].includes(d.status)).length;
  const deliveredDeliveries = deliveries.filter(d => d.status === "delivered").length;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Management</h1>
          <p className="text-gray-600">Track shipments, manage logistics, and monitor delivery performance</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition">
            <Plus size={16} />
            Schedule Delivery
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
            <Bot size={16} />
            Route Optimizer
          </button>
        </div>
      </div>

      {/* AI Logistics Assistant */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-500 text-white p-2 rounded-lg">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-purple-900">AI Logistics Insights</h3>
            <p className="text-purple-700 text-sm">
              Route optimization suggests combining DL-2024-004 and DL-2024-005 for 15% cost savings.
              Weather alert: Potential delays for European shipments due to storms. Recommend rescheduling DL-2024-001.
            </p>
          </div>
          <button className="ml-auto bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition">
            Optimize Routes
          </button>
        </div>
      </div>

      {/* Delivery Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Deliveries</p>
              <p className="text-2xl font-bold text-blue-600">{totalDeliveries}</p>
            </div>
            <Truck className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingDeliveries}</p>
            </div>
            <Clock className="text-yellow-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Transit</p>
              <p className="text-2xl font-bold text-purple-600">{inTransitDeliveries}</p>
            </div>
            <Navigation className="text-purple-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-green-600">{deliveredDeliveries}</p>
            </div>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow border p-4">
        <h2 className="font-semibold text-lg mb-4">Delivery Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {deliveryMetrics.map((metric, idx) => (
            <div key={idx} className="text-center">
              <p className="text-sm text-gray-600">{metric.metric}</p>
              <p className={`text-2xl font-bold text-${metric.color}-600`}>
                {typeof metric.value === 'number' && metric.unit === "LKR" 
                  ? `LKR ${metric.value.toLocaleString()}`
                  : `${metric.value}${metric.unit}`}
              </p>
              <p className={`text-sm ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change >= 0 ? '+' : ''}{metric.change}% from last month
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search deliveries, orders, or customers..."
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
                    {status === "All" ? "All Status" : status.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={selectedCarrier}
              onChange={(e) => setSelectedCarrier(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {carriers.map((carrier) => (
                <option key={carrier} value={carrier}>
                  {carrier === "All" ? "All Carriers" : carrier}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Deliveries List */}
      <div className="space-y-4">
        {filteredDeliveries.map((delivery) => (
          <div key={delivery.id} className="bg-white rounded-lg shadow border">
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {getStatusIcon(delivery.status)}
                      {delivery.deliveryNumber}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Order: {delivery.orderNumber} • Pickup: {delivery.pickupDate} • ETA: {delivery.estimatedDelivery}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(delivery.priority)}`}>
                    {delivery.priority} priority
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(delivery.status)}`}>
                    {delivery.status.replace("-", " ")}
                  </span>
                </div>
              </div>

              <div className="grid lg:grid-cols-4 gap-6">
                {/* Customer Information */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <User size={16} />
                    Customer Details
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{delivery.customer.name}</p>
                    {delivery.customer.company && (
                      <p className="text-gray-600">{delivery.customer.company}</p>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail size={12} />
                      {delivery.customer.email}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={12} />
                      {delivery.customer.phone}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={12} />
                      {delivery.customer.address}, {delivery.customer.city}
                    </div>
                    <p className="text-gray-600">{delivery.customer.country} {delivery.customer.postalCode}</p>
                  </div>
                </div>

                {/* Shipment Details */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Package size={16} />
                    Shipment Details
                  </h4>
                  <div className="space-y-2">
                    {delivery.items.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 rounded p-2 text-sm">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-gray-600">
                          {item.quantity} {item.unit} • {item.weight}kg
                        </p>
                      </div>
                    ))}
                    <div className="text-sm text-gray-600 pt-2">
                      <p>Total Weight: {delivery.weight}kg</p>
                      <p>Dimensions: {delivery.dimensions}</p>
                    </div>
                  </div>
                </div>

                {/* Logistics Information */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Truck size={16} />
                    Logistics
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-500">Carrier</p>
                      <p className="font-medium">{delivery.carrier}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tracking Number</p>
                      <p className="font-medium font-mono">{delivery.trackingNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Delivery Method</p>
                      <p className="font-medium capitalize">{delivery.deliveryMethod}</p>
                    </div>
                    {delivery.route && (
                      <div>
                        <p className="text-gray-500">Route</p>
                        <p className="text-xs text-gray-600">{delivery.route}</p>
                      </div>
                    )}
                    {delivery.driver && (
                      <div>
                        <p className="text-gray-500">Driver</p>
                        <p className="font-medium">{delivery.driver}</p>
                        {delivery.vehicleNumber && (
                          <p className="text-xs text-gray-600">{delivery.vehicleNumber}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Cost & Timeline */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <DollarSign size={16} />
                    Cost & Timeline
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-500">Delivery Cost</p>
                      <p className="font-bold text-lg">LKR {delivery.cost.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Pickup Date</p>
                      <p className="font-medium">{delivery.pickupDate}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Expected Delivery</p>
                      <p className="font-medium">{delivery.estimatedDelivery}</p>
                    </div>
                    {delivery.actualDelivery && (
                      <div>
                        <p className="text-gray-500">Actual Delivery</p>
                        <p className="font-medium text-green-600">{delivery.actualDelivery}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {delivery.notes && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Notes:</strong> {delivery.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={14} />
                  Last updated: 1 hour ago
                </div>
                <div className="flex gap-2">
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition flex items-center gap-1">
                    <Eye size={14} />
                    Track
                  </button>
                  <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition flex items-center gap-1">
                    <Edit size={14} />
                    Edit
                  </button>
                  <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition">
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDeliveries.length === 0 && (
        <div className="bg-white rounded-lg shadow border p-8 text-center">
          <Truck className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No deliveries found</h3>
          <p className="text-gray-600">No deliveries match your current search criteria.</p>
        </div>
      )}
    </div>
  );
}