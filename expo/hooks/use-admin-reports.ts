import { useState, useEffect } from 'react';
import { Report, AdminStats, UserActivity } from '@/types/chat';

interface AdminReportsState {
  reports: Report[];
  stats: AdminStats | null;
  userActivities: UserActivity[];
  isLoading: boolean;
  error: string | null;
}

type ReportAction = {
  type: 'warning' | 'temporary_ban' | 'permanent_ban' | 'content_removal' | 'no_action';
  duration?: number;
  reason: string;
  executedBy: string;
  executedAt: Date;
};

// Mock data para desarrollo
const generateMockReports = (): Report[] => {
  const reportTypes = ['spam', 'harassment', 'inappropriate', 'fake_profile', 'scam', 'other'] as const;
  const statuses = ['pending', 'investigating', 'resolved', 'dismissed'] as const;
  const priorities = ['low', 'medium', 'high', 'urgent'] as const;
  
  return Array.from({ length: 25 }, (_, i) => ({
    id: `report_${i + 1}`,
    reporterId: `user_${Math.floor(Math.random() * 100) + 1}`,
    reporterName: `Usuario ${Math.floor(Math.random() * 100) + 1}`,
    reportedUserId: `user_${Math.floor(Math.random() * 100) + 1}`,
    reportedUserName: `Reportado ${Math.floor(Math.random() * 100) + 1}`,
    messageId: Math.random() > 0.3 ? `msg_${Math.floor(Math.random() * 1000)}` : undefined,
    conversationId: `chat_${Math.floor(Math.random() * 50) + 1}`,
    type: reportTypes[Math.floor(Math.random() * reportTypes.length)],
    reason: 'Comportamiento inapropiado detectado',
    description: Math.random() > 0.5 ? 'Descripción adicional del reporte' : undefined,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    assignedTo: Math.random() > 0.6 ? `admin_${Math.floor(Math.random() * 5) + 1}` : undefined,
    evidence: Math.random() > 0.7 ? {
      messageContent: 'Contenido del mensaje reportado',
      additionalInfo: 'Información adicional'
    } : undefined,
    actions: Math.random() > 0.8 ? [{
      type: 'warning',
      reason: 'Primera advertencia',
      executedBy: 'admin_1',
      executedAt: new Date(Date.now() - Math.random() * 86400000)
    }] : undefined,
    createdAt: new Date(Date.now() - Math.random() * 7 * 86400000),
    updatedAt: new Date(Date.now() - Math.random() * 86400000),
    resolvedAt: Math.random() > 0.7 ? new Date(Date.now() - Math.random() * 86400000) : undefined
  }));
};

const generateMockStats = (): AdminStats => {
  return {
    totalUsers: 15420,
    activeUsers: 8934,
    totalConversations: 45230,
    activeConversations: 12450,
    totalMessages: 892340,
    messagesLast24h: 12450,
    messagesLast7d: 89230,
    messagesLast30d: 345670,
    reportStats: {
      total: 156,
      pending: 23,
      resolved: 98,
      dismissed: 35,
      byType: {
        spam: 45,
        harassment: 32,
        inappropriate: 28,
        fake_profile: 21,
        scam: 18,
        other: 12
      },
      byPriority: {
        low: 45,
        medium: 67,
        high: 32,
        urgent: 12
      }
    },
    moderationStats: {
      totalViolations: 234,
      spamDetected: 89,
      profanityFiltered: 67,
      messagesBlocked: 45,
      usersWarned: 23,
      usersBanned: 8
    },
    performanceStats: {
      averageResponseTime: 245, // ms
      messageDeliveryRate: 99.7, // %
      systemUptime: 99.9, // %
      errorRate: 0.1 // %
    }
  };
};

