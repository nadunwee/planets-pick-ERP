import Dashboard from "@/pages/Dashboard";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 lg:flex">
      <Sidebar />
      <div className="flex-1">
        <Dashboard />
      </div>
    </div>
  );
}
