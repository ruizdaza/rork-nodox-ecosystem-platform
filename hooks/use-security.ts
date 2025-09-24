import { useState, useEffect } from 'react';
import { SecurityConfig, SecurityAudit, SecurityEvent, ThreatIntelligence, ComplianceReport, AccessControl } from '@/types/security';

interface SecurityState {
  config: SecurityConfig;
  audits: SecurityAudit[];
  events: SecurityEvent[];
  threats: ThreatIntelligence[];
  complianceReports: ComplianceReport[];
  accessControls: AccessControl[];
  isLoading: boolean;
  error: string | null;
}

const MOCK_SECURITY_CONFIG: SecurityConfig = {
  encryption: {
    algorithm: 'AES-256-GCM',
    keySize: 256,
    enabled: true
  },
  pciCompliance: {
    level: 'level1',
    certified: true,
    certificationDate: '2024-01-15',
    expiryDate: '2025-01-15',
    assessor: 'SecureAudit Corp'
  },
  gdprCompliance: {
    enabled: true,
    dataRetentionDays: 365,
    cookieConsent: true,
    rightToErasure: true,
    dataPortability: true
  },
  auditLog: {
    enabled: true,
    retentionDays: 2555,
    events: ['login', 'payment', 'data_access', 'admin_action', 'security_event']
  }
};

const MOCK_SECURITY_EVENTS: SecurityEvent[] = [
  {
    id: 'evt_001',
    type: 'login_attempt',
    severity: 'info',
    userId: 'user_123',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    result: 'success',
    details: { method: 'biometric' },
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    location: {
      country: 'Colombia',
      city: 'Bogotá'
    }
  },
  {
    id: 'evt_002',
    type: 'failed_login',
    severity: 'warning',
    ipAddress: '203.0.113.45',
    userAgent: 'curl/7.68.0',
    result: 'failure',
    details: { attempts: 3, reason: 'invalid_credentials' },
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    location: {
      country: 'Unknown',
      city: 'Unknown'
    }
  }
];

const MOCK_THREATS: ThreatIntelligence[] = [
  {
    id: 'threat_001',
    type: 'malicious_ip',
    source: 'CrowdStrike',
    confidence: 95,
    severity: 'high',
    indicators: {
      ips: ['203.0.113.45', '198.51.100.23']
    },
    description: 'Known botnet command and control servers',
    firstSeen: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    active: true
  }
];

