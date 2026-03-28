import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { Alert, Platform } from 'react-native';
import { 
  AuditLog, 
  SecurityEvent, 
  ComplianceReport, 
  DataRetentionPolicy,
  AuditFilter,
  ComplianceFinding 
} from '@/types/audit';

const STORAGE_KEYS = {
  AUDIT_LOGS: 'nodox_audit_logs',
  SECURITY_EVENTS: 'nodox_security_events',
  COMPLIANCE_REPORTS: 'nodox_compliance_reports',
  RETENTION_POLICIES: 'nodox_retention_policies',
};

const mockAuditLogs: AuditLog[] = [
  {
    id: 'audit-1',
    userId: 'user-1',
    userRole: 'client',
    action: 'login',
    resource: 'authentication',
    details: { method: 'email', success: true },
    ipAddress: '192.168.1.100',
    userAgent: 'NodoX Mobile App v1.0',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    severity: 'low',
    category: 'auth'
  },
  {
    id: 'audit-2',
    userId: 'admin-1',
    userRole: 'admin',
    action: 'user_suspension',
    resource: 'user_management',
    resourceId: 'user-123',
    details: { reason: 'policy_violation', duration: '7_days' },
    ipAddress: '10.0.0.5',
    userAgent: 'Chrome/120.0.0.0',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    severity: 'high',
    category: 'system'
  },
  {
    id: 'audit-3',
    userId: 'ally-1',
    userRole: 'ally',
    action: 'transaction_processed',
    resource: 'payment',
    resourceId: 'txn-456',
    details: { amount: 150.00, currency: 'USD', status: 'completed' },
    ipAddress: '203.0.113.45',
    userAgent: 'NodoX Web v2.1',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    severity: 'medium',
    category: 'transaction'
  }
];

const mockSecurityEvents: SecurityEvent[] = [
  {
    id: 'sec-1',
    type: 'failed_login',
    userId: 'user-456',
    description: 'Múltiples intentos de inicio de sesión fallidos',
    riskLevel: 'medium',
    ipAddress: '198.51.100.42',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    resolved: false,
    actions: ['account_locked', 'notification_sent']
  },
  {
    id: 'sec-2',
    type: 'suspicious_activity',
    userId: 'user-789',
    description: 'Actividad inusual detectada: múltiples transacciones en corto tiempo',
    riskLevel: 'high',
    ipAddress: '203.0.113.78',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    resolved: true,
    resolvedBy: 'admin-1',
    resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    actions: ['transaction_review', 'user_contacted', 'monitoring_increased']
  }
];

