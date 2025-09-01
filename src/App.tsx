import { useState } from "react";
import Dashboard from "@/pages/Dashboard";
import Inventory from "@/pages/Inventory";
import Production from "@/pages/Production";
import Employees from "@/pages/Employees";
import OrdersSales from "@/pages/OrdersSales";
import Delivery from "@/pages/Delivery";
import Finance from "@/pages/Finance";
import Administrator from "@/pages/Administrator";
import Wastage from "@/pages/Wastage";
import Reports from "@/pages/Reports";
import { Sidebar, type Page } from "@/components/Sidebar";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("Dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "Dashboard":
        return <Dashboard />;
      case "Inventory":
        return <Inventory />;
      case "Production":
        return <Production />;
      case "Employees":
        return <Employees />;
      case "Orders & Sales":
        return <OrdersSales />;
      case "Delivery":
        return <Delivery />;
      case "Finance":
        return <Finance />;
      case "Administrator":
        return <Administrator />;
      case "Wastage":
        return <Wastage />;
      case "Reports":
        return <Reports />;
      case "Settings":
        return <div className="p-4"><h1 className="text-2xl font-bold">System Settings</h1><p className="text-gray-600">Coming soon...</p></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="lg:ml-64 bg-background min-h-screen">
        <div className="h-screen overflow-y-auto">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
