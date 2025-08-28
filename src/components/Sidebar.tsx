import { useState } from "react";
import {
  Menu,
  X,
  Package,
  Users,
  ShoppingCart,
  Truck,
  DollarSign,
  AlertTriangle,
  BarChart2,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type Page = "Dashboard" | "Inventory" | "Production" | "Employees" | "Orders & Sales" | "Delivery" | "Finance" | "Wastage" | "Reports" | "Settings";

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

const menuItems: { name: Page; icon: any }[] = [
  { name: "Dashboard", icon: BarChart2 },
  { name: "Inventory", icon: Package },
  { name: "Production", icon: FactoryIcon },
  { name: "Employees", icon: Users },
  { name: "Orders & Sales", icon: ShoppingCart },
  { name: "Delivery", icon: Truck },
  { name: "Finance", icon: DollarSign },
  { name: "Wastage", icon: AlertTriangle },
  { name: "Reports", icon: BarChart2 },
  { name: "Settings", icon: Settings },
];

function FactoryIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 21h18M3 10l6-6v6l6-6v6h6v11H3V10z"
      />
    </svg>
  );
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePageChange = (page: Page) => {
    onPageChange(page);
    setIsOpen(false); // Close mobile menu when navigating
  };

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden p-4 flex justify-between items-center border-b w-100">
        <h1 className="font-bold text-lg">Planet's Pick</h1>
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-green-700 text-white w-64 h-screen fixed lg:static top-0 left-0 transform transition-transform duration-300 z-50",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-4 font-bold text-xl border-b border-green-600">
          Planet's Pick
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => handlePageChange(name)}
              className={cn(
                "flex items-center gap-3 p-2 rounded transition w-full text-left",
                currentPage === name 
                  ? "bg-green-600 text-white" 
                  : "hover:bg-green-600"
              )}
            >
              <Icon size={18} />
              {name}
            </button>
          ))}
        </nav>
      </aside>
      
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
