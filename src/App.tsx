import { useState } from "react";
import Dashboard from "@/pages/Dashboard";
import Inventory from "@/pages/Inventory";
import { Sidebar, type Page } from "@/components/Sidebar";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("Dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "Dashboard":
        return <Dashboard />;
      case "Inventory":
        return <Inventory />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 lg:flex">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1">
        {renderPage()}
      </div>
    </div>
  );
}
