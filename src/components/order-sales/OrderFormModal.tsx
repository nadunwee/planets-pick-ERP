import { useEffect, useState } from "react";

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function OrderFormModal({
  isOpen,
  onClose,
  onSubmit,
}: OrderFormModalProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [form, setForm] = useState({
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

  useEffect(() => {
    if (isOpen) {
      fetch("http://localhost:4000/api/customers/all")
        .then((res) => res.json())
        .then((data) => setCustomers(data))
        .catch((err) => console.error("❌ Error fetching customers:", err));
    }
  }, [isOpen]);

  console.log("Customers:", customers);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Create New Order</h2>
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
              Save Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
