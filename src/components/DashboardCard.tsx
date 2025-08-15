interface DashboardCardProps {
  title: string;
  value: string;
  change: string;
  negative?: boolean;
}

export function DashboardCard({
  title,
  value,
  change,
  negative,
}: DashboardCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
      <p
        className={`text-sm mt-1 font-medium ${
          negative ? "text-red-500" : "text-green-600"
        }`}
      >
        {change} from last month
      </p>
    </div>
  );
}
