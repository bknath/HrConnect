import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEmployeeSchema, insertDepartmentSchema, insertLeaveRequestSchema, insertAttendanceSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication first
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Departments (protected)
  app.get("/api/departments", isAuthenticated, async (req, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  app.post("/api/departments", isAuthenticated, async (req, res) => {
    try {
      const departmentData = insertDepartmentSchema.parse(req.body);
      const department = await storage.createDepartment(departmentData);
      res.status(201).json(department);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid department data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create department" });
      }
    }
  });

  // Employees (protected)
  app.get("/api/employees", isAuthenticated, async (req, res) => {
    try {
      const { department } = req.query;
      let employees;
      
      if (department) {
        const deptEmployees = await storage.getEmployeesByDepartment(department as string);
        employees = deptEmployees.map(emp => ({ ...emp, department: undefined }));
      } else {
        employees = await storage.getEmployees();
      }
      
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.get("/api/employees/:id", isAuthenticated, async (req, res) => {
    try {
      const employee = await storage.getEmployee(req.params.id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });

  app.post("/api/employees", isAuthenticated, async (req, res) => {
    try {
      const employeeData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(employeeData);
      res.status(201).json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create employee" });
      }
    }
  });

  app.put("/api/employees/:id", isAuthenticated, async (req, res) => {
    try {
      const employeeData = insertEmployeeSchema.partial().parse(req.body);
      const employee = await storage.updateEmployee(req.params.id, employeeData);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update employee" });
      }
    }
  });

  // Attendance (protected)
  app.get("/api/attendance", isAuthenticated, async (req, res) => {
    try {
      const { date, employeeId } = req.query;
      const attendance = await storage.getAttendance(
        date as string | undefined, 
        employeeId as string | undefined
      );
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.post("/api/attendance", isAuthenticated, async (req, res) => {
    try {
      const attendanceData = insertAttendanceSchema.parse(req.body);
      const attendance = await storage.createAttendance(attendanceData);
      res.status(201).json(attendance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid attendance data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create attendance record" });
      }
    }
  });

  // Leave Requests (protected)
  app.get("/api/leave-requests", isAuthenticated, async (req, res) => {
    try {
      const { status } = req.query;
      const leaveRequests = await storage.getLeaveRequests(status as string | undefined);
      res.json(leaveRequests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leave requests" });
    }
  });

  app.post("/api/leave-requests", isAuthenticated, async (req, res) => {
    try {
      const leaveRequestData = insertLeaveRequestSchema.parse(req.body);
      const leaveRequest = await storage.createLeaveRequest(leaveRequestData);
      res.status(201).json(leaveRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid leave request data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create leave request" });
      }
    }
  });

  app.put("/api/leave-requests/:id", isAuthenticated, async (req, res) => {
    try {
      const updates = req.body;
      const leaveRequest = await storage.updateLeaveRequest(req.params.id, updates);
      if (!leaveRequest) {
        return res.status(404).json({ message: "Leave request not found" });
      }
      res.json(leaveRequest);
    } catch (error) {
      res.status(500).json({ message: "Failed to update leave request" });
    }
  });

  // Leave Balances (protected)
  app.get("/api/employees/:employeeId/leave-balances", isAuthenticated, async (req, res) => {
    try {
      const balances = await storage.getEmployeeLeaveBalances(req.params.employeeId);
      res.json(balances);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leave balances" });
    }
  });

  // Dashboard Stats (protected)
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      const departments = await storage.getDepartments();
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = await storage.getAttendance(today);
      const pendingLeaves = await storage.getLeaveRequests("pending");

      const stats = {
        totalEmployees: employees.length,
        presentToday: todayAttendance.filter(a => a.status === 'present').length,
        pendingLeaves: pendingLeaves.length,
        departments: departments.length
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
