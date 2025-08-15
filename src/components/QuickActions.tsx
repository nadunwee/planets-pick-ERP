export function QuickActions() {
  return (
    <div className="bg-white p-4 rounded-lg shadow border">
      <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-green-100 text-green-700 py-2 rounded font-medium hover:bg-green-200">
          Add Stock
        </button>
        <button className="bg-green-100 text-green-700 py-2 rounded font-medium hover:bg-green-200">
          New Batch
        </button>
      </div>
    </div>
  );
}
