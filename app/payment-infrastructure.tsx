import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { CreditCard, Shield, Truck, Globe, AlertTriangle, CheckCircle, DollarSign, TrendingUp } from 'lucide-react-native';
import { usePayments } from '@/hooks/use-payments';
import { useLogistics } from '@/hooks/use-logistics';
import { useSecurity } from '@/hooks/use-security';

export default function PaymentInfrastructureScreen() {
  const [activeTab, setActiveTab] = useState<'payments' | 'logistics' | 'security'>('payments');
  const payments = usePayments();
  const logistics = useLogistics();
  const security = useSecurity();

  const handleTestPayment = async () => {
    try {
      const paymentIntent = await payments.createPaymentIntent({
        amount: 50000,
        currency: 'COP',
        paymentMethodId: 'pm_test_card',
        gatewayId: 'stripe_gateway',
        metadata: {
          orderId: 'order_test_001',
          description: 'Test payment for infrastructure'
        }
      });
      
      Alert.alert(
        'Payment Intent Created',
        `ID: ${paymentIntent.id}\nAmount: ${paymentIntent.amount} ${paymentIntent.currency}\nStatus: ${paymentIntent.status}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create payment intent');
    }
  };

  const handleTestShipping = async () => {
    try {
      const quotes = await logistics.calculateShippingQuotes({
        origin: {
          name: 'NodoX Warehouse',
          line1: 'Calle 100 #15-20',
          city: 'Bogotá',
          state: 'Cundinamarca',
          postalCode: '110111',
          country: 'CO',
          isResidential: false
        },
        destination: {
          name: 'Customer',
          line1: 'Carrera 7 #32-16',
          city: 'Medellín',
          state: 'Antioquia',
          postalCode: '050001',
          country: 'CO',
          isResidential: true
        },
        package: {
          weight: 2.5,
          dimensions: { length: 30, width: 20, height: 15 },
          value: 150000,
          currency: 'COP',
          description: 'Electronics',
          contents: [
            { name: 'Smartphone', quantity: 1, value: 150000, weight: 2.5 }
          ],
          signature_required: true
        }
      });

      const quotesText = quotes.map(q => 
        `${q.carrierId}: $${q.cost} ${q.currency} (${q.transitTime})`
      ).join('\n');

      Alert.alert(
        'Shipping Quotes',
        quotesText || 'No quotes available',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to calculate shipping quotes');
    }
  };

  const handleSecurityAudit = async () => {
    try {
      const audit = await security.performSecurityAudit('security_scan');
      Alert.alert(
        'Security Audit Started',
        `Audit ID: ${audit.id}\nType: ${audit.type}\nStatus: ${audit.status}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to start security audit');
    }
  };

  const renderPaymentsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <DollarSign size={24} color="#10B981" />
          <Text style={styles.statValue}>{payments.gateways.length}</Text>
          <Text style={styles.statLabel}>Payment Gateways</Text>
        </View>
        <View style={styles.statCard}>
          <Globe size={24} color="#3B82F6" />
          <Text style={styles.statValue}>{payments.supportedCurrencies.length}</Text>
          <Text style={styles.statLabel}>Currencies</Text>
        </View>
        <View style={styles.statCard}>
          <TrendingUp size={24} color="#8B5CF6" />
          <Text style={styles.statValue}>{payments.exchangeRates.length}</Text>
          <Text style={styles.statLabel}>Exchange Rates</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Payment Gateways</Text>
        {payments.gateways.map(gateway => (
          <View key={gateway.id} style={styles.gatewayCard}>
            <View style={styles.gatewayHeader}>
              <CreditCard size={20} color="#374151" />
              <Text style={styles.gatewayName}>{gateway.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: gateway.enabled ? '#10B981' : '#EF4444' }]}>
                <Text style={styles.statusText}>{gateway.enabled ? 'Active' : 'Inactive'}</Text>
              </View>
            </View>
            <Text style={styles.gatewayDetails}>
              Fee: {gateway.fees.percentage}% + {gateway.fees.fixed} {gateway.fees.currency}
            </Text>
            <Text style={styles.gatewayDetails}>
              Countries: {gateway.supportedCountries.join(', ')}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.testButton} onPress={handleTestPayment}>
        <Text style={styles.testButtonText}>Test Payment Intent</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLogisticsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Truck size={24} color="#10B981" />
          <Text style={styles.statValue}>{logistics.carriers.length}</Text>
          <Text style={styles.statLabel}>Carriers</Text>
        </View>
        <View style={styles.statCard}>
          <Globe size={24} color="#3B82F6" />
          <Text style={styles.statValue}>{logistics.deliveryZones.length}</Text>
          <Text style={styles.statLabel}>Delivery Zones</Text>
        </View>
        <View style={styles.statCard}>
          <TrendingUp size={24} color="#8B5CF6" />
          <Text style={styles.statValue}>{logistics.activeShipments.length}</Text>
          <Text style={styles.statLabel}>Active Shipments</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Carriers</Text>
        {logistics.carriers.map(carrier => (
          <View key={carrier.id} style={styles.carrierCard}>
            <View style={styles.carrierHeader}>
              <Truck size={20} color="#374151" />
              <Text style={styles.carrierName}>{carrier.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: carrier.enabled ? '#10B981' : '#EF4444' }]}>
                <Text style={styles.statusText}>{carrier.enabled ? 'Active' : 'Inactive'}</Text>
              </View>
            </View>
            <Text style={styles.carrierDetails}>
              Type: {carrier.type} • Services: {carrier.services.length}
            </Text>
            <Text style={styles.carrierDetails}>
              Countries: {carrier.supportedCountries.join(', ')}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.testButton} onPress={handleTestShipping}>
        <Text style={styles.testButtonText}>Calculate Shipping Quotes</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSecurityTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Shield size={24} color="#10B981" />
          <Text style={styles.statValue}>{security.config.encryption.enabled ? 'ON' : 'OFF'}</Text>
          <Text style={styles.statLabel}>Encryption</Text>
        </View>
        <View style={styles.statCard}>
          <CheckCircle size={24} color="#3B82F6" />
          <Text style={styles.statValue}>{security.config.pciCompliance.certified ? 'YES' : 'NO'}</Text>
          <Text style={styles.statLabel}>PCI Compliant</Text>
        </View>
        <View style={styles.statCard}>
          <AlertTriangle size={24} color="#F59E0B" />
          <Text style={styles.statValue}>{security.threats.length}</Text>
          <Text style={styles.statLabel}>Active Threats</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Configuration</Text>
        <View style={styles.securityCard}>
          <Text style={styles.securityTitle}>Encryption</Text>
          <Text style={styles.securityDetail}>
            Algorithm: {security.config.encryption.algorithm}
          </Text>
          <Text style={styles.securityDetail}>
            Key Size: {security.config.encryption.keySize} bits
          </Text>
        </View>

        <View style={styles.securityCard}>
          <Text style={styles.securityTitle}>PCI DSS Compliance</Text>
          <Text style={styles.securityDetail}>
            Level: {security.config.pciCompliance.level.toUpperCase()}
          </Text>
          <Text style={styles.securityDetail}>
            Expires: {security.config.pciCompliance.expiryDate}
          </Text>
        </View>

        <View style={styles.securityCard}>
          <Text style={styles.securityTitle}>GDPR Compliance</Text>
          <Text style={styles.securityDetail}>
            Data Retention: {security.config.gdprCompliance.dataRetentionDays} days
          </Text>
          <Text style={styles.securityDetail}>
            Right to Erasure: {security.config.gdprCompliance.rightToErasure ? 'Enabled' : 'Disabled'}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.testButton} onPress={handleSecurityAudit}>
        <Text style={styles.testButtonText}>Start Security Audit</Text>
      </TouchableOpacity>
    </View>
  );

  if (payments.isLoading || logistics.isLoading || security.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Payment Infrastructure' }} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading infrastructure...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Payment Infrastructure',
        headerStyle: { backgroundColor: '#1F2937' },
        headerTintColor: '#FFFFFF'
      }} />
      
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'payments' && styles.activeTab]}
          onPress={() => setActiveTab('payments')}
        >
          <CreditCard size={20} color={activeTab === 'payments' ? '#3B82F6' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'payments' && styles.activeTabText]}>
            Payments
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'logistics' && styles.activeTab]}
          onPress={() => setActiveTab('logistics')}
        >
          <Truck size={20} color={activeTab === 'logistics' ? '#3B82F6' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'logistics' && styles.activeTabText]}>
            Logistics
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'security' && styles.activeTab]}
          onPress={() => setActiveTab('security')}
        >
          <Shield size={20} color={activeTab === 'security' ? '#3B82F6' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'security' && styles.activeTabText]}>
            Security
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'payments' && renderPaymentsTab()}
        {activeTab === 'logistics' && renderLogisticsTab()}
        {activeTab === 'security' && renderSecurityTab()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280'
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6'
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280'
  },
  activeTabText: {
    color: '#3B82F6'
  },
  content: {
    flex: 1
  },
  tabContent: {
    padding: 16
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center'
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16
  },
  gatewayCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  gatewayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12
  },
  gatewayName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF'
  },
  gatewayDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4
  },
  carrierCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  carrierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12
  },
  carrierName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827'
  },
  carrierDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4
  },
  securityCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8
  },
  securityDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4
  },
  testButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  }
});