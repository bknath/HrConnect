import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { LeaveRequestWithEmployee } from "@shared/schema";

export default function LeaveManagement() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: leaveRequests, isLoading } = useQuery<LeaveRequestWithEmployee[]>({
    queryKey: ["/api/leave-requests"],
  });

  const updateLeaveRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PUT", `/api/leave-requests/${id}`, { 
        status,
        reviewedAt: new Date().toISOString(),
        reviewedBy: "current-user-id" // In a real app, this would be the current user's ID
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Leave request updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update leave request", variant: "destructive" });
    }
  });

  const filteredRequests = leaveRequests?.filter(request => 
    statusFilter === "all" || request.status === statusFilter
  ) || [];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "pending": "bg-yellow-100 text-yellow-800",
      "approved": "bg-green-100 text-green-800",
      "rejected": "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getLeaveTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "annual": "bg-blue-100 text-blue-800",
      "sick": "bg-red-100 text-red-800", 
      "personal": "bg-purple-100 text-purple-800",
      "emergency": "bg-orange-100 text-orange-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleApprove = (id: string) => {
    updateLeaveRequestMutation.mutate({ id, status: "approved" });
  };

  const handleReject = (id: string) => {
    updateLeaveRequestMutation.mutate({ id, status: "rejected" });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const pendingCount = leaveRequests?.filter(r => r.status === 'pending').length || 0;
  const thisMonthCount = leaveRequests?.filter(r => {
    const requestDate = new Date(r.appliedAt || '');
    const thisMonth = new Date();
    return requestDate.getMonth() === thisMonth.getMonth() && 
           requestDate.getFullYear() === thisMonth.getFullYear();
  }).length || 0;

  const avgDays = leaveRequests?.length 
    ? (leaveRequests.reduce((sum, r) => sum + r.days, 0) / leaveRequests.length).toFixed(1)
    : "0";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Leave Requests */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Leave Requests</CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36" data-testid="select-leave-status-filter">
                  <SelectValue placeholder="All Requests" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary-dark text-white" data-testid="button-new-leave-request">
                    <Plus className="h-4 w-4 mr-2" />
                    New Request
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Leave Request</DialogTitle>
                  </DialogHeader>
                  <div className="text-center text-gray-500 py-4">
                    Leave request form would be implemented here
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50" data-testid={`card-leave-request-${request.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {request.employee.firstName[0]}{request.employee.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900" data-testid={`text-leave-type-${request.id}`}>
                          {request.leaveType.charAt(0).toUpperCase() + request.leaveType.slice(1)} Leave Request
                        </h4>
                        <Badge className={getLeaveTypeColor(request.leaveType)}>
                          {request.leaveType}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600" data-testid={`text-employee-info-${request.id}`}>
                        {request.employee.firstName} {request.employee.lastName} • {request.employee.position}
                      </p>
                      <p className="text-sm text-gray-600 mt-1" data-testid={`text-leave-dates-${request.id}`}>
                        {formatDate(request.startDate)} - {formatDate(request.endDate)} ({request.days} days)
                      </p>
                      {request.reason && (
                        <p className="text-sm text-gray-500 mt-2" data-testid={`text-leave-reason-${request.id}`}>
                          {request.reason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(request.status)} data-testid={`badge-leave-status-${request.id}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                    {request.status === 'pending' && (
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          className="bg-green-100 text-green-800 hover:bg-green-200"
                          onClick={() => handleApprove(request.id)}
                          disabled={updateLeaveRequestMutation.isPending}
                          data-testid={`button-approve-leave-${request.id}`}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(request.id)}
                          disabled={updateLeaveRequestMutation.isPending}
                          data-testid={`button-reject-leave-${request.id}`}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredRequests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {statusFilter === "all" 
                  ? "No leave requests found" 
                  : `No ${statusFilter} leave requests found`
                }
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leave Summary */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Leave Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Annual Leave</span>
                <span className="text-sm font-medium text-gray-900">18/25 days</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
            
            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sick Leave</span>
                <span className="text-sm font-medium text-gray-900">3/10 days</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-warning h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Requests</span>
                <span className="text-2xl font-bold text-warning" data-testid="stat-pending-requests">
                  {pendingCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="text-2xl font-bold text-primary" data-testid="stat-this-month">
                  {thisMonthCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Days</span>
                <span className="text-2xl font-bold text-gray-900" data-testid="stat-average-days">
                  {avgDays}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
