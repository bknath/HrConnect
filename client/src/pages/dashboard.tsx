import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, Calendar, Building } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  pendingLeaves: number;
  departments: number;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentLeaves } = useQuery({
    queryKey: ["/api/leave-requests"],
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-4" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const attendanceRate = stats ? (stats.presentToday / stats.totalEmployees * 100).toFixed(1) : 0;

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-total-employees">
                  {stats?.totalEmployees || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="text-primary h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-success">Active employees</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present Today</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-present-today">
                  {stats?.presentToday || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-success h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-600">{attendanceRate}% attendance</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Leaves</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-pending-leaves">
                  {stats?.pendingLeaves || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <Calendar className="text-warning h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-warning">Needs review</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-departments">
                  {stats?.departments || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Building className="text-accent h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-600">Active departments</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Attendance Overview</CardTitle>
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-2">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-600">Attendance chart will be displayed here</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeaves?.slice(0, 3).map((leave: any, index: number) => (
                <div key={leave.id || index} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {leave.employee?.firstName?.[0] || 'U'}{leave.employee?.lastName?.[0] || 'N'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      {leave.employee?.firstName} {leave.employee?.lastName} submitted leave request
                    </p>
                    <p className="text-xs text-gray-600">
                      {leave.appliedAt ? new Date(leave.appliedAt).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </div>
              )) || (
                <div className="text-center text-gray-500 py-4">
                  No recent activities
                </div>
              )}
            </div>
            <button className="w-full mt-4 text-sm text-primary hover:text-primary-dark font-medium">
              View all activities
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
