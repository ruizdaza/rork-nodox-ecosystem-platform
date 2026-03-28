import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Users,
  UserPlus,
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  Building2,
  Search,
  Filter,
  Edit,
  Trash2,
  Award,
  FileText,
  ChevronRight,
  Download,
  CheckCircle,
} from 'lucide-react-native';
import { useHRManagement } from '@/hooks/use-hr-management';
import { Employee } from '@/types/crm';

export default function HRManagementScreen() {
  const {
    employees,
    allEmployees,
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
  } = useHRManagement();

  const [activeTab, setActiveTab] = useState<
    'employees' | 'evaluations' | 'payroll' | 'time' | 'departments'
  >('employees');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'inactive':
        return '#6b7280';
      case 'on_leave':
        return '#f59e0b';
      case 'terminated':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'on_leave':
        return 'De Licencia';
      case 'terminated':
        return 'Terminado';
      default:
        return status;
    }
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Users size={24} color="#6366f1" />
        <Text style={styles.statValue}>{stats.activeEmployees}</Text>
        <Text style={styles.statLabel}>Activos</Text>
      </View>
      <View style={styles.statCard}>
        <Building2 size={24} color="#10b981" />
        <Text style={styles.statValue}>{stats.departmentCount}</Text>
        <Text style={styles.statLabel}>Departamentos</Text>
      </View>
      <View style={styles.statCard}>
        <DollarSign size={24} color="#f59e0b" />
        <Text style={styles.statValue}>{formatCurrency(stats.totalPayroll)}</Text>
        <Text style={styles.statLabel}>Nómina</Text>
      </View>
      <View style={styles.statCard}>
        <Award size={24} color="#8b5cf6" />
        <Text style={styles.statValue}>{stats.pendingEvaluations}</Text>
        <Text style={styles.statLabel}>Evaluaciones</Text>
      </View>
    </View>
  );

  const renderTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'employees' && styles.tabActive]}
        onPress={() => setActiveTab('employees')}
      >
        <Users size={20} color={activeTab === 'employees' ? '#fff' : '#6b7280'} />
        <Text
          style={[styles.tabText, activeTab === 'employees' && styles.tabTextActive]}
        >
          Empleados
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'time' && styles.tabActive]}
        onPress={() => setActiveTab('time')}
      >
        <Clock size={20} color={activeTab === 'time' ? '#fff' : '#6b7280'} />
        <Text style={[styles.tabText, activeTab === 'time' && styles.tabTextActive]}>
          Asistencia
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'evaluations' && styles.tabActive]}
        onPress={() => setActiveTab('evaluations')}
      >
        <TrendingUp size={20} color={activeTab === 'evaluations' ? '#fff' : '#6b7280'} />
        <Text
          style={[styles.tabText, activeTab === 'evaluations' && styles.tabTextActive]}
        >
          Evaluaciones
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'payroll' && styles.tabActive]}
        onPress={() => setActiveTab('payroll')}
      >
        <DollarSign size={20} color={activeTab === 'payroll' ? '#fff' : '#6b7280'} />
        <Text style={[styles.tabText, activeTab === 'payroll' && styles.tabTextActive]}>
          Nómina
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'departments' && styles.tabActive]}
        onPress={() => setActiveTab('departments')}
      >
        <Building2
          size={20}
          color={activeTab === 'departments' ? '#fff' : '#6b7280'}
        />
        <Text
          style={[styles.tabText, activeTab === 'departments' && styles.tabTextActive]}
        >
          Departamentos
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderEmployees = () => (
    <View style={styles.section}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar empleado..."
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setFilters({ ...filters, search: text });
            }}
            placeholderTextColor="#9ca3af"
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Filter size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddEmployee(true)}
        >
          <UserPlus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.employeeList}>
        {employees.map((employee) => (
          <TouchableOpacity
            key={employee.id}
            style={styles.employeeCard}
            onPress={() => setSelectedEmployee(employee)}
          >
            <View style={styles.employeeHeader}>
              <View style={styles.employeeAvatar}>
                <Text style={styles.employeeAvatarText}>
                  {employee.firstName[0]}
                  {employee.lastName[0]}
                </Text>
              </View>
              <View style={styles.employeeInfo}>
                <Text style={styles.employeeName}>
                  {employee.firstName} {employee.lastName}
                </Text>
                <Text style={styles.employeePosition}>{employee.position}</Text>
                <Text style={styles.employeeDepartment}>{employee.department}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(employee.status) },
                ]}
              >
                <Text style={styles.statusText}>{getStatusLabel(employee.status)}</Text>
              </View>
            </View>

            <View style={styles.employeeDetails}>
              <View style={styles.employeeDetailItem}>
                <Text style={styles.employeeDetailLabel}>Salario:</Text>
                <Text style={styles.employeeDetailValue}>
                  {formatCurrency(employee.salary)}
                </Text>
              </View>
              <View style={styles.employeeDetailItem}>
                <Text style={styles.employeeDetailLabel}>Tipo:</Text>
                <Text style={styles.employeeDetailValue}>
                  {employee.employmentType === 'full_time'
                    ? 'Tiempo Completo'
                    : employee.employmentType === 'part_time'
                    ? 'Medio Tiempo'
                    : employee.employmentType === 'contractor'
                    ? 'Contratista'
                    : 'Practicante'}
                </Text>
              </View>
            </View>

            <View style={styles.employeeActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  Alert.alert('Editar Empleado', `Editar ${employee.firstName}`);
                }}
              >
                <Edit size={16} color="#6366f1" />
                <Text style={styles.actionButtonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  Alert.alert('Ver Evaluaciones', `Evaluaciones de ${employee.firstName}`);
                }}
              >
                <Award size={16} color="#10b981" />
                <Text style={styles.actionButtonText}>Evaluar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  Alert.alert('Ver Documentos', `Documentos de ${employee.firstName}`);
                }}
              >
                <FileText size={16} color="#f59e0b" />
                <Text style={styles.actionButtonText}>Docs</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTimeEntries = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Asistencia de Hoy</Text>
      <ScrollView style={styles.timeList}>
        {timeEntries.map((entry) => (
          <View key={entry.id} style={styles.timeCard}>
            <View style={styles.timeHeader}>
              <Text style={styles.timeEmployeeName}>{entry.employeeName}</Text>
              <View
                style={[
                  styles.timeStatusBadge,
                  {
                    backgroundColor:
                      entry.status === 'active'
                        ? '#10b981'
                        : entry.status === 'completed'
                        ? '#6b7280'
                        : '#f59e0b',
                  },
                ]}
              >
                <Text style={styles.timeStatusText}>
                  {entry.status === 'active'
                    ? 'En Turno'
                    : entry.status === 'completed'
                    ? 'Completado'
                    : 'Pendiente'}
                </Text>
              </View>
            </View>

            <View style={styles.timeDetails}>
              <View style={styles.timeDetailRow}>
                <Clock size={16} color="#6b7280" />
                <Text style={styles.timeDetailText}>
                  Entrada: {entry.clockIn}
                  {entry.clockOut && ` | Salida: ${entry.clockOut}`}
                </Text>
              </View>
              {entry.totalHours !== undefined && (
                <View style={styles.timeDetailRow}>
                  <TrendingUp size={16} color="#6b7280" />
                  <Text style={styles.timeDetailText}>
                    Total: {entry.totalHours}h (Descanso: {entry.breakDuration}min)
                  </Text>
                </View>
              )}
            </View>

            {entry.status === 'active' && (
              <TouchableOpacity
                style={styles.clockOutButton}
                onPress={() => {
                  clockOut(entry.id);
                  Alert.alert('Éxito', 'Salida registrada correctamente');
                }}
              >
                <CheckCircle size={16} color="#fff" />
                <Text style={styles.clockOutButtonText}>Registrar Salida</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => {
          Alert.alert(
            'Registrar Entrada',
            'Seleccione un empleado para registrar entrada',
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'OK',
                onPress: () => {
                  if (allEmployees.length > 0) {
                    clockIn(allEmployees[0].id, allEmployees[0].firstName);
                  }
                },
              },
            ]
          );
        }}
      >
        <Clock size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderEvaluations = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Evaluaciones de Desempeño</Text>
      <ScrollView style={styles.evaluationList}>
        {evaluations.map((evaluation) => (
          <View key={evaluation.id} style={styles.evaluationCard}>
            <View style={styles.evaluationHeader}>
              <View>
                <Text style={styles.evaluationEmployee}>
                  {
                    allEmployees.find((e) => e.id === evaluation.employeeId)
                      ?.firstName
                  }{' '}
                  {allEmployees.find((e) => e.id === evaluation.employeeId)?.lastName}
                </Text>
                <Text style={styles.evaluationPeriod}>{evaluation.period}</Text>
              </View>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreValue}>{evaluation.overallScore}</Text>
                <Text style={styles.scoreLabel}>/10</Text>
              </View>
            </View>

            <View style={styles.categoriesContainer}>
              {evaluation.categories.map((cat, idx) => (
                <View key={idx} style={styles.categoryRow}>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                  <View style={styles.categoryScore}>
                    <View style={styles.scoreBar}>
                      <View
                        style={[
                          styles.scoreBarFill,
                          {
                            width: `${(cat.score / cat.maxScore) * 100}%`,
                            backgroundColor:
                              cat.score / cat.maxScore >= 0.8
                                ? '#10b981'
                                : cat.score / cat.maxScore >= 0.6
                                ? '#f59e0b'
                                : '#ef4444',
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.categoryScoreText}>
                      {cat.score}/{cat.maxScore}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.evaluationFooter}>
              <Text style={styles.evaluatorText}>
                Por: {evaluation.evaluatorName}
              </Text>
              <Text style={styles.evaluationDate}>
                {new Date(evaluation.date).toLocaleDateString('es-CO')}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => Alert.alert('Nueva Evaluación', 'Crear nueva evaluación')}
      >
        <Award size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderPayroll = () => (
    <View style={styles.section}>
      <View style={styles.payrollHeader}>
        <Text style={styles.sectionTitle}>Nómina</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Download size={16} color="#fff" />
          <Text style={styles.exportButtonText}>Exportar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.payrollList}>
        {payrollRecords.map((record) => (
          <View key={record.id} style={styles.payrollCard}>
            <View style={styles.payrollCardHeader}>
              <View>
                <Text style={styles.payrollEmployeeName}>
                  {record.employeeName}
                </Text>
                <Text style={styles.payrollPeriod}>Período: {record.period}</Text>
              </View>
              <View
                style={[
                  styles.payrollStatusBadge,
                  {
                    backgroundColor:
                      record.status === 'paid'
                        ? '#10b981'
                        : record.status === 'approved'
                        ? '#f59e0b'
                        : '#6b7280',
                  },
                ]}
              >
                <Text style={styles.payrollStatusText}>
                  {record.status === 'paid'
                    ? 'Pagado'
                    : record.status === 'approved'
                    ? 'Aprobado'
                    : 'Pendiente'}
                </Text>
              </View>
            </View>

            <View style={styles.payrollDetails}>
              <View style={styles.payrollRow}>
                <Text style={styles.payrollLabel}>Salario Base:</Text>
                <Text style={styles.payrollValue}>
                  {formatCurrency(record.baseSalary)}
                </Text>
              </View>

              {record.bonuses.length > 0 && (
                <View style={styles.payrollRow}>
                  <Text style={styles.payrollLabel}>Bonos:</Text>
                  <Text style={[styles.payrollValue, { color: '#10b981' }]}>
                    +{' '}
                    {formatCurrency(
                      record.bonuses.reduce((sum, b) => sum + b.amount, 0)
                    )}
                  </Text>
                </View>
              )}

              {record.overtime.amount > 0 && (
                <View style={styles.payrollRow}>
                  <Text style={styles.payrollLabel}>
                    Horas Extra ({record.overtime.hours}h):
                  </Text>
                  <Text style={[styles.payrollValue, { color: '#10b981' }]}>
                    + {formatCurrency(record.overtime.amount)}
                  </Text>
                </View>
              )}

              <View style={styles.payrollRow}>
                <Text style={styles.payrollLabel}>Deducciones:</Text>
                <Text style={[styles.payrollValue, { color: '#ef4444' }]}>
                  - {formatCurrency(record.totalDeductions)}
                </Text>
              </View>

              <View style={[styles.payrollRow, styles.payrollTotal]}>
                <Text style={styles.payrollTotalLabel}>Total Neto:</Text>
                <Text style={styles.payrollTotalValue}>
                  {formatCurrency(record.netPay)}
                </Text>
              </View>
            </View>

            {record.paymentDate && (
              <Text style={styles.paymentDate}>
                Pagado el: {new Date(record.paymentDate).toLocaleDateString('es-CO')}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => Alert.alert('Nueva Nómina', 'Generar nueva nómina')}
      >
        <DollarSign size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderDepartments = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Departamentos</Text>
      <ScrollView style={styles.departmentList}>
        {departments.map((dept) => (
          <View key={dept.id} style={styles.departmentCard}>
            <View style={styles.departmentHeader}>
              <Building2 size={32} color="#6366f1" />
              <View style={styles.departmentInfo}>
                <Text style={styles.departmentName}>{dept.name}</Text>
                <Text style={styles.departmentDescription}>{dept.description}</Text>
              </View>
            </View>

            <View style={styles.departmentStats}>
              <View style={styles.departmentStat}>
                <Users size={16} color="#6b7280" />
                <Text style={styles.departmentStatText}>
                  {dept.employeeCount} empleados
                </Text>
              </View>
              <View style={styles.departmentStat}>
                <DollarSign size={16} color="#6b7280" />
                <Text style={styles.departmentStatText}>
                  Presupuesto: {formatCurrency(dept.budget)}
                </Text>
              </View>
            </View>

            {dept.managerName && (
              <View style={styles.departmentManager}>
                <Text style={styles.departmentManagerLabel}>Gerente:</Text>
                <Text style={styles.departmentManagerName}>{dept.managerName}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.viewDepartmentButton}>
              <Text style={styles.viewDepartmentButtonText}>Ver Detalles</Text>
              <ChevronRight size={16} color="#6366f1" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => Alert.alert('Nuevo Departamento', 'Crear nuevo departamento')}
      >
        <Building2 size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Gestión de Personal',
          headerStyle: { backgroundColor: '#fff' },
          headerShadowVisible: true,
        }}
      />

      <ScrollView style={styles.content}>
        {renderStats()}
        {renderTabs()}

        {activeTab === 'employees' && renderEmployees()}
        {activeTab === 'time' && renderTimeEntries()}
        {activeTab === 'evaluations' && renderEvaluations()}
        {activeTab === 'payroll' && renderPayroll()}
        {activeTab === 'departments' && renderDepartments()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  tabs: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tabActive: {
    backgroundColor: '#6366f1',
    marginHorizontal: 8,
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#fff',
  },
  section: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: '#10b981',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  employeeList: {
    flex: 1,
  },
  employeeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  employeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  employeeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  employeeAvatarText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
  },
  employeePosition: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  employeeDepartment: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  employeeDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  employeeDetailItem: {
    flex: 1,
  },
  employeeDetailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  employeeDetailValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#111827',
  },
  employeeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#374151',
  },
  timeList: {
    flex: 1,
  },
  timeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  timeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeEmployeeName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
  },
  timeStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeStatusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  timeDetails: {
    gap: 8,
  },
  timeDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeDetailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  clockOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: '#10b981',
    borderRadius: 8,
  },
  clockOutButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  evaluationList: {
    flex: 1,
  },
  evaluationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  evaluationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  evaluationEmployee: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
  },
  evaluationPeriod: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#6366f1',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  categoriesContainer: {
    gap: 12,
    marginBottom: 16,
  },
  categoryRow: {
    gap: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
  },
  categoryScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryScoreText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#6b7280',
    width: 40,
    textAlign: 'right' as const,
  },
  evaluationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  evaluatorText: {
    fontSize: 12,
    color: '#6b7280',
  },
  evaluationDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  payrollHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#6366f1',
    borderRadius: 8,
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  payrollList: {
    flex: 1,
  },
  payrollCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  payrollCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  payrollEmployeeName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
  },
  payrollPeriod: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  payrollStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  payrollStatusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  payrollDetails: {
    gap: 8,
  },
  payrollRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payrollLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  payrollValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#111827',
  },
  payrollTotal: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
  },
  payrollTotalLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
  },
  payrollTotalValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#6366f1',
  },
  paymentDate: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 12,
    textAlign: 'center' as const,
  },
  departmentList: {
    flex: 1,
  },
  departmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  departmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  departmentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  departmentName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
  },
  departmentDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  departmentStats: {
    gap: 8,
    marginBottom: 12,
  },
  departmentStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  departmentStatText: {
    fontSize: 14,
    color: '#6b7280',
  },
  departmentManager: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    marginBottom: 12,
  },
  departmentManagerLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  departmentManagerName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#111827',
  },
  viewDepartmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  viewDepartmentButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6366f1',
  },
  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
