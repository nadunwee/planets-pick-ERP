import { useEffect, useState } from "react";
import type { OrderPayload, Order } from "../services/orderService";

interface Customer {
  _id: string;
  name: string;
  company?: string;
}

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OrderPayload) => void;
  isEdit?: boolean;
  initialOrder?: Order;
}

interface OrderItem {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export default function OrderFormModal({
  isOpen,
  onClose,
  onSubmit,
  isEdit = false,
  initialOrder,
}: OrderFormModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState({
    customer: "",
    orderId: "",
    orderedOn: "",
    expectedDate: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    status: "pending" as
      | "pending"
      | "confirmed"
      | "processing"
      | "shipped"
      | "delivered"
      | "cancelled",
    totalAmount: 0,
    paymentStatus: "unpaid" as "paid" | "unpaid" | "partial",
    paymentMethod: "",
    shippingMethod: "",
    notes: "",
  });
  const [items, setItems] = useState<OrderItem[]>([
    {
      name: "",
      quantity: 1,
      unit: "pcs",
      unitPrice: 0,
      totalPrice: 0,
      notes: "",
    },
  ]);

  // Initialize form with order data when editing
  useEffect(() => {
    if (isEdit && initialOrder) {
      setForm({
        customer: initialOrder.customer._id || "",
        orderId: initialOrder.orderId,
        orderedOn: initialOrder.orderedOn,
        expectedDate: initialOrder.expectedDate || "",
        priority: initialOrder.priority,
        status: initialOrder.status,
        totalAmount: initialOrder.totalAmount,
        paymentStatus:
          initialOrder.paymentStatus === "partially-paid"
            ? "partial"
            : initialOrder.paymentStatus === "overdue"
            ? "unpaid"
            : (initialOrder.paymentStatus as "paid" | "unpaid" | "partial"),
        paymentMethod: initialOrder.paymentMethod || "",
        shippingMethod: initialOrder.shippingMethod || "",
        notes: initialOrder.notes || "",
      });

      setItems(
        initialOrder.items.map((item) => ({
          name: item.name || item.productName,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          notes: item.notes || "",
        }))
      );
    } else if (!isEdit) {
      // Reset form when not editing
      setForm({
        customer: "",
        orderId: "",
        orderedOn: "",
        expectedDate: "",
        priority: "medium",
        status: "pending",
        totalAmount: 0,
        paymentStatus: "unpaid",
        paymentMethod: "",
        shippingMethod: "",
        notes: "",
      });
      setItems([
        {
          name: "",
          quantity: 1,
          unit: "pcs",
          unitPrice: 0,
          totalPrice: 0,
          notes: "",
        },
      ]);
    }
  }, [isEdit, initialOrder]);

  useEffect(() => {
    if (isOpen) {
      fetch("http://localhost:4000/api/customers/all")
        .then((res) => res.json())
        .then((data) => {
          setCustomers(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          console.error("❌ Error fetching customers:", err);
          // Provide mock data for testing when API is not available
          setCustomers([
            { _id: "1", name: "John Doe", company: "Test Company 1" },
            { _id: "2", name: "Jane Smith", company: "Test Company 2" },
          ]);
        });
    }
  }, [isOpen]);

  // Calculate total when items change
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
    setForm((prev) => ({ ...prev, totalAmount: total }));
  }, [items]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleItemChange = (
    index: number,
    field: keyof OrderItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-calculate total price when quantity or unit price changes
    if (field === "quantity" || field === "unitPrice") {
      newItems[index].totalPrice =
        newItems[index].quantity * newItems[index].unitPrice;
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        name: "",
        quantity: 1,
        unit: "pcs",
        unitPrice: 0,
        totalPrice: 0,
        notes: "",
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate items
    if (
      items.some(
        (item) => !item.name || item.quantity <= 0 || item.unitPrice < 0
      )
    ) {
      alert("Please fill in all item details with valid values.");
      return;
    }

    const orderData: OrderPayload = {
      ...form,
      items: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        notes: item.notes,
      })),
    };

    onSubmit(orderData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {isEdit ? "Edit Order" : "Create New Order"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Select Customer */}
          <div>
            <label className="block text-sm font-medium">Customer</label>
            <select
              name="customer"
              value={form.customer}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded-lg"
            >
              <option value="">Select a customer</option>
              {customers.map((cust) => (
                <option key={cust._id} value={cust._id}>
                  {cust.name} ({cust.company})
                </option>
              ))}
            </select>
          </div>

          {/* Order ID */}
          <div>
            <label className="block text-sm font-medium">Order ID</label>
            <input
              type="text"
              name="orderId"
              value={form.orderId}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded-lg"
            />
          </div>

          {/* Ordered On */}
          <div>
            <label className="block text-sm font-medium">Ordered On</label>
            <input
              type="date"
              name="orderedOn"
              value={form.orderedOn}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded-lg"
            />
          </div>

          {/* Expected Date */}
          <div>
            <label className="block text-sm font-medium">
              Expected Delivery
            </label>
            <input
              type="date"
              name="expectedDate"
              value={form.expectedDate}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium">Payment Method</label>
            <input
              type="text"
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              placeholder="e.g. Credit Card"
              className="w-full border px-3 py-2 rounded-lg"
            />
          </div>

          {/* Shipping Method */}
          <div>
            <label className="block text-sm font-medium">Shipping Method</label>
            <input
              type="text"
              name="shippingMethod"
              value={form.shippingMethod}
              onChange={handleChange}
              placeholder="e.g. DHL Express"
              className="w-full border px-3 py-2 rounded-lg"
            />
          </div>

          {/* Order Items */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium">Order Items</label>
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                + Add Item
              </button>
            </div>

            {items.map((item, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 space-y-3 bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm">Item {index + 1}</h4>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        handleItemChange(index, "name", e.target.value)
                      }
                      placeholder="Enter item name"
                      className="w-full border px-2 py-1 rounded text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Unit
                    </label>
                    <select
                      value={item.unit}
                      onChange={(e) =>
                        handleItemChange(index, "unit", e.target.value)
                      }
                      className="w-full border px-2 py-1 rounded text-sm"
                    >
                      <option value="pcs">Pieces</option>
                      <option value="kg">Kilograms</option>
                      <option value="lbs">Pounds</option>
                      <option value="m">Meters</option>
                      <option value="ft">Feet</option>
                      <option value="l">Liters</option>
                      <option value="boxes">Boxes</option>
                      <option value="sets">Sets</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "quantity",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      min="1"
                      step="0.01"
                      className="w-full border px-2 py-1 rounded text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Unit Price *
                    </label>
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "unitPrice",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      min="0"
                      step="0.01"
                      className="w-full border px-2 py-1 rounded text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Total Price
                    </label>
                    <input
                      type="number"
                      value={item.totalPrice}
                      readOnly
                      className="w-full border px-2 py-1 rounded text-sm bg-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={item.notes || ""}
                    onChange={(e) =>
                      handleItemChange(index, "notes", e.target.value)
                    }
                    placeholder="Optional notes for this item"
                    className="w-full border px-2 py-1 rounded text-sm"
                  />
                </div>
              </div>
            ))}

            {/* Total Amount Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Order Amount:</span>
                <span className="font-bold text-lg">
                  LKR {form.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {isEdit ? "Update Order" : "Save Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
