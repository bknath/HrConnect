import { Bell, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import type { User as UserType } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const { user } = useAuth();
  const pageTitle = pageTitles[location] || "Dashboard";
  
  // Type guard to ensure user is properly typed
  const typedUser = user as UserType | undefined;

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
          
          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-8 w-8 rounded-full"
                data-testid="button-user-menu"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={typedUser?.profileImageUrl || undefined} alt={typedUser?.firstName || "User"} />
                  <AvatarFallback>
                    {typedUser?.firstName ? typedUser.firstName[0].toUpperCase() : "U"}
                    {typedUser?.lastName ? typedUser.lastName[0].toUpperCase() : ""}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {typedUser?.firstName} {typedUser?.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {typedUser?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/api/logout" className="flex items-center cursor-pointer" data-testid="button-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
