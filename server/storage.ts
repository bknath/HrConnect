import { 
  type Department, type InsertDepartment,
  type Employee, type InsertEmployee, type EmployeeWithDepartment,
  type Attendance, type InsertAttendance, type AttendanceWithEmployee,
  type LeaveRequest, type InsertLeaveRequest, type LeaveRequestWithEmployee,
  type LeaveBalance, type InsertLeaveBalance,
  type User, type UpsertUser,
  departments, employees, attendance, leaveRequests, leaveBalances, users
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (required for authentication)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Departments
  getDepartments(): Promise<Department[]>;
  getDepartment(id: string): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: string, department: Partial<InsertDepartment>): Promise<Department | undefined>;
  deleteDepartment(id: string): Promise<boolean>;

  // Employees
  getEmployees(): Promise<EmployeeWithDepartment[]>;
  getEmployee(id: string): Promise<EmployeeWithDepartment | undefined>;
  getEmployeesByDepartment(departmentId: string): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: string): Promise<boolean>;

  // Attendance
  getAttendance(date?: string, employeeId?: string): Promise<AttendanceWithEmployee[]>;
  getEmployeeAttendance(employeeId: string, startDate: string, endDate: string): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, attendance: Partial<InsertAttendance>): Promise<Attendance | undefined>;

  // Leave Requests
  getLeaveRequests(status?: string): Promise<LeaveRequestWithEmployee[]>;
  getEmployeeLeaveRequests(employeeId: string): Promise<LeaveRequest[]>;
  createLeaveRequest(leaveRequest: InsertLeaveRequest): Promise<LeaveRequest>;
  updateLeaveRequest(id: string, leaveRequest: Partial<LeaveRequest>): Promise<LeaveRequest | undefined>;

  // Leave Balances
  getLeaveBalance(employeeId: string, leaveType: string): Promise<LeaveBalance | undefined>;
  getEmployeeLeaveBalances(employeeId: string): Promise<LeaveBalance[]>;
  createLeaveBalance(leaveBalance: InsertLeaveBalance): Promise<LeaveBalance>;
  updateLeaveBalance(id: string, leaveBalance: Partial<InsertLeaveBalance>): Promise<LeaveBalance | undefined>;
}

export class MemStorage implements IStorage {
  private departments: Map<string, Department> = new Map();
  private employees: Map<string, Employee> = new Map();
  private attendance: Map<string, Attendance> = new Map();
  private leaveRequests: Map<string, LeaveRequest> = new Map();
  private leaveBalances: Map<string, LeaveBalance> = new Map();
  private users: Map<string, User> = new Map();

  constructor() {
    this.initializeData();
  }

