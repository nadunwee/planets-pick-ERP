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
  Shield,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type Page = "Dashboard" | "Inventory" | "Production" | "Employees" | "Orders & Sales" | "Delivery" | "Finance" | "Administrator" | "Wastage" | "Reports" | "Settings";

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

const menuItems: { name: Page; icon: LucideIcon | (() => React.JSX.Element) }[] = [
  { name: "Dashboard", icon: BarChart2 },
  { name: "Inventory", icon: Package },
  { name: "Production", icon: FactoryIcon },
  { name: "Employees", icon: Users },
  { name: "Orders & Sales", icon: ShoppingCart },
  { name: "Delivery", icon: Truck },
  { name: "Finance", icon: DollarSign },
  { name: "Administrator", icon: Shield },
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
      <div className="lg:hidden p-4 flex justify-between items-center border-b bg-card border-border">
        <h1 className="font-bold text-lg text-foreground">Planet's Pick</h1>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-foreground hover:text-accent transition-colors"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground w-64 h-screen fixed lg:static top-0 left-0 transform transition-transform duration-300 z-50 shadow-lg",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6 font-bold text-xl border-b border-sidebar-border">
          <span className="text-sidebar-foreground">Planet's</span>
          <span className="text-accent ml-1">Pick</span>
        </div>
        <nav className="p-4 space-y-1">
          {menuItems.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => handlePageChange(name)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 w-full text-left group",
                currentPage === name 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon size={18} className={cn(
                "transition-colors duration-200",
                currentPage === name 
                  ? "text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground group-hover:text-accent"
              )} />
              <span className="font-medium">{name}</span>
            </button>
          ))}
        </nav>
      </aside>
      
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-label="Close sidebar"
        />
      )}
    </>
  );
}
