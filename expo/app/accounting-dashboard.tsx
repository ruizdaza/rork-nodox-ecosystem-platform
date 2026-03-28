import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import {
  ArrowLeft,
  BookOpen,
  TrendingUp,
  DollarSign,
  FileText,
  BarChart3,
  CheckCircle,
  AlertCircle
} from 'lucide-react-native';
import { useAccounting } from '@/hooks/use-accounting';

export default function AccountingDashboard() {
  const router = useRouter();
  const { accounts, journalEntries, getTrialBalance, getGeneralLedger } = useAccounting();
  const [activeView, setActiveView] = useState<'overview' | 'accounts' | 'entries' | 'reports'>('overview');

  const trialBalance = getTrialBalance();
  const postedEntries = journalEntries.filter(e => e.status === 'posted');
  const draftEntries = journalEntries.filter(e => e.status === 'draft');

  const totalAssets = accounts
    .filter(a => a.type === 'asset')
    .reduce((sum, a) => sum + a.balance, 0);

  const totalLiabilities = accounts
    .filter(a => a.type === 'liability')
    .reduce((sum, a) => sum + a.balance, 0);

  const totalEquity = accounts
    .filter(a => a.type === 'equity')
    .reduce((sum, a) => sum + a.balance, 0);

  const totalRevenue = accounts
    .filter(a => a.type === 'revenue')
    .reduce((sum, a) => sum + a.balance, 0);

  const totalExpenses = accounts
    .filter(a => a.type === 'expense')
    .reduce((sum, a) => sum + a.balance, 0);

  const netIncome = totalRevenue - totalExpenses;

  const renderOverview = () => (
    <View>
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <TrendingUp color="#2563eb" size={24} />
          <Text style={styles.metricValue}>${totalAssets.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Activos Totales</Text>
        </View>
        
        <View style={styles.metricCard}>
          <DollarSign color="#dc2626" size={24} />
          <Text style={styles.metricValue}>${totalLiabilities.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Pasivos Totales</Text>
        </View>
        
        <View style={styles.metricCard}>
          <BarChart3 color="#7c3aed" size={24} />
          <Text style={styles.metricValue}>${totalEquity.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Patrimonio</Text>
        </View>
        
        <View style={styles.metricCard}>
          <DollarSign color={netIncome >= 0 ? '#059669' : '#dc2626'} size={24} />
          <Text style={[
            styles.metricValue,
            { color: netIncome >= 0 ? '#059669' : '#dc2626' }
          ]}>
            ${Math.abs(netIncome).toLocaleString()}
          </Text>
          <Text style={styles.metricLabel}>
            {netIncome >= 0 ? 'Utilidad Neta' : 'Pérdida Neta'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Balance de Comprobación</Text>
        <View style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Total Débito:</Text>
            <Text style={styles.balanceValue}>
              ${trialBalance.totalDebit.toLocaleString()}
            </Text>
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Total Crédito:</Text>
            <Text style={styles.balanceValue}>
              ${trialBalance.totalCredit.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.balanceRow, styles.balanceRowFinal]}>
            <View style={styles.balanceStatus}>
              {trialBalance.isBalanced ? (
                <>
                  <CheckCircle color="#059669" size={16} />
                  <Text style={[styles.balanceLabel, { color: '#059669' }]}>
                    Balanceado
                  </Text>
                </>
              ) : (
                <>
                  <AlertCircle color="#dc2626" size={16} />
                  <Text style={[styles.balanceLabel, { color: '#dc2626' }]}>
                    Desbalanceado
                  </Text>
                </>
              )}
            </View>
            <Text style={styles.balanceDifference}>
              Diferencia: ${Math.abs(trialBalance.difference).toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumen de Asientos</Text>
        <View style={styles.entriesCard}>
          <View style={styles.entriesRow}>
            <FileText color="#2563eb" size={20} />
            <View style={styles.entriesInfo}>
              <Text style={styles.entriesValue}>{postedEntries.length}</Text>
              <Text style={styles.entriesLabel}>Asientos Contabilizados</Text>
            </View>
          </View>
          <View style={styles.entriesRow}>
            <FileText color="#f59e0b" size={20} />
            <View style={styles.entriesInfo}>
              <Text style={styles.entriesValue}>{draftEntries.length}</Text>
              <Text style={styles.entriesLabel}>Borradores</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderAccounts = () => (
    <View>
      <Text style={styles.sectionTitle}>Plan de Cuentas</Text>
      
      {['asset', 'liability', 'equity', 'revenue', 'expense'].map(type => {
        const typeAccounts = accounts.filter(a => a.type === type);
        if (typeAccounts.length === 0) return null;

        const typeLabels: { [key: string]: string } = {
          asset: 'Activos',
          liability: 'Pasivos',
          equity: 'Patrimonio',
          revenue: 'Ingresos',
          expense: 'Gastos'
        };

        return (
          <View key={type} style={styles.accountTypeSection}>
            <Text style={styles.accountTypeTitle}>{typeLabels[type]}</Text>
            {typeAccounts.map(account => (
              <View key={account.id} style={styles.accountCard}>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountCode}>{account.code}</Text>
                  <Text style={styles.accountName}>{account.name}</Text>
                </View>
                <View style={styles.accountBalance}>
                  <Text style={styles.accountBalanceLabel}>Saldo:</Text>
                  <Text style={[
                    styles.accountBalanceValue,
                    account.balance < 0 && { color: '#dc2626' }
                  ]}>
                    ${Math.abs(account.balance).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );

  const renderEntries = () => (
    <View>
      <Text style={styles.sectionTitle}>Libro Diario</Text>
      {journalEntries.length === 0 ? (
        <View style={styles.emptyState}>
          <BookOpen color="#94a3b8" size={48} />
          <Text style={styles.emptyStateText}>No hay asientos contables</Text>
        </View>
      ) : (
        journalEntries.slice(0, 20).map(entry => (
          <View key={entry.id} style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <View>
                <Text style={styles.entryNumber}>{entry.entryNumber}</Text>
                <Text style={styles.entryDate}>
                  {new Date(entry.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={[
                styles.entryStatus,
                entry.status === 'posted' && styles.entryStatusPosted
              ]}>
                <Text style={[
                  styles.entryStatusText,
                  entry.status === 'posted' && styles.entryStatusTextPosted
                ]}>
                  {entry.status === 'posted' ? 'Contabilizado' : 'Borrador'}
                </Text>
              </View>
            </View>
            
            <Text style={styles.entryDescription}>{entry.description}</Text>
            
            <View style={styles.entryTotals}>
              <View style={styles.entryTotal}>
                <Text style={styles.entryTotalLabel}>Débito:</Text>
                <Text style={styles.entryTotalValue}>
                  ${entry.totalDebit.toLocaleString()}
                </Text>
              </View>
              <View style={styles.entryTotal}>
                <Text style={styles.entryTotalLabel}>Crédito:</Text>
                <Text style={styles.entryTotalValue}>
                  ${entry.totalCredit.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderReports = () => (
    <View>
      <Text style={styles.sectionTitle}>Informes Financieros</Text>
      
      <View style={styles.reportCard}>
        <Text style={styles.reportTitle}>Estado de Resultados</Text>
        <View style={styles.reportSection}>
          <View style={styles.reportRow}>
            <Text style={styles.reportLabel}>Ingresos:</Text>
            <Text style={styles.reportValue}>${totalRevenue.toLocaleString()}</Text>
          </View>
          <View style={styles.reportRow}>
            <Text style={styles.reportLabel}>Gastos:</Text>
            <Text style={styles.reportValue}>-${totalExpenses.toLocaleString()}</Text>
          </View>
          <View style={[styles.reportRow, styles.reportRowFinal]}>
            <Text style={styles.reportLabelBold}>Utilidad/Pérdida Neta:</Text>
            <Text style={[
              styles.reportValueBold,
              { color: netIncome >= 0 ? '#059669' : '#dc2626' }
            ]}>
              ${Math.abs(netIncome).toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.reportCard}>
        <Text style={styles.reportTitle}>Balance General</Text>
        <View style={styles.reportSection}>
          <Text style={styles.reportSectionTitle}>ACTIVOS</Text>
          <View style={styles.reportRow}>
            <Text style={styles.reportLabel}>Total Activos:</Text>
            <Text style={styles.reportValue}>${totalAssets.toLocaleString()}</Text>
          </View>
        </View>
        
        <View style={styles.reportSection}>
          <Text style={styles.reportSectionTitle}>PASIVOS</Text>
          <View style={styles.reportRow}>
            <Text style={styles.reportLabel}>Total Pasivos:</Text>
            <Text style={styles.reportValue}>${totalLiabilities.toLocaleString()}</Text>
          </View>
        </View>
        
        <View style={styles.reportSection}>
          <Text style={styles.reportSectionTitle}>PATRIMONIO</Text>
          <View style={styles.reportRow}>
            <Text style={styles.reportLabel}>Total Patrimonio:</Text>
            <Text style={styles.reportValue}>${totalEquity.toLocaleString()}</Text>
          </View>
        </View>
        
        <View style={[styles.reportRow, styles.reportRowFinal]}>
          <Text style={styles.reportLabelBold}>Pasivo + Patrimonio:</Text>
          <Text style={styles.reportValueBold}>
            ${(totalLiabilities + totalEquity).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Contabilidad',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft color="#1e293b" size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.tabBar}>
        {[
          { id: 'overview', label: 'Resumen', icon: BarChart3 },
          { id: 'accounts', label: 'Cuentas', icon: BookOpen },
          { id: 'entries', label: 'Asientos', icon: FileText },
          { id: 'reports', label: 'Reportes', icon: TrendingUp }
        ].map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeView === tab.id && styles.tabActive]}
            onPress={() => setActiveView(tab.id as any)}
          >
            <tab.icon
              color={activeView === tab.id ? '#2563eb' : '#64748b'}
              size={20}
            />
            <Text style={[
              styles.tabText,
              activeView === tab.id && styles.tabTextActive
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeView === 'overview' && renderOverview()}
        {activeView === 'accounts' && renderAccounts()}
        {activeView === 'entries' && renderEntries()}
        {activeView === 'reports' && renderReports()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#2563eb',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: '#ffffff',
    flex: 1,
    minWidth: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  balanceCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceRowFinal: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    marginTop: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  balanceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceDifference: {
    fontSize: 12,
    color: '#94a3b8',
  },
  entriesCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  entriesInfo: {
    flex: 1,
  },
  entriesValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  entriesLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  accountTypeSection: {
    marginBottom: 24,
  },
  accountTypeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  accountCard: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  accountInfo: {
    flex: 1,
  },
  accountCode: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 2,
  },
  accountName: {
    fontSize: 14,
    color: '#1e293b',
  },
  accountBalance: {
    alignItems: 'flex-end',
  },
  accountBalanceLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginBottom: 2,
  },
  accountBalanceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  entryCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entryNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 2,
  },
  entryDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  entryStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fef3c7',
    borderRadius: 4,
  },
  entryStatusPosted: {
    backgroundColor: '#dcfce7',
  },
  entryStatusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#92400e',
  },
  entryStatusTextPosted: {
    color: '#166534',
  },
  entryDescription: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 12,
  },
  entryTotals: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  entryTotal: {
    flex: 1,
  },
  entryTotalLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 2,
  },
  entryTotalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 12,
  },
  reportCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  reportSection: {
    marginBottom: 12,
  },
  reportSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reportRowFinal: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    marginTop: 4,
  },
  reportLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  reportValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  reportLabelBold: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  reportValueBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
});
