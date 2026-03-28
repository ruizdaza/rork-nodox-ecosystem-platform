import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import {
  Globe,
  DollarSign,
  MapPin,
  Users,
  TrendingUp,
  Settings,
  Plus,
  Check,
  Calendar,
  Clock,
  BarChart3,
  Languages,
  Coins,
  Flag,
} from 'lucide-react-native';
import { useInternationalization } from '@/hooks/use-internationalization';

export default function InternationalizationDashboard() {
  const {
    localizationConfig,
    regionalSettings,
    culturalAdaptation,
    analytics,
    currentLanguage,
    currentCurrency,
    currentRegion,
    updateLanguage,
    updateCurrency,
    updateRegion,
    translate,
    formatCurrency,
    formatDate,
    getSupportedRegions,
  } = useInternationalization();

  const [showLanguageModal, setShowLanguageModal] = useState<boolean>(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState<boolean>(false);
  const [showRegionModal, setShowRegionModal] = useState<boolean>(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'settings' | 'analytics'>('overview');

  const renderCurrentSettings = () => (
    <View style={styles.settingsContainer}>
      <Text style={styles.sectionTitle}>Configuración Actual</Text>
      
      <View style={styles.settingCard}>
        <View style={styles.settingHeader}>
          <Languages size={24} color="#3B82F6" />
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Idioma</Text>
            <Text style={styles.settingValue}>
              {localizationConfig?.supportedLanguages.find(l => l.code === currentLanguage)?.nativeName || currentLanguage}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => setShowLanguageModal(true)}
          >
            <Text style={styles.changeButtonText}>Cambiar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.settingCard}>
        <View style={styles.settingHeader}>
          <Coins size={24} color="#10B981" />
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Moneda</Text>
            <Text style={styles.settingValue}>
              {localizationConfig?.supportedCurrencies.find(c => c.code === currentCurrency)?.name || currentCurrency}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => setShowCurrencyModal(true)}
          >
            <Text style={styles.changeButtonText}>Cambiar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.settingCard}>
        <View style={styles.settingHeader}>
          <Flag size={24} color="#F59E0B" />
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Región</Text>
            <Text style={styles.settingValue}>{regionalSettings?.country || currentRegion}</Text>
          </View>
          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => setShowRegionModal(true)}
          >
            <Text style={styles.changeButtonText}>Cambiar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderLanguageSupport = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Soporte de Idiomas</Text>
      
      {localizationConfig?.supportedLanguages.map(language => (
        <View key={language.code} style={styles.languageCard}>
          <View style={styles.languageHeader}>
            <View style={styles.languageInfo}>
              <Text style={styles.languageName}>{language.nativeName}</Text>
              <Text style={styles.languageCode}>{language.name} ({language.code})</Text>
            </View>
            <View style={styles.languageStatus}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: language.isActive ? '#D1FAE5' : '#FEE2E2' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: language.isActive ? '#059669' : '#DC2626' }
                ]}>
                  {language.isActive ? 'Activo' : 'Inactivo'}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>
              Completitud: {language.completionPercentage}%
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${language.completionPercentage}%`,
                    backgroundColor: language.completionPercentage >= 90 ? '#10B981' : 
                                   language.completionPercentage >= 70 ? '#F59E0B' : '#EF4444'
                  }
                ]} 
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderRegionalSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Configuración Regional</Text>
      
      {regionalSettings && (
        <View style={styles.regionalCard}>
          <View style={styles.regionalHeader}>
            <MapPin size={24} color="#8B5CF6" />
            <Text style={styles.regionalTitle}>{regionalSettings.country}</Text>
          </View>
          
          <View style={styles.regionalDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Zona Horaria:</Text>
              <Text style={styles.detailValue}>{regionalSettings.timezone}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Impuesto:</Text>
              <Text style={styles.detailValue}>{regionalSettings.taxRate}%</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Moneda:</Text>
              <Text style={styles.detailValue}>{regionalSettings.currency}</Text>
            </View>
          </View>

          <View style={styles.shippingZones}>
            <Text style={styles.subsectionTitle}>Zonas de Envío</Text>
            {regionalSettings.shippingZones.map(zone => (
              <View key={zone.id} style={styles.zoneItem}>
                <Text style={styles.zoneName}>{zone.name}</Text>
                <Text style={styles.zoneDetails}>
                  {zone.rates.length} métodos de envío disponibles
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.paymentMethods}>
            <Text style={styles.subsectionTitle}>Métodos de Pago</Text>
            {regionalSettings.paymentMethods.map(method => (
              <View key={method.id} style={styles.methodItem}>
                <View style={styles.methodHeader}>
                  <Text style={styles.methodName}>{method.name}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: method.isActive ? '#D1FAE5' : '#FEE2E2' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: method.isActive ? '#059669' : '#DC2626' }
                    ]}>
                      {method.isActive ? 'Activo' : 'Inactivo'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.methodType}>Tipo: {method.type}</Text>
                <Text style={styles.methodCurrencies}>
                  Monedas: {method.supportedCurrencies.join(', ')}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderCulturalAdaptation = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Adaptación Cultural</Text>
      
      {culturalAdaptation && (
        <View style={styles.culturalCard}>
          <View style={styles.colorPreferences}>
            <Text style={styles.subsectionTitle}>Preferencias de Color</Text>
            <View style={styles.colorGrid}>
              {culturalAdaptation.colorPreferences.map((pref, index) => (
                <View key={index} style={styles.colorItem}>
                  <View 
                    style={[styles.colorSwatch, { backgroundColor: pref.color }]} 
                  />
                  <View style={styles.colorInfo}>
                    <Text style={styles.colorMeaning}>{pref.meaning}</Text>
                    <Text style={styles.colorUsage}>{pref.usage}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.holidays}>
            <Text style={styles.subsectionTitle}>Fechas Importantes</Text>
            {culturalAdaptation.holidaysAndEvents.map((holiday, index) => (
              <View key={index} style={styles.holidayItem}>
                <View style={styles.holidayHeader}>
                  <Text style={styles.holidayName}>{holiday.name}</Text>
                  <Text style={styles.holidayDate}>{holiday.date}</Text>
                </View>
                <View style={styles.holidayDetails}>
                  <Text style={styles.holidayType}>Tipo: {holiday.type}</Text>
                  <Text style={styles.holidayImpact}>
                    Impacto: {holiday.impact} • 
                    {holiday.marketingOpportunity ? ' Oportunidad de marketing' : ' Sin oportunidad'}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.businessHours}>
            <Text style={styles.subsectionTitle}>Horarios de Atención</Text>
            <View style={styles.hoursGrid}>
              <View style={styles.hoursItem}>
                <Text style={styles.hoursLabel}>Días de semana</Text>
                <Text style={styles.hoursValue}>
                  {culturalAdaptation.businessHours.weekdays.isOpen 
                    ? `${culturalAdaptation.businessHours.weekdays.openTime} - ${culturalAdaptation.businessHours.weekdays.closeTime}`
                    : 'Cerrado'
                  }
                </Text>
              </View>
              <View style={styles.hoursItem}>
                <Text style={styles.hoursLabel}>Fines de semana</Text>
                <Text style={styles.hoursValue}>
                  {culturalAdaptation.businessHours.weekends.isOpen 
                    ? `${culturalAdaptation.businessHours.weekends.openTime} - ${culturalAdaptation.businessHours.weekends.closeTime}`
                    : 'Cerrado'
                  }
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Análisis de Localización</Text>
      
      {analytics && (
        <>
          <View style={styles.analyticsCard}>
            <Text style={styles.cardTitle}>Uso por Idioma</Text>
            {analytics.languageUsage.map(usage => (
              <View key={usage.language} style={styles.usageItem}>
                <View style={styles.usageHeader}>
                  <Text style={styles.usageLanguage}>{usage.language.toUpperCase()}</Text>
                  <Text style={styles.usageUsers}>{usage.users.toLocaleString()} usuarios</Text>
                </View>
                <View style={styles.usageStats}>
                  <Text style={styles.usageStat}>
                    {usage.sessions.toLocaleString()} sesiones
                  </Text>
                  <Text style={styles.usageStat}>
                    {usage.conversionRate.toFixed(1)}% conversión
                  </Text>
                  <Text style={styles.usageStat}>
                    {formatCurrency(usage.revenue)} ingresos
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.analyticsCard}>
            <Text style={styles.cardTitle}>Rendimiento por Región</Text>
            {analytics.regionPerformance.map(region => (
              <View key={region.region} style={styles.regionItem}>
                <View style={styles.regionHeader}>
                  <Text style={styles.regionName}>{region.region}</Text>
                  <View style={styles.regionGrowth}>
                    <TrendingUp size={16} color="#10B981" />
                    <Text style={styles.growthText}>+{region.growthRate}%</Text>
                  </View>
                </View>
                <View style={styles.regionStats}>
                  <Text style={styles.regionStat}>
                    {region.users.toLocaleString()} usuarios
                  </Text>
                  <Text style={styles.regionStat}>
                    {formatCurrency(region.revenue)} ingresos
                  </Text>
                </View>
                <Text style={styles.topProducts}>
                  Top productos: {region.topProducts.join(', ')}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.analyticsCard}>
            <Text style={styles.cardTitle}>Calidad de Traducción</Text>
            {analytics.translationQuality.map(quality => (
              <View key={quality.language} style={styles.qualityItem}>
                <View style={styles.qualityHeader}>
                  <Text style={styles.qualityLanguage}>{quality.language.toUpperCase()}</Text>
                  <Text style={styles.qualityScore}>{quality.accuracy}% precisión</Text>
                </View>
                <View style={styles.qualityProgress}>
                  <Text style={styles.qualityLabel}>
                    Completitud: {quality.completeness}%
                  </Text>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          width: `${quality.completeness}%`,
                          backgroundColor: quality.completeness >= 90 ? '#10B981' : 
                                         quality.completeness >= 70 ? '#F59E0B' : '#EF4444'
                        }
                      ]} 
                    />
                  </View>
                </View>
                {quality.pendingUpdates > 0 && (
                  <Text style={styles.pendingUpdates}>
                    {quality.pendingUpdates} actualizaciones pendientes
                  </Text>
                )}
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );

  const renderViewSelector = () => (
    <View style={styles.viewSelector}>
      {(['overview', 'settings', 'analytics'] as const).map(view => (
        <TouchableOpacity
          key={view}
          style={[
            styles.viewButton,
            selectedView === view && styles.viewButtonActive
          ]}
          onPress={() => setSelectedView(view)}
        >
          <Text style={[
            styles.viewText,
            selectedView === view && styles.viewTextActive
          ]}>
            {view === 'overview' ? 'Resumen' :
             view === 'settings' ? 'Configuración' : 'Análisis'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Internacionalización',
          headerStyle: { backgroundColor: '#10B981' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }} 
      />

      {renderViewSelector()}

      <ScrollView style={styles.content}>
        {selectedView === 'overview' && (
          <>
            {renderCurrentSettings()}
            {renderLanguageSupport()}
          </>
        )}
        
        {selectedView === 'settings' && (
          <>
            {renderRegionalSettings()}
            {renderCulturalAdaptation()}
          </>
        )}
        
        {selectedView === 'analytics' && renderAnalytics()}
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Idioma</Text>
            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
              <Text style={styles.modalClose}>Cerrar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {localizationConfig?.supportedLanguages.map(language => (
              <TouchableOpacity
                key={language.code}
                style={styles.optionItem}
                onPress={() => {
                  updateLanguage(language.code);
                  setShowLanguageModal(false);
                }}
              >
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>{language.nativeName}</Text>
                  <Text style={styles.optionSubtitle}>{language.name}</Text>
                </View>
                {currentLanguage === language.code && (
                  <Check size={20} color="#10B981" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Currency Selection Modal */}
      <Modal
        visible={showCurrencyModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Moneda</Text>
            <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
              <Text style={styles.modalClose}>Cerrar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {localizationConfig?.supportedCurrencies.map(currency => (
              <TouchableOpacity
                key={currency.code}
                style={styles.optionItem}
                onPress={() => {
                  updateCurrency(currency.code);
                  setShowCurrencyModal(false);
                }}
              >
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>{currency.name}</Text>
                  <Text style={styles.optionSubtitle}>{currency.code} ({currency.symbol})</Text>
                </View>
                {currentCurrency === currency.code && (
                  <Check size={20} color="#10B981" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Region Selection Modal */}
      <Modal
        visible={showRegionModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Región</Text>
            <TouchableOpacity onPress={() => setShowRegionModal(false)}>
              <Text style={styles.modalClose}>Cerrar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {getSupportedRegions().map(region => (
              <TouchableOpacity
                key={region}
                style={styles.optionItem}
                onPress={() => {
                  updateRegion(region);
                  setShowRegionModal(false);
                }}
              >
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>{region}</Text>
                </View>
                {currentRegion === region && (
                  <Check size={20} color="#10B981" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  viewSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  viewButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  viewButtonActive: {
    borderBottomColor: '#10B981',
  },
  viewText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  viewTextActive: {
    color: '#10B981',
  },
  content: {
    flex: 1,
  },
  settingsContainer: {
    padding: 20,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  settingValue: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  changeButton: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  languageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  languageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  languageCode: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  languageStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  regionalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  regionalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  regionalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  regionalDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  shippingZones: {
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  zoneItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  zoneName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  zoneDetails: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  paymentMethods: {
    marginBottom: 20,
  },
  methodItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  methodName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  methodType: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  methodCurrencies: {
    fontSize: 12,
    color: '#6B7280',
  },
  culturalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  colorPreferences: {
    marginBottom: 24,
  },
  colorGrid: {
    gap: 12,
  },
  colorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  colorInfo: {
    flex: 1,
  },
  colorMeaning: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  colorUsage: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  holidays: {
    marginBottom: 24,
  },
  holidayItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  holidayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  holidayName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  holidayDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  holidayDetails: {
    gap: 2,
  },
  holidayType: {
    fontSize: 12,
    color: '#6B7280',
  },
  holidayImpact: {
    fontSize: 12,
    color: '#6B7280',
  },
  businessHours: {
    marginBottom: 20,
  },
  hoursGrid: {
    gap: 12,
  },
  hoursItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  hoursLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  hoursValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  usageItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageLanguage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  usageUsers: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  usageStats: {
    flexDirection: 'row',
    gap: 16,
  },
  usageStat: {
    fontSize: 12,
    color: '#6B7280',
  },
  regionItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  regionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  regionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  regionGrowth: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  growthText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10B981',
  },
  regionStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  regionStat: {
    fontSize: 12,
    color: '#6B7280',
  },
  topProducts: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  qualityItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  qualityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  qualityLanguage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  qualityScore: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
  },
  qualityProgress: {
    marginBottom: 4,
  },
  qualityLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  pendingUpdates: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalClose: {
    fontSize: 16,
    color: '#10B981',
  },
  modalContent: {
    flex: 1,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
});