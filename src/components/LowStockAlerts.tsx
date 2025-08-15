const lowStockItems = [
  { name: "Fresh Coconuts", quantity: "450/500 pieces" },
  { name: "Jackfruit", quantity: "25/50 kg" },
  { name: "Glass Bottles (500ml)", quantity: "80/100 pieces" },
  { name: "Labels", quantity: "150/200 pieces" },
];

export function LowStockAlerts() {
  return (
    <div className="bg-white p-4 rounded-lg shadow border">
      <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
        ⚠️ Low Stock Alerts
      </h2>
      <ul className="space-y-3">
        {lowStockItems.map((item, idx) => (
          <li key={idx} className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-gray-500">{item.quantity}</p>
            </div>
            <span className="bg-red-100 text-red-600 px-2 py-1 text-xs rounded">
              Low Stock
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
