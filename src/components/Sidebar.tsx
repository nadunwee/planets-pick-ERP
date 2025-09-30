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
  Settings as SettingsIcon,
  Shield,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import React, { use, useState } from "react";
import type { JSX } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const menuItems: {
  name: string;
  path: string;
  icon: LucideIcon | (() => JSX.Element);
}[] = [
  { name: "Dashboard", path: "/dashboard", icon: BarChart2 },
  { name: "Inventory", path: "/inventory", icon: Package },
  { name: "Production", path: "/production", icon: FactoryIcon },
  { name: "Employees", path: "/employees", icon: Users },
  { name: "Orders & Sales", path: "/orders-sales", icon: ShoppingCart },
  { name: "Delivery", path: "/delivery", icon: Truck },
  { name: "Finance", path: "/finance", icon: DollarSign },
  { name: "Procurement", path: "/procurement", icon: ShoppingCart },
  { name: "Administrator", path: "/administrator", icon: Shield },
  { name: "Warehouse", path: "/warehouse", icon: Warehouse },
  { name: "Wastage", path: "/wastage", icon: AlertTriangle },
  { name: "Reports", path: "/reports", icon: BarChart2 },
  { name: "Settings", path: "/settings", icon: SettingsIcon },
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

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  // Get user type from localStorage
  const userDepartment = localStorage.getItem("department");
  const userlevel = localStorage.getItem("level");

  const inventoryMan = [
    "Dashboard",
    "Production",
    "Employees",
    "Delivery",
    "Finance",
    "Administrator",
    "Warehouse",
    "Wastage",
    "Settings",
    "Procurement",
  ];

  const productionMan = [
    "Dashboard",
    "Procurement",
    "Employees",
    "Delivery",
    "Finance",
    "Administrator",
    "Warehouse",
    "Wastage",
    "Settings",
  ];

  const HR = [
    "Dashboard",
    "Inventory",
    "Production",
    "Orders & Sales",
    "Delivery",
    "Finance",
    "Administrator",
    "Wastage",
    "Settings",
    "Procurement",
  ];

  let filteredMenuItems = menuItems;

  if (userDepartment === "Inventory") {
    filteredMenuItems = menuItems.filter(
      (item) => !inventoryMan.includes(item.name)
    );
  }

  if (userDepartment === "Production") {
    filteredMenuItems = menuItems.filter(
      (item) => !productionMan.includes(item.name)
    );
  }

  if (userDepartment === "Human Resources") {
    filteredMenuItems = menuItems.filter((item) => !HR.includes(item.name));
  }

  // Logout handler
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.clear();
      window.location.href = "/login"; // redirect to login page
    }
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
          "bg-sidebar text-sidebar-foreground w-64 h-screen fixed lg:fixed top-0 left-0 transform transition-transform duration-300 z-50 shadow-lg flex flex-col justify-between",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div>
          <div className="p-6 font-bold text-xl border-b border-sidebar-border">
            <span className="text-sidebar-foreground">Planet's</span>
            <span className="text-accent ml-1">Pick</span>
          </div>
          <nav className="p-4 space-y-1">
            {filteredMenuItems.map(({ name, path, icon: Icon }) => (
              <NavLink
                key={name}
                to={path}
                onClick={() => setIsOpen(false)} // close mobile menu
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 w-full text-left group",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )
                }
              >
                <Icon
                  size={18}
                  className="transition-colors duration-200 group-hover:text-accent"
                />
                <span className="font-medium">{name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 w-full text-left text-red-600 hover:bg-red-100 rounded-lg transition-colors"
          >
            <X size={18} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
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
