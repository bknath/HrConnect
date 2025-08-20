import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, FileText, TrendingUp } from "lucide-react";

export default function Reports() {
  const [reportType, setReportType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: employees } = useQuery({
    queryKey: ["/api/employees"],
  });

  const { data: leaveRequests } = useQuery({
    queryKey: ["/api/leave-requests"],
  });

  const { data: departments } = useQuery({
    queryKey: ["/api/departments"],
  });

  const { data: attendance } = useQuery({
    queryKey: ["/api/attendance"],
  });

  const generateReport = () => {
    // In a real app, this would generate and download the report
    console.log("Generating report:", { reportType, startDate, endDate });
  };

  // Calculate report statistics
  const totalEmployees = employees?.length || 0;
  const totalLeaveRequests = leaveRequests?.length || 0;
  const totalDepartments = departments?.length || 0;
  const presentToday = attendance?.filter((a: any) => a.status === 'present').length || 0;
  const attendanceRate = totalEmployees > 0 ? ((presentToday / totalEmployees) * 100).toFixed(1) : "0";

  const thisMonthLeaves = leaveRequests?.filter((req: any) => {
    const reqDate = new Date(req.appliedAt || '');
    const thisMonth = new Date();
    return reqDate.getMonth() === thisMonth.getMonth() && 
           reqDate.getFullYear() === thisMonth.getFullYear();
  }).length || 0;

  const totalLeaveDays = leaveRequests?.reduce((sum: number, req: any) => sum + req.days, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger data-testid="select-report-type">
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="attendance">Attendance Report</SelectItem>
                <SelectItem value="leave">Leave Report</SelectItem>
                <SelectItem value="employee">Employee Report</SelectItem>
                <SelectItem value="department">Department Report</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              data-testid="input-start-date"
            />
            
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              data-testid="input-end-date"
            />
            
            <Button 
              onClick={generateReport}
              disabled={!reportType}
              className="bg-primary hover:bg-primary-dark text-white"
              data-testid="button-generate-report"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Reports */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Monthly Attendance</h4>
              <Button variant="ghost" size="sm" data-testid="button-download-attendance-report">
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Detailed attendance records for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
            <div className="text-2xl font-bold text-primary mb-2" data-testid="text-attendance-rate">
              {attendanceRate}%
            </div>
            <p className="text-sm text-gray-600">Average attendance rate</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Leave Summary</h4>
              <Button variant="ghost" size="sm" data-testid="button-download-leave-report">
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Leave utilization and patterns
            </p>
            <div className="text-2xl font-bold text-warning mb-2" data-testid="text-total-leave-days">
              {totalLeaveDays}
            </div>
            <p className="text-sm text-gray-600">Total days taken this month</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Department Stats</h4>
              <Button variant="ghost" size="sm" data-testid="button-download-department-report">
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Performance by department
            </p>
            <div className="text-2xl font-bold text-success mb-2" data-testid="text-active-departments">
              {totalDepartments}
            </div>
            <p className="text-sm text-gray-600">Active departments</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              Employee Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-600">Employee growth chart would be displayed here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Total Employees</span>
                <span className="text-lg font-bold text-gray-900" data-testid="metric-total-employees">
                  {totalEmployees}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Leave Requests This Month</span>
                <span className="text-lg font-bold text-gray-900" data-testid="metric-monthly-leaves">
                  {thisMonthLeaves}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Average Attendance Rate</span>
                <span className="text-lg font-bold text-gray-900" data-testid="metric-avg-attendance">
                  {attendanceRate}%
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Active Departments</span>
                <span className="text-lg font-bold text-gray-900" data-testid="metric-active-departments">
                  {totalDepartments}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