const mockComplianceReports: ComplianceReport[] = [
  {
    id: 'comp-1',
    type: 'gdpr',
    period: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    generatedBy: 'admin-1',
    generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    status: 'approved',
    findings: [
      {
        id: 'finding-1',
        category: 'data_retention',
        severity: 'medium',
        description: 'Algunos registros de usuario exceden el período de retención establecido',
        evidence: ['user_data_audit.csv', 'retention_policy_v2.pdf'],
        remediation: 'Implementar limpieza automática de datos antiguos',
        status: 'in_progress',
        assignedTo: 'tech-lead-1',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    ],
    recommendations: [
      'Automatizar el proceso de limpieza de datos',
      'Implementar alertas para datos próximos a expirar',
      'Revisar políticas de retención trimestralmente'
    ],
    attachments: ['gdpr_compliance_report_q4.pdf']
  }
];

const mockRetentionPolicies: DataRetentionPolicy[] = [
  {
    id: 'policy-1',
    dataType: 'user_messages',
    retentionPeriod: 365,
    deletionMethod: 'soft',
    isActive: true,
    lastReviewed: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    approvedBy: 'admin-1'
  },
  {
    id: 'policy-2',
    dataType: 'transaction_logs',
    retentionPeriod: 2555, // 7 years
    deletionMethod: 'hard',
    isActive: true,
    lastReviewed: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    nextReview: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    approvedBy: 'admin-1'
  }
];

export const [AuditProvider, useAudit] = createContextHook(() => {
  const [activeFilters, setActiveFilters] = useState<AuditFilter>({});
  const queryClient = useQueryClient();

  // Queries
  const auditLogsQuery = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async (): Promise<AuditLog[]> => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.map((log: any) => ({
            ...log,
            timestamp: new Date(log.timestamp)
          }));
        }
        return mockAuditLogs;
      } catch {
        return mockAuditLogs;
      }
    },
  });

  const securityEventsQuery = useQuery({
    queryKey: ['security-events'],
    queryFn: async (): Promise<SecurityEvent[]> => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.SECURITY_EVENTS);
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.map((event: any) => ({
            ...event,
            timestamp: new Date(event.timestamp),
            resolvedAt: event.resolvedAt ? new Date(event.resolvedAt) : undefined
          }));
        }
        return mockSecurityEvents;
      } catch {
        return mockSecurityEvents;
      }
    },
  });

  const complianceReportsQuery = useQuery({
    queryKey: ['compliance-reports'],
    queryFn: async (): Promise<ComplianceReport[]> => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.COMPLIANCE_REPORTS);
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.map((report: any) => ({
            ...report,
            period: {
              start: new Date(report.period.start),
              end: new Date(report.period.end)
            },
            generatedAt: new Date(report.generatedAt),
            findings: report.findings.map((finding: any) => ({
              ...finding,
              dueDate: finding.dueDate ? new Date(finding.dueDate) : undefined
            }))
          }));
        }
        return mockComplianceReports;
      } catch {
        return mockComplianceReports;
      }
    },
  });

  const retentionPoliciesQuery = useQuery({
    queryKey: ['retention-policies'],
    queryFn: async (): Promise<DataRetentionPolicy[]> => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.RETENTION_POLICIES);
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.map((policy: any) => ({
            ...policy,
            lastReviewed: new Date(policy.lastReviewed),
            nextReview: new Date(policy.nextReview)
          }));
        }
        return mockRetentionPolicies;
      } catch {
        return mockRetentionPolicies;
      }
    },
  });

  // Mutations
  const saveAuditLogs = useMutation({
    mutationFn: async (logs: AuditLog[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
      return logs;
    },
    onSuccess: (logs) => {
      queryClient.setQueryData(['audit-logs'], logs);
    },
  });

  const saveSecurityEvents = useMutation({
    mutationFn: async (events: SecurityEvent[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.SECURITY_EVENTS, JSON.stringify(events));
      return events;
    },
    onSuccess: (events) => {
      queryClient.setQueryData(['security-events'], events);
    },
  });

  const saveComplianceReports = useMutation({
    mutationFn: async (reports: ComplianceReport[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.COMPLIANCE_REPORTS, JSON.stringify(reports));
      return reports;
    },
    onSuccess: (reports) => {
      queryClient.setQueryData(['compliance-reports'], reports);
    },
  });

  const saveRetentionPolicies = useMutation({
    mutationFn: async (policies: DataRetentionPolicy[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.RETENTION_POLICIES, JSON.stringify(policies));
      return policies;
    },
    onSuccess: (policies) => {
      queryClient.setQueryData(['retention-policies'], policies);
    },
  });

  // Helper functions
  const { mutateAsync: saveAuditLogsAsync } = saveAuditLogs;
  const { mutateAsync: saveSecurityEventsAsync } = saveSecurityEvents;
  const { mutateAsync: saveComplianceReportsAsync } = saveComplianceReports;
  const { mutateAsync: saveRetentionPoliciesAsync } = saveRetentionPolicies;

  // Audit Log Functions
  const logAction = useCallback(async (
    userId: string,
    userRole: 'client' | 'ally' | 'admin' | 'referral_member',
    action: string,
    resource: string,
    details: Record<string, any>,
    resourceId?: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'low',
    category: 'auth' | 'transaction' | 'data' | 'system' | 'security' = 'system'
  ) => {
    const currentLogs = auditLogsQuery.data || [];
    
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userRole,
      action,
      resource,
      resourceId,
      details,
      ipAddress: Platform.OS === 'web' ? '127.0.0.1' : '192.168.1.100', // Mock IP
      userAgent: Platform.OS === 'web' ? navigator.userAgent : 'NodoX Mobile App',
      timestamp: new Date(),
      severity,
      category
    };

    const updatedLogs = [newLog, ...currentLogs].slice(0, 1000); // Keep last 1000 logs
    await saveAuditLogsAsync(updatedLogs);
    
    console.log('[Audit] Action logged:', action, 'by', userId);
    return newLog.id;
  }, [auditLogsQuery.data, saveAuditLogsAsync]);

  const getFilteredAuditLogs = useCallback((filters: AuditFilter): AuditLog[] => {
    const logs = auditLogsQuery.data || [];
    
    return logs.filter(log => {
      if (filters.userId && log.userId !== filters.userId) return false;
      if (filters.userRole && log.userRole !== filters.userRole) return false;
      if (filters.action && !log.action.toLowerCase().includes(filters.action.toLowerCase())) return false;
      if (filters.resource && !log.resource.toLowerCase().includes(filters.resource.toLowerCase())) return false;
      if (filters.severity && log.severity !== filters.severity) return false;
      if (filters.category && log.category !== filters.category) return false;
      if (filters.ipAddress && log.ipAddress !== filters.ipAddress) return false;
      if (filters.dateFrom && log.timestamp < filters.dateFrom) return false;
      if (filters.dateTo && log.timestamp > filters.dateTo) return false;
      
      return true;
    });
  }, [auditLogsQuery.data]);

  // Security Event Functions
  const createSecurityEvent = useCallback(async (
    type: 'failed_login' | 'suspicious_activity' | 'data_breach' | 'unauthorized_access',
    description: string,
    riskLevel: 'low' | 'medium' | 'high' | 'critical',
    userId?: string,
    actions: string[] = []
  ) => {
    const currentEvents = securityEventsQuery.data || [];
    
    const newEvent: SecurityEvent = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      userId,
      description,
      riskLevel,
      ipAddress: Platform.OS === 'web' ? '127.0.0.1' : '192.168.1.100',
      timestamp: new Date(),
      resolved: false,
      actions
    };

    const updatedEvents = [newEvent, ...currentEvents];
    await saveSecurityEventsAsync(updatedEvents);
    
    // Auto-log high/critical security events
    if (riskLevel === 'high' || riskLevel === 'critical') {
      await logAction(
        userId || 'system',
        'admin',
        'security_event_created',
        'security',
        { eventType: type, riskLevel, description },
        newEvent.id,
        'critical',
        'security'
      );
    }
    
    console.log('[Security] Event created:', type, 'Risk:', riskLevel);
    return newEvent.id;
  }, [securityEventsQuery.data, saveSecurityEventsAsync, logAction]);

  const resolveSecurityEvent = useCallback(async (eventId: string, resolvedBy: string) => {
    const currentEvents = securityEventsQuery.data || [];
    
    const updatedEvents = currentEvents.map(event => 
      event.id === eventId 
        ? { ...event, resolved: true, resolvedBy, resolvedAt: new Date() }
        : event
    );

    await saveSecurityEventsAsync(updatedEvents);
    
    await logAction(
      resolvedBy,
      'admin',
      'security_event_resolved',
      'security',
      { eventId },
      eventId,
      'medium',
      'security'
    );
    
    console.log('[Security] Event resolved:', eventId, 'by', resolvedBy);
  }, [securityEventsQuery.data, saveSecurityEventsAsync, logAction]);

  // Compliance Functions
  const generateComplianceReport = useCallback(async (
    type: 'gdpr' | 'financial' | 'security' | 'operational',
    periodStart: Date,
    periodEnd: Date,
    generatedBy: string
  ) => {
    const currentReports = complianceReportsQuery.data || [];
    
    // Mock findings generation based on audit logs
    const auditLogs = auditLogsQuery.data || [];
    const periodLogs = auditLogs.filter(log => 
      log.timestamp >= periodStart && log.timestamp <= periodEnd
    );
    
    const findings: ComplianceFinding[] = [];
    
    // Example: Check for high-severity events
    const highSeverityLogs = periodLogs.filter(log => log.severity === 'high' || log.severity === 'critical');
    if (highSeverityLogs.length > 10) {
      findings.push({
        id: `finding-${Date.now()}`,
        category: 'security_incidents',
        severity: 'high',
        description: `Se detectaron ${highSeverityLogs.length} eventos de alta severidad en el período`,
        evidence: ['audit_logs_high_severity.csv'],
        remediation: 'Revisar y fortalecer controles de seguridad',
        status: 'open'
      });
    }
    
    const newReport: ComplianceReport = {
      id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      period: { start: periodStart, end: periodEnd },
      generatedBy,
      generatedAt: new Date(),
      status: 'draft',
      findings,
      recommendations: [
        'Continuar monitoreando eventos de seguridad',
        'Implementar alertas automáticas para eventos críticos',
        'Revisar políticas de acceso regularmente'
      ],
      attachments: []
    };

    const updatedReports = [newReport, ...currentReports];
    await saveComplianceReportsAsync(updatedReports);
    
    await logAction(
      generatedBy,
      'admin',
      'compliance_report_generated',
      'compliance',
      { reportType: type, period: { start: periodStart, end: periodEnd } },
      newReport.id,
      'medium',
      'system'
    );
    
    console.log('[Compliance] Report generated:', type, newReport.id);
    return newReport.id;
  }, [complianceReportsQuery.data, auditLogsQuery.data, saveComplianceReportsAsync, logAction]);

  const updateComplianceReportStatus = useCallback(async (
    reportId: string, 
    status: 'draft' | 'pending_review' | 'approved' | 'published',
    updatedBy: string
  ) => {
    const currentReports = complianceReportsQuery.data || [];
    
    const updatedReports = currentReports.map(report => 
      report.id === reportId ? { ...report, status } : report
    );

    await saveComplianceReportsAsync(updatedReports);
    
    await logAction(
      updatedBy,
      'admin',
      'compliance_report_status_updated',
      'compliance',
      { reportId, newStatus: status },
      reportId,
      'low',
      'system'
    );
    
    console.log('[Compliance] Report status updated:', reportId, status);
  }, [complianceReportsQuery.data, saveComplianceReportsAsync, logAction]);

  // Data Retention Functions
  const createRetentionPolicy = useCallback(async (
    dataType: string,
    retentionPeriod: number,
    deletionMethod: 'soft' | 'hard',
    approvedBy: string
  ) => {
    const currentPolicies = retentionPoliciesQuery.data || [];
    
    const newPolicy: DataRetentionPolicy = {
      id: `policy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dataType,
      retentionPeriod,
      deletionMethod,
      isActive: true,
      lastReviewed: new Date(),
      nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      approvedBy
    };

    const updatedPolicies = [...currentPolicies, newPolicy];
    await saveRetentionPoliciesAsync(updatedPolicies);
    
    await logAction(
      approvedBy,
      'admin',
      'retention_policy_created',
      'data_management',
      { dataType, retentionPeriod, deletionMethod },
      newPolicy.id,
      'medium',
      'data'
    );
    
    console.log('[Data Retention] Policy created:', dataType, retentionPeriod, 'days');
    return newPolicy.id;
  }, [retentionPoliciesQuery.data, saveRetentionPoliciesAsync, logAction]);

  // Analytics Functions
  const getAuditStatistics = useCallback(() => {
    const logs = auditLogsQuery.data || [];
    const events = securityEventsQuery.data || [];
    const reports = complianceReportsQuery.data || [];
    
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    return {
      totalLogs: logs.length,
      logsLast24h: logs.filter(log => log.timestamp >= last24Hours).length,
      logsLast7d: logs.filter(log => log.timestamp >= last7Days).length,
      logsLast30d: logs.filter(log => log.timestamp >= last30Days).length,
      
      securityEvents: {
        total: events.length,
        unresolved: events.filter(event => !event.resolved).length,
        highRisk: events.filter(event => event.riskLevel === 'high' || event.riskLevel === 'critical').length,
        last24h: events.filter(event => event.timestamp >= last24Hours).length
      },
      
      compliance: {
        totalReports: reports.length,
        pendingReports: reports.filter(report => report.status === 'pending_review').length,
        openFindings: reports.reduce((acc, report) => 
          acc + report.findings.filter(finding => finding.status === 'open').length, 0
        )
      },
      
      logsByCategory: logs.reduce((acc, log) => {
        acc[log.category] = (acc[log.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      
      logsBySeverity: logs.reduce((acc, log) => {
        acc[log.severity] = (acc[log.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }, [auditLogsQuery.data, securityEventsQuery.data, complianceReportsQuery.data]);

  return useMemo(() => ({
    // Data
    auditLogs: auditLogsQuery.data || [],
    securityEvents: securityEventsQuery.data || [],
    complianceReports: complianceReportsQuery.data || [],
    retentionPolicies: retentionPoliciesQuery.data || [],
    activeFilters,
    
    // Audit Functions
    logAction,
    getFilteredAuditLogs,
    setActiveFilters,
    
    // Security Functions
    createSecurityEvent,
    resolveSecurityEvent,
    
    // Compliance Functions
    generateComplianceReport,
    updateComplianceReportStatus,
    
    // Data Retention Functions
    createRetentionPolicy,
    
    // Analytics
    getAuditStatistics,
    
    // Loading States
    isLoading: auditLogsQuery.isLoading || securityEventsQuery.isLoading || 
               complianceReportsQuery.isLoading || retentionPoliciesQuery.isLoading,
    
    // Refresh Functions
    refreshData: () => {
      auditLogsQuery.refetch();
      securityEventsQuery.refetch();
      complianceReportsQuery.refetch();
      retentionPoliciesQuery.refetch();
    }
  }), [
    auditLogsQuery.data,
    securityEventsQuery.data,
    complianceReportsQuery.data,
    retentionPoliciesQuery.data,
    activeFilters,
    logAction,
    getFilteredAuditLogs,
    createSecurityEvent,
    resolveSecurityEvent,
    generateComplianceReport,
    updateComplianceReportStatus,
    createRetentionPolicy,
    getAuditStatistics,
    auditLogsQuery.isLoading,
    securityEventsQuery.isLoading,
    complianceReportsQuery.isLoading,
    retentionPoliciesQuery.isLoading
  ]);
});