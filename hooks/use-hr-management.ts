import { useState, useEffect, useMemo } from 'react';
import {
  Employee,
  EmployeeEvaluation,
  PayrollRecord,
  TimeEntry,
  Department,
} from '@/types/crm';

type EmployeeFilters = {
  status?: 'active' | 'inactive' | 'on_leave' | 'terminated';
  department?: string;
  employmentType?: 'full_time' | 'part_time' | 'contractor' | 'intern';
  search?: string;
};

export function useHRManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [evaluations, setEvaluations] = useState<EmployeeEvaluation[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<EmployeeFilters>({});

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    const mockDepartments: Department[] = [
      {
        id: 'dept1',
        name: 'Ventas',
        description: 'Equipo de ventas y atención al cliente',
        managerId: 'emp1',
        managerName: 'María García',
        employeeCount: 5,
        budget: 50000,
        currency: 'COP',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'dept2',
        name: 'Servicios',
        description: 'Prestación de servicios',
        managerId: 'emp2',
        managerName: 'Carlos Rodríguez',
        employeeCount: 8,
        budget: 75000,
        currency: 'COP',
        createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'dept3',
        name: 'Administración',
        description: 'Gestión administrativa',
        managerId: 'emp3',
        managerName: 'Ana López',
        employeeCount: 3,
        budget: 40000,
        currency: 'COP',
        createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const mockEmployees: Employee[] = [
      {
        id: 'emp1',
        firstName: 'María',
        lastName: 'García',
        email: 'maria.garcia@example.com',
        phone: '+57 300 123 4567',
        position: 'Gerente de Ventas',
        department: 'Ventas',
        hireDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        salary: 4500000,
        currency: 'COP',
        employmentType: 'full_time',
        schedule: {
          monday: { start: '08:00', end: '17:00' },
          tuesday: { start: '08:00', end: '17:00' },
          wednesday: { start: '08:00', end: '17:00' },
          thursday: { start: '08:00', end: '17:00' },
          friday: { start: '08:00', end: '17:00' },
        },
        permissions: ['view_reports', 'manage_team', 'approve_requests'],
        documents: [
          {
            id: 'doc1',
            name: 'Contrato de Trabajo',
            type: 'application/pdf',
            url: 'https://example.com/contract1.pdf',
            uploadDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        emergencyContact: {
          name: 'Pedro García',
          relationship: 'Esposo',
          phone: '+57 300 987 6543',
        },
        notes: 'Empleada destacada con excelente desempeño',
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'emp2',
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        email: 'carlos.rodriguez@example.com',
        phone: '+57 301 234 5678',
        position: 'Supervisor de Servicios',
        department: 'Servicios',
        hireDate: new Date(Date.now() - 540 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        salary: 3800000,
        currency: 'COP',
        employmentType: 'full_time',
        schedule: {
          monday: { start: '07:00', end: '16:00' },
          tuesday: { start: '07:00', end: '16:00' },
          wednesday: { start: '07:00', end: '16:00' },
          thursday: { start: '07:00', end: '16:00' },
          friday: { start: '07:00', end: '16:00' },
          saturday: { start: '08:00', end: '12:00' },
        },
        permissions: ['view_schedules', 'manage_services'],
        documents: [],
        emergencyContact: {
          name: 'Laura Rodríguez',
          relationship: 'Hermana',
          phone: '+57 302 345 6789',
        },
        notes: '',
        createdAt: new Date(Date.now() - 540 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'emp3',
        firstName: 'Ana',
        lastName: 'López',
        email: 'ana.lopez@example.com',
        phone: '+57 303 456 7890',
        position: 'Contadora',
        department: 'Administración',
        hireDate: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        salary: 4000000,
        currency: 'COP',
        employmentType: 'full_time',
        schedule: {
          monday: { start: '08:00', end: '17:00' },
          tuesday: { start: '08:00', end: '17:00' },
          wednesday: { start: '08:00', end: '17:00' },
          thursday: { start: '08:00', end: '17:00' },
          friday: { start: '08:00', end: '14:00' },
        },
        permissions: ['view_financials', 'manage_payroll'],
        documents: [],
        emergencyContact: {
          name: 'Roberto López',
          relationship: 'Padre',
          phone: '+57 304 567 8901',
        },
        notes: 'Certificación contable actualizada',
        createdAt: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'emp4',
        firstName: 'Luis',
        lastName: 'Martínez',
        email: 'luis.martinez@example.com',
        phone: '+57 305 678 9012',
        position: 'Asesor de Ventas',
        department: 'Ventas',
        hireDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        salary: 2500000,
        currency: 'COP',
        employmentType: 'full_time',
        schedule: {
          monday: { start: '09:00', end: '18:00' },
          tuesday: { start: '09:00', end: '18:00' },
          wednesday: { start: '09:00', end: '18:00' },
          thursday: { start: '09:00', end: '18:00' },
          friday: { start: '09:00', end: '18:00' },
        },
        permissions: ['view_products'],
        documents: [],
        emergencyContact: {
          name: 'Sandra Martínez',
          relationship: 'Madre',
          phone: '+57 306 789 0123',
        },
        notes: '',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'emp5',
        firstName: 'Sofia',
        lastName: 'Hernández',
        email: 'sofia.hernandez@example.com',
        phone: '+57 307 890 1234',
        position: 'Técnico de Servicio',
        department: 'Servicios',
        hireDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        salary: 2200000,
        currency: 'COP',
        employmentType: 'part_time',
        schedule: {
          monday: { start: '14:00', end: '20:00' },
          wednesday: { start: '14:00', end: '20:00' },
          friday: { start: '14:00', end: '20:00' },
        },
        permissions: ['view_services'],
        documents: [],
        emergencyContact: {
          name: 'Miguel Hernández',
          relationship: 'Esposo',
          phone: '+57 308 901 2345',
        },
        notes: 'Medio tiempo - estudiante universitaria',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const mockEvaluations: EmployeeEvaluation[] = [
      {
        id: 'eval1',
        employeeId: 'emp1',
        evaluatorId: 'admin1',
        evaluatorName: 'Director General',
        period: '2024 Q4',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        categories: [
          {
            name: 'Liderazgo',
            score: 9,
            maxScore: 10,
            comments: 'Excelente capacidad de liderazgo',
          },
          {
            name: 'Comunicación',
            score: 8,
            maxScore: 10,
            comments: 'Muy buena comunicación con el equipo',
          },
          {
            name: 'Resultados',
            score: 9,
            maxScore: 10,
            comments: 'Superó las metas del trimestre',
          },
        ],
        overallScore: 8.7,
        strengths: ['Liderazgo', 'Orientación a resultados', 'Trabajo en equipo'],
        areasForImprovement: ['Gestión del tiempo', 'Delegación de tareas'],
        goals: ['Aumentar ventas 15%', 'Capacitar nuevo personal', 'Implementar CRM'],
        comments: 'Desempeño sobresaliente durante el período evaluado',
        status: 'completed',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const mockPayroll: PayrollRecord[] = [
      {
        id: 'pay1',
        employeeId: 'emp1',
        employeeName: 'María García',
        period: '2025-01',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        baseSalary: 4500000,
        bonuses: [{ description: 'Bono por cumplimiento de metas', amount: 500000 }],
        deductions: [
          { description: 'Salud', amount: 180000 },
          { description: 'Pensión', amount: 180000 },
        ],
        overtime: { hours: 10, rate: 25000, amount: 250000 },
        totalEarnings: 5250000,
        totalDeductions: 360000,
        netPay: 4890000,
        currency: 'COP',
        status: 'paid',
        paymentDate: '2025-01-30',
        paymentMethod: 'Transferencia bancaria',
        notes: '',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'pay2',
        employeeId: 'emp2',
        employeeName: 'Carlos Rodríguez',
        period: '2025-01',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        baseSalary: 3800000,
        bonuses: [],
        deductions: [
          { description: 'Salud', amount: 152000 },
          { description: 'Pensión', amount: 152000 },
        ],
        overtime: { hours: 15, rate: 22000, amount: 330000 },
        totalEarnings: 4130000,
        totalDeductions: 304000,
        netPay: 3826000,
        currency: 'COP',
        status: 'paid',
        paymentDate: '2025-01-30',
        paymentMethod: 'Transferencia bancaria',
        notes: '',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const mockTimeEntries: TimeEntry[] = [
      {
        id: 'time1',
        employeeId: 'emp1',
        employeeName: 'María García',
        date: new Date().toISOString().split('T')[0],
        clockIn: '08:00',
        clockOut: '17:30',
        breakDuration: 60,
        totalHours: 8.5,
        status: 'completed',
        notes: '',
      },
      {
        id: 'time2',
        employeeId: 'emp2',
        employeeName: 'Carlos Rodríguez',
        date: new Date().toISOString().split('T')[0],
        clockIn: '07:00',
        clockOut: '16:15',
        breakDuration: 45,
        totalHours: 8.5,
        status: 'completed',
        notes: 'Horas extra aprobadas',
      },
      {
        id: 'time3',
        employeeId: 'emp4',
        employeeName: 'Luis Martínez',
        date: new Date().toISOString().split('T')[0],
        clockIn: '09:00',
        status: 'active',
        breakDuration: 0,
        notes: '',
      },
    ];

    setDepartments(mockDepartments);
    setEmployees(mockEmployees);
    setEvaluations(mockEvaluations);
    setPayrollRecords(mockPayroll);
    setTimeEntries(mockTimeEntries);
    setLoading(false);
  };

  const filteredEmployees = useMemo(() => {
    let result = [...employees];

    if (filters.status) {
      result = result.filter((emp) => emp.status === filters.status);
    }

    if (filters.department) {
      result = result.filter((emp) => emp.department === filters.department);
    }

    if (filters.employmentType) {
      result = result.filter((emp) => emp.employmentType === filters.employmentType);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (emp) =>
          emp.firstName.toLowerCase().includes(search) ||
          emp.lastName.toLowerCase().includes(search) ||
          emp.email.toLowerCase().includes(search) ||
          emp.position.toLowerCase().includes(search)
      );
    }

    return result;
  }, [employees, filters]);

  const stats = useMemo(() => {
    const activeEmployees = employees.filter((e) => e.status === 'active').length;
    const totalPayroll = payrollRecords
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + p.netPay, 0);
    const avgSalary =
      employees.length > 0
        ? employees.reduce((sum, e) => sum + e.salary, 0) / employees.length
        : 0;
    const pendingEvaluations = evaluations.filter((e) => e.status === 'draft').length;

    return {
      activeEmployees,
      totalEmployees: employees.length,
      totalPayroll,
      avgSalary,
      pendingEvaluations,
      departmentCount: departments.length,
    };
  }, [employees, payrollRecords, evaluations, departments]);

  const addEmployee = (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEmployee: Employee = {
      ...employee,
      id: `emp${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEmployees([...employees, newEmployee]);
    console.log('Employee added:', newEmployee.id);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(
      employees.map((emp) =>
        emp.id === id
          ? { ...emp, ...updates, updatedAt: new Date().toISOString() }
          : emp
      )
    );
    console.log('Employee updated:', id);
  };

  const addEvaluation = (
    evaluation: Omit<EmployeeEvaluation, 'id' | 'createdAt'>
  ) => {
    const newEvaluation: EmployeeEvaluation = {
      ...evaluation,
      id: `eval${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setEvaluations([...evaluations, newEvaluation]);
    console.log('Evaluation added:', newEvaluation.id);
  };

  const addPayrollRecord = (record: Omit<PayrollRecord, 'id' | 'createdAt'>) => {
    const newRecord: PayrollRecord = {
      ...record,
      id: `pay${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPayrollRecords([...payrollRecords, newRecord]);
    console.log('Payroll record added:', newRecord.id);
  };

  const clockIn = (employeeId: string, employeeName: string) => {
    const newEntry: TimeEntry = {
      id: `time${Date.now()}`,
      employeeId,
      employeeName,
      date: new Date().toISOString().split('T')[0],
      clockIn: new Date().toTimeString().slice(0, 5),
      breakDuration: 0,
      status: 'active',
      notes: '',
    };
    setTimeEntries([...timeEntries, newEntry]);
    console.log('Clock in:', employeeId);
  };

  const clockOut = (entryId: string) => {
    const now = new Date();
    const clockOutTime = now.toTimeString().slice(0, 5);

    setTimeEntries(
      timeEntries.map((entry) => {
        if (entry.id === entryId) {
          const clockInDate = new Date(`${entry.date}T${entry.clockIn}`);
          const clockOutDate = new Date(`${entry.date}T${clockOutTime}`);
          const diffMs = clockOutDate.getTime() - clockInDate.getTime();
          const totalHours = (diffMs / (1000 * 60 * 60) - entry.breakDuration / 60);

          return {
            ...entry,
            clockOut: clockOutTime,
            totalHours: Math.round(totalHours * 10) / 10,
            status: 'completed' as const,
          };
        }
        return entry;
      })
    );
    console.log('Clock out:', entryId);
  };

  const addDepartment = (department: Omit<Department, 'id' | 'createdAt'>) => {
    const newDepartment: Department = {
      ...department,
      id: `dept${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setDepartments([...departments, newDepartment]);
    console.log('Department added:', newDepartment.id);
  };

  return {
    employees: filteredEmployees,
    allEmployees: employees,
    evaluations,
    payrollRecords,
    timeEntries,
    departments,
    stats,
    loading,
    filters,
    setFilters,
    addEmployee,
    updateEmployee,
    addEvaluation,
    addPayrollRecord,
    clockIn,
    clockOut,
    addDepartment,
  };
}
