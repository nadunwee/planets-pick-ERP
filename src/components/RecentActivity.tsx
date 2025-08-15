const activities = [
  {
    text: "Virgin Coconut Oil batch #VOC-2024-001 completed",
    category: "Production",
    time: "2 hours ago",
    icon: "✅",
  },
  {
    text: "Low stock alert: Fresh coconuts below 500 units",
    category: "Inventory",
    time: "4 hours ago",
    icon: "⚠️",
  },
  {
    text: "New export order from Germany - 200L VCO",
    category: "Order",
    time: "6 hours ago",
    icon: "📦",
  },
  {
    text: "Delivery DL-001 completed successfully",
    category: "Delivery",
    time: "8 hours ago",
    icon: "🚚",
  },
];

export function RecentActivity() {
  return (
    <div className="bg-white p-4 rounded-lg shadow border">
      <h2 className="font-semibold text-lg mb-4">Recent Activity</h2>
      <ul className="space-y-4">
        {activities.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="text-xl">{item.icon}</span>
            <div>
              <p className="text-sm font-medium">{item.text}</p>
              <p className="text-xs text-gray-500">
                {item.category} • {item.time}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
