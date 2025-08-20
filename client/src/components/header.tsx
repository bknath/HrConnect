import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/dashboard": "Dashboard", 
  "/employees": "Employee Directory",
  "/attendance": "Attendance Tracking",
  "/leave-management": "Leave Management",
  "/departments": "Departments",
  "/reports": "Reports & Analytics"
};

export default function Header() {
  const [location] = useLocation();
  const pageTitle = pageTitles[location] || "Dashboard";

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold text-gray-900">{pageTitle}</h2>
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
            <span>Last updated:</span>
            <span>Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            data-testid="button-notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
          </Button>
          <Button 
            className="bg-primary hover:bg-primary-dark text-white"
            data-testid="button-quick-add"
          >
            <Plus className="h-4 w-4 mr-2" />
            Quick Add
          </Button>
        </div>
      </div>
    </header>
  );
}
