import { 
  type Department, type InsertDepartment,
  type Employee, type InsertEmployee, type EmployeeWithDepartment,
  type Attendance, type InsertAttendance, type AttendanceWithEmployee,
  type LeaveRequest, type InsertLeaveRequest, type LeaveRequestWithEmployee,
  type LeaveBalance, type InsertLeaveBalance,
  type User, type UpsertUser,
  departments, employees, attendance, leaveRequests, leaveBalances, users
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User operations (required for authentication)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Departments
  async getDepartments(): Promise<Department[]> {
    return await db.select().from(departments);
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    const [department] = await db.select().from(departments).where(eq(departments.id, id));
    return department || undefined;
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const [newDepartment] = await db
      .insert(departments)
      .values(department)
      .returning();
    return newDepartment;
  }

  async updateDepartment(id: string, department: Partial<InsertDepartment>): Promise<Department | undefined> {
    const [updated] = await db
      .update(departments)
      .set(department)
      .where(eq(departments.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDepartment(id: string): Promise<boolean> {
    const result = await db.delete(departments).where(eq(departments.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Employees
  async getEmployees(): Promise<EmployeeWithDepartment[]> {
    const result = await db
      .select({
        id: employees.id,
        firstName: employees.firstName,
        lastName: employees.lastName,
        email: employees.email,
        phone: employees.phone,
        departmentId: employees.departmentId,
        position: employees.position,
        salary: employees.salary,
        hireDate: employees.hireDate,
        status: employees.status,
        avatar: employees.avatar,
        department: departments
      })
      .from(employees)
      .leftJoin(departments, eq(employees.departmentId, departments.id));

    return result.map(row => ({
      ...row,
      department: row.department || undefined
    }));
  }

  async getEmployee(id: string): Promise<EmployeeWithDepartment | undefined> {
    const [result] = await db
      .select({
        id: employees.id,
        firstName: employees.firstName,
        lastName: employees.lastName,
        email: employees.email,
        phone: employees.phone,
        departmentId: employees.departmentId,
        position: employees.position,
        salary: employees.salary,
        hireDate: employees.hireDate,
        status: employees.status,
        avatar: employees.avatar,
        department: departments
      })
      .from(employees)
      .leftJoin(departments, eq(employees.departmentId, departments.id))
      .where(eq(employees.id, id));

    if (!result) return undefined;

    return {
      ...result,
      department: result.department || undefined
    };
  }

  async getEmployeesByDepartment(departmentId: string): Promise<Employee[]> {
    return await db.select().from(employees).where(eq(employees.departmentId, departmentId));
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [newEmployee] = await db
      .insert(employees)
      .values(employee)
      .returning();
    
    // Create default leave balances
    const leaveTypes = ['annual', 'sick', 'personal'];
    const defaultDays = { annual: 25, sick: 10, personal: 5 };
    
    for (const leaveType of leaveTypes) {
      const totalDays = defaultDays[leaveType as keyof typeof defaultDays];
      await db.insert(leaveBalances).values({
        employeeId: newEmployee.id,
        leaveType,
        totalDays,
        usedDays: 0,
        remainingDays: totalDays
      });
    }
    
    return newEmployee;
  }

  async updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const [updated] = await db
      .update(employees)
      .set(employee)
      .where(eq(employees.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const result = await db.delete(employees).where(eq(employees.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Attendance
  async getAttendance(date?: string, employeeId?: string): Promise<AttendanceWithEmployee[]> {
    let query = db
      .select({
        id: attendance.id,
        employeeId: attendance.employeeId,
        date: attendance.date,
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut,
        hoursWorked: attendance.hoursWorked,
        status: attendance.status,
        employee: employees
      })
      .from(attendance)
      .innerJoin(employees, eq(attendance.employeeId, employees.id));

    if (date && employeeId) {
      return await db
        .select({
          id: attendance.id,
          employeeId: attendance.employeeId,
          date: attendance.date,
          checkIn: attendance.checkIn,
          checkOut: attendance.checkOut,
          hoursWorked: attendance.hoursWorked,
          status: attendance.status,
          employee: employees
        })
        .from(attendance)
        .innerJoin(employees, eq(attendance.employeeId, employees.id))
        .where(and(eq(attendance.date, date), eq(attendance.employeeId, employeeId)));
    } else if (date) {
      return await db
        .select({
          id: attendance.id,
          employeeId: attendance.employeeId,
          date: attendance.date,
          checkIn: attendance.checkIn,
          checkOut: attendance.checkOut,
          hoursWorked: attendance.hoursWorked,
          status: attendance.status,
          employee: employees
        })
        .from(attendance)
        .innerJoin(employees, eq(attendance.employeeId, employees.id))
        .where(eq(attendance.date, date));
    } else if (employeeId) {
      return await db
        .select({
          id: attendance.id,
          employeeId: attendance.employeeId,
          date: attendance.date,
          checkIn: attendance.checkIn,
          checkOut: attendance.checkOut,
          hoursWorked: attendance.hoursWorked,
          status: attendance.status,
          employee: employees
        })
        .from(attendance)
        .innerJoin(employees, eq(attendance.employeeId, employees.id))
        .where(eq(attendance.employeeId, employeeId));
    }

    return await query;
  }

  async getEmployeeAttendance(employeeId: string, startDate: string, endDate: string): Promise<Attendance[]> {
    return await db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.employeeId, employeeId),
          gte(attendance.date, startDate),
          lte(attendance.date, endDate)
        )
      );
  }

  async createAttendance(attendanceData: InsertAttendance): Promise<Attendance> {
    const [newAttendance] = await db
      .insert(attendance)
      .values(attendanceData)
      .returning();
    return newAttendance;
  }

  async updateAttendance(id: string, attendanceData: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const [updated] = await db
      .update(attendance)
      .set(attendanceData)
      .where(eq(attendance.id, id))
      .returning();
    return updated || undefined;
  }

  // Leave Requests
  async getLeaveRequests(status?: string): Promise<LeaveRequestWithEmployee[]> {
    let query = db
      .select({
        id: leaveRequests.id,
        employeeId: leaveRequests.employeeId,
        leaveType: leaveRequests.leaveType,
        startDate: leaveRequests.startDate,
        endDate: leaveRequests.endDate,
        days: leaveRequests.days,
        reason: leaveRequests.reason,
        status: leaveRequests.status,
        appliedAt: leaveRequests.appliedAt,
        reviewedAt: leaveRequests.reviewedAt,
        reviewedBy: leaveRequests.reviewedBy,
        employee: employees
      })
      .from(leaveRequests)
      .innerJoin(employees, eq(leaveRequests.employeeId, employees.id));

    if (status) {
      return await db
        .select({
          id: leaveRequests.id,
          employeeId: leaveRequests.employeeId,
          leaveType: leaveRequests.leaveType,
          startDate: leaveRequests.startDate,
          endDate: leaveRequests.endDate,
          days: leaveRequests.days,
          reason: leaveRequests.reason,
          status: leaveRequests.status,
          appliedAt: leaveRequests.appliedAt,
          reviewedAt: leaveRequests.reviewedAt,
          reviewedBy: leaveRequests.reviewedBy,
          employee: employees
        })
        .from(leaveRequests)
        .innerJoin(employees, eq(leaveRequests.employeeId, employees.id))
        .where(eq(leaveRequests.status, status));
    }

    return await db
      .select({
        id: leaveRequests.id,
        employeeId: leaveRequests.employeeId,
        leaveType: leaveRequests.leaveType,
        startDate: leaveRequests.startDate,
        endDate: leaveRequests.endDate,
        days: leaveRequests.days,
        reason: leaveRequests.reason,
        status: leaveRequests.status,
        appliedAt: leaveRequests.appliedAt,
        reviewedAt: leaveRequests.reviewedAt,
        reviewedBy: leaveRequests.reviewedBy,
        employee: employees
      })
      .from(leaveRequests)
      .innerJoin(employees, eq(leaveRequests.employeeId, employees.id));
  }

  async getEmployeeLeaveRequests(employeeId: string): Promise<LeaveRequest[]> {
    return await db
      .select()
      .from(leaveRequests)
      .where(eq(leaveRequests.employeeId, employeeId));
  }

  async createLeaveRequest(leaveRequest: InsertLeaveRequest): Promise<LeaveRequest> {
    const [newLeaveRequest] = await db
      .insert(leaveRequests)
      .values(leaveRequest)
      .returning();
    return newLeaveRequest;
  }

  async updateLeaveRequest(id: string, leaveRequest: Partial<LeaveRequest>): Promise<LeaveRequest | undefined> {
    const [updated] = await db
      .update(leaveRequests)
      .set(leaveRequest)
      .where(eq(leaveRequests.id, id))
      .returning();
    return updated || undefined;
  }

  // Leave Balances
  async getLeaveBalance(employeeId: string, leaveType: string): Promise<LeaveBalance | undefined> {
    const [balance] = await db
      .select()
      .from(leaveBalances)
      .where(
        and(
          eq(leaveBalances.employeeId, employeeId),
          eq(leaveBalances.leaveType, leaveType)
        )
      );
    return balance || undefined;
  }

  async getEmployeeLeaveBalances(employeeId: string): Promise<LeaveBalance[]> {
    return await db
      .select()
      .from(leaveBalances)
      .where(eq(leaveBalances.employeeId, employeeId));
  }

  async createLeaveBalance(leaveBalance: InsertLeaveBalance): Promise<LeaveBalance> {
    const [newLeaveBalance] = await db
      .insert(leaveBalances)
      .values(leaveBalance)
      .returning();
    return newLeaveBalance;
  }

  async updateLeaveBalance(id: string, leaveBalance: Partial<InsertLeaveBalance>): Promise<LeaveBalance | undefined> {
    const [updated] = await db
      .update(leaveBalances)
      .set(leaveBalance)
      .where(eq(leaveBalances.id, id))
      .returning();
    return updated || undefined;
  }
}