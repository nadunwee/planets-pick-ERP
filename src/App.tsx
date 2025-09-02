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
import Settings from "@/pages/Settings";
import Warehouse from "@/pages/Warehouse";
import Login from "@/pages/Login";
import { Sidebar, type Page } from "@/components/Sidebar";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("Dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (username: string, password: string) => {
    // Simple authentication - in real app, this would call an API
    if (username && password) {
      setIsAuthenticated(true);
    }
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

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
      case "Warehouse":
        return <Warehouse />;
      case "Wastage":
        return <Wastage />;
      case "Reports":
        return <Reports />;
      case "Settings":
        return <Settings />;
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
