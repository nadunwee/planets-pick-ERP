import api from "./api";

export interface OrderItem {
  productId?: string;
  productName: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  specifications?: string;
  notes?: string;
}

export interface OrderCustomer {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  country: string;
}

export interface Order {
  _id?: string;
  id?: string;
  orderId: string;
  orderNumber?: string;
  orderedOn: string;
  orderDate?: string;
  expectedDate: string;
  expectedDelivery?: string;
  actualDelivery?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  customer: OrderCustomer;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "partially-paid" | "overdue" | "unpaid" | "partial";
  paymentMethod: "bank-transfer" | "credit-card" | "cash" | "cryptocurrency" | string;
  shippingMethod: "standard" | "express" | "overnight" | "pickup" | string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderPayload {
  customer: string; // Customer ID
  orderId: string;
  orderedOn: string;
  expectedDate?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "confirmed" | "cancelled";
  totalAmount: number;
  paymentStatus: "paid" | "unpaid" | "partial";
  paymentMethod?: string;
  shippingMethod?: string;
  notes?: string;
  items: {
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
  }[];
}

// List all orders
export const getAllOrders = async (): Promise<Order[]> => {
  const { data } = await api.get<Order[]>("/orders/all");
  return data;
};

// Get a single order by ID
export const getOrderById = async (id: string): Promise<Order> => {
  const { data } = await api.get<Order>(`/orders/${id}`);
  return data;
};

// Create a new order
export const createOrder = async (order: OrderPayload): Promise<Order> => {
  const { data } = await api.post<{ message: string; order: Order }>("/orders/create", order);
  return data.order;
};

// Update an order
export const updateOrder = async (id: string, updates: Partial<OrderPayload>): Promise<Order> => {
  const { data } = await api.patch<{ message: string; order: Order }>(`/orders/edit/${id}`, updates);
  return data.order;
};

// Delete an order
export const deleteOrder = async (id: string): Promise<{ message: string }> => {
  const { data } = await api.delete<{ message: string }>(`/orders/delete/${id}`);
  return data;
};