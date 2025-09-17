import { DashboardCard } from "@/components/DashboardCard";
import { QuickActions } from "@/components/QuickActions";
import { ProductionProgress } from "@/components/ProductionProgress";
import { LowStockAlerts } from "@/components/LowStockAlerts";
import { RecentActivity } from "@/components/RecentActivity";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem("name"); // 👈 check localStorage
    if (!username) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <>
      <header className="hidden lg:flex justify-between h-16 items-center bg-card border-b border-border shadow-sm px-6">
        <h1 className="text-lg font-semibold text-foreground">
          Smart Production & Management System
        </h1>
        <div className="text-right">
          <span className="font-semibold text-foreground">Admin User</span>
          <p className="text-sm text-muted-foreground">System Administrator</p>
        </div>
      </header>
      <div className="p-4 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Total Inventory Value"
            value="LKR 2,450,000"
            change="+12.5%"
          />
          <DashboardCard title="Active Employees" value="38" change="+2" />
          <DashboardCard
            title="Production Today"
            value="850 units"
            change="-5%"
            negative
          />
          <DashboardCard
            title="Daily Revenue"
            value="LKR 185,000"
            change="+8.2%"
          />
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <RecentActivity />
            <ProductionProgress />
          </div>
          <div className="space-y-6">
            <LowStockAlerts />
            <QuickActions />
          </div>
        </div>
      </div>
    </>
  );
}