  // User operations (required for authentication)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const userId = userData.id || randomUUID();
    const existingUser = this.users.get(userId);
    const user: User = {
      id: userId,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      role: userData.role || "employee",
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userId, user);
    return user;
  }

  private initializeData() {
    // Initialize with some departments
    const deptId1 = randomUUID();
    const deptId2 = randomUUID();
    const deptId3 = randomUUID();
    
    this.departments.set(deptId1, {
      id: deptId1,
      name: "Engineering",
      description: "Software development and technical operations",
      managerId: null,
      budget: 450000
    });
    
    this.departments.set(deptId2, {
      id: deptId2,
      name: "Marketing",
      description: "Brand promotion and customer acquisition",
      managerId: null,
      budget: 280000
    });
    
    this.departments.set(deptId3, {
      id: deptId3,
      name: "Sales",
      description: "Revenue generation and client relations",
      managerId: null,
      budget: 320000
    });
  }

  // Departments
  async getDepartments(): Promise<Department[]> {
    return Array.from(this.departments.values());
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    return this.departments.get(id);
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const id = randomUUID();
    const newDepartment: Department = { 
      ...department, 
      id,
      description: department.description || null,
      managerId: department.managerId || null,
      budget: department.budget || null
    };
    this.departments.set(id, newDepartment);
    return newDepartment;
  }

  async updateDepartment(id: string, department: Partial<InsertDepartment>): Promise<Department | undefined> {
    const existing = this.departments.get(id);
    if (!existing) return undefined;
    
    const updated: Department = { ...existing, ...department };
    this.departments.set(id, updated);
    return updated;
  }

  async deleteDepartment(id: string): Promise<boolean> {
    return this.departments.delete(id);
  }

  // Employees
  async getEmployees(): Promise<EmployeeWithDepartment[]> {
    const employees = Array.from(this.employees.values());
    return employees.map(employee => ({
      ...employee,
      department: employee.departmentId ? this.departments.get(employee.departmentId) : undefined
    }));
  }

  async getEmployee(id: string): Promise<EmployeeWithDepartment | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;
    
    return {
      ...employee,
      department: employee.departmentId ? this.departments.get(employee.departmentId) : undefined
    };
  }

  async getEmployeesByDepartment(departmentId: string): Promise<Employee[]> {
    return Array.from(this.employees.values()).filter(emp => emp.departmentId === departmentId);
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    const newEmployee: Employee = { 
      ...employee, 
      id,
      phone: employee.phone || null,
      departmentId: employee.departmentId || null,
      salary: employee.salary || null,
      avatar: employee.avatar || null,
      status: employee.status || "active"
    };
    this.employees.set(id, newEmployee);
    
    // Create default leave balances
    const leaveTypes = ['annual', 'sick', 'personal'];
    const defaultDays = { annual: 25, sick: 10, personal: 5 };
    
    for (const leaveType of leaveTypes) {
      const balanceId = randomUUID();
      const totalDays = defaultDays[leaveType as keyof typeof defaultDays];
      this.leaveBalances.set(balanceId, {
        id: balanceId,
        employeeId: id,
        leaveType,
        totalDays,
        usedDays: 0,
        remainingDays: totalDays
      });
    }
    
    return newEmployee;
  }

  async updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const existing = this.employees.get(id);
    if (!existing) return undefined;
    
    const updated: Employee = { ...existing, ...employee };
    this.employees.set(id, updated);
    return updated;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    return this.employees.delete(id);
  }

  // Attendance
  async getAttendance(date?: string, employeeId?: string): Promise<AttendanceWithEmployee[]> {
    let records = Array.from(this.attendance.values());
    
    if (date) {
      records = records.filter(record => record.date === date);
    }
    if (employeeId) {
      records = records.filter(record => record.employeeId === employeeId);
    }
    
    return records.map(record => ({
      ...record,
      employee: this.employees.get(record.employeeId)!
    })).filter(record => record.employee);
  }

  async getEmployeeAttendance(employeeId: string, startDate: string, endDate: string): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(record => 
      record.employeeId === employeeId &&
      record.date >= startDate &&
      record.date <= endDate
    );
  }

  async createAttendance(attendance: InsertAttendance): Promise<Attendance> {
    const id = randomUUID();
    const newAttendance: Attendance = { 
      ...attendance, 
      id,
      checkIn: attendance.checkIn || null,
      checkOut: attendance.checkOut || null,
      hoursWorked: attendance.hoursWorked || null
    };
    this.attendance.set(id, newAttendance);
    return newAttendance;
  }

  async updateAttendance(id: string, attendance: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const existing = this.attendance.get(id);
    if (!existing) return undefined;
    
    const updated: Attendance = { ...existing, ...attendance };
    this.attendance.set(id, updated);
    return updated;
  }

  // Leave Requests
  async getLeaveRequests(status?: string): Promise<LeaveRequestWithEmployee[]> {
    let requests = Array.from(this.leaveRequests.values());
    
    if (status) {
      requests = requests.filter(request => request.status === status);
    }
    
    return requests.map(request => ({
      ...request,
      employee: this.employees.get(request.employeeId)!
    })).filter(request => request.employee);
  }

  async getEmployeeLeaveRequests(employeeId: string): Promise<LeaveRequest[]> {
    return Array.from(this.leaveRequests.values()).filter(request => 
      request.employeeId === employeeId
    );
  }

  async createLeaveRequest(leaveRequest: InsertLeaveRequest): Promise<LeaveRequest> {
    const id = randomUUID();
    const newLeaveRequest: LeaveRequest = { 
      ...leaveRequest, 
      id,
      status: leaveRequest.status || "pending",
      reason: leaveRequest.reason || null,
      appliedAt: new Date() as any,
      reviewedAt: null,
      reviewedBy: null
    };
    this.leaveRequests.set(id, newLeaveRequest);
    return newLeaveRequest;
  }

  async updateLeaveRequest(id: string, leaveRequest: Partial<LeaveRequest>): Promise<LeaveRequest | undefined> {
    const existing = this.leaveRequests.get(id);
    if (!existing) return undefined;
    
    const updated: LeaveRequest = { ...existing, ...leaveRequest };
    this.leaveRequests.set(id, updated);
    return updated;
  }

  // Leave Balances
  async getLeaveBalance(employeeId: string, leaveType: string): Promise<LeaveBalance | undefined> {
    return Array.from(this.leaveBalances.values()).find(balance => 
      balance.employeeId === employeeId && balance.leaveType === leaveType
    );
  }

  async getEmployeeLeaveBalances(employeeId: string): Promise<LeaveBalance[]> {
    return Array.from(this.leaveBalances.values()).filter(balance => 
      balance.employeeId === employeeId
    );
  }

  async createLeaveBalance(leaveBalance: InsertLeaveBalance): Promise<LeaveBalance> {
    const id = randomUUID();
    const newLeaveBalance: LeaveBalance = { 
      ...leaveBalance, 
      id,
      usedDays: leaveBalance.usedDays || 0 
    };
    this.leaveBalances.set(id, newLeaveBalance);
    return newLeaveBalance;
  }

  async updateLeaveBalance(id: string, leaveBalance: Partial<InsertLeaveBalance>): Promise<LeaveBalance | undefined> {
    const existing = this.leaveBalances.get(id);
    if (!existing) return undefined;
    
    const updated: LeaveBalance = { ...existing, ...leaveBalance };
    this.leaveBalances.set(id, updated);
    return updated;
  }
}

import { DatabaseStorage } from "./database-storage";

// Use MemStorage for local development, DatabaseStorage for production
const isLocalDevelopment = !process.env.REPLIT_DOMAINS;

export const storage = isLocalDevelopment ? new MemStorage() : new DatabaseStorage();
