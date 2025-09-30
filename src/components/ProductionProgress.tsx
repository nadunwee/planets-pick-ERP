interface Product {
  name: string;
  current: number;
  total: number;
  unit: string;
}

const products: Product[] = [
  { name: "Virgin Coconut Oil", current: 185, total: 200, unit: "L" },
  { name: "Dried Jackfruit", current: 55, total: 50, unit: "kg" },
];

export function ProductionProgress() {
  return (
    <div className="bg-white p-4 rounded-lg shadow border">
      <h2 className="font-semibold text-lg mb-4">Today's Production</h2>
      <div className="space-y-4">
        {products.map((p, idx) => {
          const percentage = Math.min((p.current / p.total) * 100, 100);

          return (
            <div key={idx}>
              <div className="flex justify-between text-sm font-medium mb-1">
                <span>{p.name}</span>
                <span>
                  {p.current}/{p.total} {p.unit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded h-2">
                <div
                  className="bg-orange-500 h-2 rounded"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
