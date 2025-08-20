import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Code, Megaphone, DollarSign, Users, Building, MoreHorizontal, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Department, Employee } from "@shared/schema";

const departmentIcons: Record<string, any> = {
  "Engineering": Code,
  "Marketing": Megaphone,
  "Sales": DollarSign,
  "HR": Users,
  "Finance": DollarSign,
  "Operations": Building,
};

const departmentColors: Record<string, string> = {
  "Engineering": "bg-blue-100 text-blue-600",
  "Marketing": "bg-purple-100 text-purple-600",
  "Sales": "bg-green-100 text-green-600",
  "HR": "bg-pink-100 text-pink-600",
  "Finance": "bg-yellow-100 text-yellow-600",
  "Operations": "bg-gray-100 text-gray-600",
};

export default function Departments() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: departments, isLoading: departmentsLoading } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const { data: employees } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const getDepartmentStats = (departmentId: string) => {
    const deptEmployees = employees?.filter(emp => emp.departmentId === departmentId) || [];
    return {
      employeeCount: deptEmployees.length,
      manager: deptEmployees.find(emp => emp.position.toLowerCase().includes('manager'))
    };
  };

  if (departmentsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Departments</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-dark text-white" data-testid="button-add-department">
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
            </DialogHeader>
            <div className="text-center text-gray-500 py-4">
              Department form would be implemented here
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments?.map((department) => {
          const Icon = departmentIcons[department.name] || Building;
          const iconColorClass = departmentColors[department.name] || "bg-gray-100 text-gray-600";
          const stats = getDepartmentStats(department.id);
          
          return (
            <Card key={department.id} className="hover:shadow-md transition-shadow" data-testid={`card-department-${department.id}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColorClass}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <Button variant="ghost" size="sm" data-testid={`button-department-menu-${department.id}`}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2" data-testid={`text-department-name-${department.id}`}>
                  {department.name}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4" data-testid={`text-department-description-${department.id}`}>
                  {department.description || "No description available"}
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Employees</span>
                    <Badge variant="secondary" data-testid={`badge-employee-count-${department.id}`}>
                      {stats.employeeCount}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Manager</span>
                    <span className="text-sm font-medium text-gray-900" data-testid={`text-manager-${department.id}`}>
                      {stats.manager ? `${stats.manager.firstName} ${stats.manager.lastName}` : "Unassigned"}
                    </span>
                  </div>
                  
                  {department.budget && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Budget</span>
                      <span className="text-sm font-medium text-gray-900" data-testid={`text-budget-${department.id}`}>
                        ${department.budget.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {(!departments || departments.length === 0) && (
          <div className="col-span-full text-center py-8 text-gray-500">
            No departments found. Create your first department to get started.
          </div>
        )}
      </div>
    </div>
  );
}
