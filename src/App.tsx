import { useState } from "react";
import Dashboard from "@/pages/Dashboard";
import Inventory from "@/pages/Inventory";
import Production from "@/pages/Production";
import Employees from "@/pages/Employees";
import OrdersSales from "@/pages/OrdersSales";
import Delivery from "@/pages/Delivery";
import Finance from "@/pages/Finance";
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
      case "Wastage":
        return <div className="p-4"><h1 className="text-2xl font-bold">Wastage Management</h1><p className="text-gray-600">Coming soon...</p></div>;
      case "Reports":
        return <div className="p-4"><h1 className="text-2xl font-bold">Reports & Analytics</h1><p className="text-gray-600">Coming soon...</p></div>;
      case "Settings":
        return <div className="p-4"><h1 className="text-2xl font-bold">System Settings</h1><p className="text-gray-600">Coming soon...</p></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background lg:flex">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 bg-background">
        {renderPage()}
      </div>
    </div>
  );
}
