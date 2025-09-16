import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

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
import { Sidebar } from "@/components/Sidebar";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <Login
              onLogin={(token: string) => {
                // handle login token here, e.g., save to localStorage or context
                console.log("Logged in with token:", token);
              }}
            />
          }
        />

        {/* Main app layout */}
        <Route path="/*" element={<MainLayout />} />
      </Routes>
    </Router>
  );
}

/* ✅ Layout with Sidebar */
function MainLayout() {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 bg-background min-h-screen">
        <div className="h-screen overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/production" element={<Production />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/orders-sales" element={<OrdersSales />} />
            <Route path="/delivery" element={<Delivery />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/administrator" element={<Administrator />} />
            <Route path="/warehouse" element={<Warehouse />} />
            <Route path="/wastage" element={<Wastage />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
