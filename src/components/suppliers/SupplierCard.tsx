import { Edit, Trash } from "lucide-react";

interface SupplierCardProps {
  supplier: any;
  onEdit: (supplier: any) => void;
  onDelete: (id: string) => void;
}

export default function SupplierCard({ supplier, onEdit, onDelete }: SupplierCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border hover:shadow-lg transition">
      <h3 className="text-lg font-semibold">{supplier.name}</h3>
      <p className="text-sm text-gray-600">{supplier.email}</p>
      <p className="text-sm text-gray-600">{supplier.phone}</p>
      <p className="text-sm text-gray-600">{supplier.address}</p>
      
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onEdit(supplier)}
          className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition flex items-center gap-1"
        >
          <Edit size={14} /> Edit
        </button>
        <button
          onClick={() => onDelete(supplier._id)}
          className="flex-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition flex items-center gap-1"
        >
          <Trash size={14} /> Delete
        </button>
      </div>
    </div>
  );
}