export function useSecurity() {
  const [state, setState] = useState<SecurityState>({
    config: MOCK_SECURITY_CONFIG,
    audits: [],
    events: [],
    threats: [],
    complianceReports: [],
    accessControls: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      setState({
        config: MOCK_SECURITY_CONFIG,
        audits: [],
        events: MOCK_SECURITY_EVENTS,
        threats: MOCK_THREATS,
        complianceReports: [],
        accessControls: [],
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading security data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load security data'
      }));
    }
  };

  const logSecurityEvent = async (event: Omit<SecurityEvent, 'id' | 'timestamp'>) => {
    try {
      const newEvent: SecurityEvent = {
        ...event,
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      };

      const updatedEvents = [newEvent, ...state.events].slice(0, 1000);
      setState(prev => ({
        ...prev,
        events: updatedEvents
      }));

      console.log('Security event logged:', newEvent);
      return newEvent;
    } catch (error) {
      console.error('Error logging security event:', error);
      throw error;
    }
  };

  const checkThreatIntelligence = async (indicators: {
    ip?: string;
    domain?: string;
    hash?: string;
    url?: string;
  }): Promise<ThreatIntelligence[]> => {
    try {
      const matches: ThreatIntelligence[] = [];
      
      for (const threat of state.threats) {
        if (!threat.active) continue;
        
        if (indicators.ip && threat.indicators.ips?.includes(indicators.ip)) {
          matches.push(threat);
        }
        if (indicators.domain && threat.indicators.domains?.includes(indicators.domain)) {
          matches.push(threat);
        }
        if (indicators.hash && threat.indicators.hashes?.includes(indicators.hash)) {
          matches.push(threat);
        }
        if (indicators.url && threat.indicators.urls?.includes(indicators.url)) {
          matches.push(threat);
        }
      }
      
      return matches;
    } catch (error) {
      console.error('Error checking threat intelligence:', error);
      throw error;
    }
  };

  const performSecurityAudit = async (type: 'security_scan' | 'penetration_test' | 'compliance_check' | 'vulnerability_assessment'): Promise<SecurityAudit> => {
    try {
      const audit: SecurityAudit = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        status: 'in_progress',
        severity: 'medium',
        findings: [],
        recommendations: [],
        auditor: 'NodoX Security Team',
        scheduledDate: new Date().toISOString(),
        nextAuditDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {}
      };

      setTimeout(() => {
        const completedAudit = {
          ...audit,
          status: 'completed' as const,
          completedDate: new Date().toISOString(),
          findings: [
            {
              id: 'finding_001',
              type: 'vulnerability' as const,
              severity: 'medium' as const,
              title: 'Outdated SSL/TLS Configuration',
              description: 'Some endpoints are using deprecated TLS versions',
              location: 'API Gateway',
              impact: 'Potential man-in-the-middle attacks',
              recommendation: 'Update to TLS 1.3 minimum',
              status: 'open' as const,
              discoveredAt: new Date().toISOString()
            }
          ],
          recommendations: [
            'Implement TLS 1.3 across all endpoints',
            'Regular security training for development team',
            'Automated vulnerability scanning in CI/CD pipeline'
          ]
        };

        setState(prev => ({
          ...prev,
          audits: [completedAudit, ...prev.audits]
        }));
      }, 3000);

      const updatedAudits = [audit, ...state.audits];
      setState(prev => ({
        ...prev,
        audits: updatedAudits
      }));

      console.log('Security audit started:', audit);
      return audit;
    } catch (error) {
      console.error('Error performing security audit:', error);
      throw error;
    }
  };

  const generateComplianceReport = async (framework: 'pci_dss' | 'gdpr' | 'sox' | 'iso27001' | 'hipaa'): Promise<ComplianceReport> => {
    try {
      const report: ComplianceReport = {
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        framework,
        version: framework === 'pci_dss' ? '4.0' : '2024.1',
        status: 'compliant',
        score: Math.floor(Math.random() * 20) + 80,
        requirements: [
          {
            id: 'req_001',
            title: 'Data Encryption',
            description: 'All sensitive data must be encrypted at rest and in transit',
            status: 'met',
            evidence: ['SSL certificates', 'Database encryption enabled'],
            lastAssessed: new Date().toISOString()
          },
          {
            id: 'req_002',
            title: 'Access Control',
            description: 'Implement strong access control measures',
            status: 'partially_met',
            evidence: ['Multi-factor authentication'],
            notes: 'Need to implement role-based access control',
            lastAssessed: new Date().toISOString(),
            nextAssessment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        generatedAt: new Date().toISOString(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        auditor: 'NodoX Compliance Team',
        metadata: {}
      };

      const updatedReports = [report, ...state.complianceReports];
      setState(prev => ({
        ...prev,
        complianceReports: updatedReports
      }));

      console.log('Compliance report generated:', report);
      return report;
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  };

  const encryptData = async (data: string, purpose: 'storage' | 'transmission' = 'storage'): Promise<string> => {
    try {
      if (!state.config.encryption.enabled) {
        console.warn('Encryption is disabled');
        return data;
      }

      const mockEncrypted = btoa(data + '_encrypted_' + Date.now());
      
      await logSecurityEvent({
        type: 'data_access',
        severity: 'info',
        ipAddress: '127.0.0.1',
        userAgent: 'NodoX-App',
        result: 'success',
        details: { 
          action: 'encrypt',
          purpose,
          algorithm: state.config.encryption.algorithm
        }
      });

      return mockEncrypted;
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw error;
    }
  };

  const decryptData = async (encryptedData: string): Promise<string> => {
    try {
      if (!state.config.encryption.enabled) {
        console.warn('Encryption is disabled');
        return encryptedData;
      }

      const decoded = atob(encryptedData);
      const originalData = decoded.split('_encrypted_')[0];
      
      await logSecurityEvent({
        type: 'data_access',
        severity: 'info',
        ipAddress: '127.0.0.1',
        userAgent: 'NodoX-App',
        result: 'success',
        details: { 
          action: 'decrypt',
          algorithm: state.config.encryption.algorithm
        }
      });

      return originalData;
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw error;
    }
  };

  const validateCompliance = async (framework: string): Promise<boolean> => {
    try {
      const report = state.complianceReports.find(r => r.framework === framework);
      
      if (!report) {
        console.warn(`No compliance report found for ${framework}`);
        return false;
      }

      const isValid = new Date(report.validUntil) > new Date();
      const isCompliant = report.status === 'compliant';
      
      return isValid && isCompliant;
    } catch (error) {
      console.error('Error validating compliance:', error);
      return false;
    }
  };

  return {
    ...state,
    logSecurityEvent,
    checkThreatIntelligence,
    performSecurityAudit,
    generateComplianceReport,
    encryptData,
    decryptData,
    validateCompliance,
    refreshData: loadSecurityData
  };
}