const generateMockUserActivities = (): UserActivity[] => {
  const statuses = ['active', 'warned', 'suspended', 'banned'] as const;
  
  return Array.from({ length: 50 }, (_, i) => ({
    userId: `user_${i + 1}`,
    userName: `Usuario ${i + 1}`,
    lastActive: new Date(Date.now() - Math.random() * 7 * 86400000),
    messageCount: Math.floor(Math.random() * 1000) + 10,
    reportCount: Math.floor(Math.random() * 5),
    violationCount: Math.floor(Math.random() * 3),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    riskScore: Math.floor(Math.random() * 100)
  }));
};

export function useAdminReports() {
  const [state, setState] = useState<AdminReportsState>({
    reports: [],
    stats: null,
    userActivities: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Cargar datos mock para desarrollo
      const [reportsData, statsData, activitiesData] = await Promise.all([
        Promise.resolve(null),
        Promise.resolve(null),
        Promise.resolve(null)
      ]);
      
      const reports = reportsData ? JSON.parse(reportsData) : generateMockReports();
      const stats = statsData ? JSON.parse(statsData) : generateMockStats();
      const userActivities = activitiesData ? JSON.parse(activitiesData) : generateMockUserActivities();
      
      // En una implementación real, aquí se guardarían los datos
      console.log('Mock data generated for admin reports');
      
      setState({
        reports,
        stats,
        userActivities,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Error al cargar los datos de administración'
      }));
    }
  };

  const updateReportStatus = async (reportId: string, status: Report['status'], assignedTo?: string) => {
    try {
      const updatedReports = state.reports.map(report => {
        if (report.id === reportId) {
          return {
            ...report,
            status,
            assignedTo,
            updatedAt: new Date(),
            resolvedAt: status === 'resolved' || status === 'dismissed' ? new Date() : undefined
          };
        }
        return report;
      });
      
      // En una implementación real, aquí se actualizarían los datos en el servidor
      console.log('Data updated in server');
      setState(prev => ({ ...prev, reports: updatedReports }));
      
      return true;
    } catch (error) {
      console.error('Error updating report status:', error);
      return false;
    }
  };

  const addReportAction = async (reportId: string, action: ReportAction) => {
    try {
      const updatedReports = state.reports.map(report => {
        if (report.id === reportId) {
          return {
            ...report,
            actions: [...(report.actions || []), action],
            updatedAt: new Date()
          };
        }
        return report;
      });
      
      // En una implementación real, aquí se actualizarían los datos en el servidor
      console.log('Data updated in server');
      setState(prev => ({ ...prev, reports: updatedReports }));
      
      return true;
    } catch (error) {
      console.error('Error adding report action:', error);
      return false;
    }
  };

  const updateReportPriority = async (reportId: string, priority: Report['priority']) => {
    try {
      const updatedReports = state.reports.map(report => {
        if (report.id === reportId) {
          return {
            ...report,
            priority,
            updatedAt: new Date()
          };
        }
        return report;
      });
      
      // En una implementación real, aquí se actualizarían los datos en el servidor
      console.log('Data updated in server');
      setState(prev => ({ ...prev, reports: updatedReports }));
      
      return true;
    } catch (error) {
      console.error('Error updating report priority:', error);
      return false;
    }
  };

  const getFilteredReports = (filters: {
    status?: Report['status'];
    type?: Report['type'];
    priority?: Report['priority'];
    assignedTo?: string;
  }) => {
    return state.reports.filter(report => {
      if (filters.status && report.status !== filters.status) return false;
      if (filters.type && report.type !== filters.type) return false;
      if (filters.priority && report.priority !== filters.priority) return false;
      if (filters.assignedTo && report.assignedTo !== filters.assignedTo) return false;
      return true;
    });
  };

  const refreshStats = async () => {
    try {
      // En una implementación real, esto haría una llamada a la API
      const newStats = generateMockStats();
      console.log('Stats refreshed');
      setState(prev => ({ ...prev, stats: newStats }));
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  return {
    ...state,
    updateReportStatus,
    addReportAction,
    updateReportPriority,
    getFilteredReports,
    refreshStats,
    reload: loadData
  };
}