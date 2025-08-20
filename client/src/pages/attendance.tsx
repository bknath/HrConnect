import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";
import type { AttendanceWithEmployee } from "@shared/schema";

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  const { data: attendance, isLoading } = useQuery<AttendanceWithEmployee[]>({
    queryKey: ["/api/attendance", selectedDate],
  });

  const { data: departments } = useQuery({
    queryKey: ["/api/departments"],
  });

  const filteredAttendance = attendance?.filter(record => 
    selectedDepartment === "all" || record.employee.departmentId === selectedDepartment
  ) || [];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "present": "bg-green-100 text-green-800",
      "absent": "bg-red-100 text-red-800", 
      "late": "bg-yellow-100 text-yellow-800",
      "half-day": "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "-";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <h3 className="text-lg font-semibold text-gray-900">Attendance Tracking</h3>
          <div className="flex items-center space-x-4">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
              data-testid="input-attendance-date"
            />
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48" data-testid="select-attendance-department">
                <SelectValue placeholder="All Employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {departments?.map((dept: any) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="bg-primary hover:bg-primary-dark text-white" data-testid="button-export-attendance">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Employee</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Check In</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Check Out</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Hours</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAttendance.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50" data-testid={`row-attendance-${record.id}`}>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {record.employee.firstName[0]}{record.employee.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900" data-testid={`text-employee-name-${record.id}`}>
                        {record.employee.firstName} {record.employee.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{record.employee.department?.name || "Unassigned"}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-gray-900" data-testid={`text-checkin-${record.id}`}>
                  {formatTime(record.checkIn)}
                </td>
                <td className="py-4 px-6 text-sm text-gray-900" data-testid={`text-checkout-${record.id}`}>
                  {formatTime(record.checkOut)}
                </td>
                <td className="py-4 px-6 text-sm text-gray-900" data-testid={`text-hours-${record.id}`}>
                  {formatDuration(record.hoursWorked)}
                </td>
                <td className="py-4 px-6">
                  <Badge className={getStatusColor(record.status)} data-testid={`badge-status-${record.id}`}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredAttendance.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No attendance records found for {selectedDate}
          </div>
        )}
      </div>
    </Card>
  );
}
