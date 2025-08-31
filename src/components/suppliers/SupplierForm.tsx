import { useState } from "react";

export interface Supplier {
  _id?: string; // MongoDB ID
  name: string;
  code: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  onTimeDeliveryRate?: number;
  qualityScore?: number;
  responsivenessScore?: number;
  totalSpend?: number;
  ordersCount?: number;
  deleted?: boolean;

  // Optional frontend-only fields
  category?: string;
  status?: "active" | "inactive";
}

interface SupplierFormProps {
  initialData?: Supplier;
  onSubmit: (supplierData: Supplier) => void;
}

export default function SupplierForm({ initialData, onSubmit }: SupplierFormProps) {
  const [formData, setFormData] = useState<Supplier>(
    initialData || {
      name: "",
      code: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      country: "",
      onTimeDeliveryRate: 0,
      qualityScore: 0,
      responsivenessScore: 0,
      totalSpend: 0,
      ordersCount: 0,
      category: "",
      status: "active",
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
      <input
        type="text"
        name="name"
        placeholder="Supplier Name"
        value={formData.name}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded-lg"
        required
      />
      <input
        type="text"
        name="code"
        placeholder="Supplier Code"
        value={formData.code}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded-lg"
        required
      />
      <input
        type="text"
        name="category"
        placeholder="Category"
        value={formData.category || ""}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded-lg"
      />
      <input
        type="text"
        name="contactPerson"
        placeholder="Contact Person"
        value={formData.contactPerson || ""}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded-lg"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email || ""}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded-lg"
      />
      <input
        type="text"
        name="phone"
        placeholder="Phone"
        value={formData.phone || ""}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded-lg"
      />
      <input
        type="text"
        name="address"
        placeholder="Address"
        value={formData.address || ""}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded-lg"
      />
      <input
        type="text"
        name="country"
        placeholder="Country"
        value={formData.country || ""}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded-lg"
      />

      {formData.status && (
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      )}

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
      >
        {initialData ? "Update Supplier" : "Add Supplier"}
      </button>
    </form>
  );
}
