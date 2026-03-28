import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import {
  BarChart3,
  Bot,
  Globe,
  TrendingUp,
  Zap,
  Brain,
  Users,
  Target,
} from 'lucide-react-native';

interface Phase3FeaturesProps {
  userType: 'client' | 'ally' | 'admin';
}

export function Phase3Features({ userType }: Phase3FeaturesProps) {
  const features = [
    {
      id: 'business-intelligence',
      title: 'Business Intelligence',
      description: 'Dashboards en tiempo real y análisis predictivo',
      icon: BarChart3,
      color: '#3B82F6',
      route: '/business-intelligence',
      allowedUsers: ['admin', 'ally'],
    },
    {
      id: 'automation',
      title: 'Automatización IA',
      description: 'ChatBots, inventario y marketing automático',
      icon: Bot,
      color: '#8B5CF6',
      route: '/automation-dashboard',
      allowedUsers: ['admin', 'ally'],
    },
    {
      id: 'internationalization',
      title: 'Internacionalización',
      description: 'Multi-idioma, monedas y adaptación cultural',
      icon: Globe,
      color: '#10B981',
      route: '/internationalization',
      allowedUsers: ['admin'],
    },
  ];

  const availableFeatures = features.filter(feature => 
    feature.allowedUsers.includes(userType)
  );

  if (availableFeatures.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Funcionalidades Avanzadas</Text>
        <Text style={styles.subtitle}>Escalabilidad y Analytics</Text>
      </View>

      <View style={styles.featuresGrid}>
        {availableFeatures.map(feature => {
          const IconComponent = feature.icon;
          
          return (
            <TouchableOpacity
              key={feature.id}
              style={[styles.featureCard, { borderLeftColor: feature.color }]}
              onPress={() => router.push(feature.route as any)}
            >
              <View style={styles.featureHeader}>
                <View style={[styles.iconContainer, { backgroundColor: `${feature.color}20` }]}>
                  <IconComponent size={24} color={feature.color} />
                </View>
                <View style={styles.featureInfo}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
              
              <View style={styles.featureFooter}>
                <Text style={[styles.accessText, { color: feature.color }]}>
                  Acceder →
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {userType === 'admin' && (
        <View style={styles.adminSection}>
          <Text style={styles.adminTitle}>Panel de Control Avanzado</Text>
          <View style={styles.adminFeatures}>
            <View style={styles.adminFeature}>
              <TrendingUp size={16} color="#10B981" />
              <Text style={styles.adminFeatureText}>Análisis Predictivo</Text>
            </View>
            <View style={styles.adminFeature}>
              <Zap size={16} color="#F59E0B" />
              <Text style={styles.adminFeatureText}>Automatización Total</Text>
            </View>
            <View style={styles.adminFeature}>
              <Brain size={16} color="#8B5CF6" />
              <Text style={styles.adminFeatureText}>IA Avanzada</Text>
            </View>
            <View style={styles.adminFeature}>
              <Users size={16} color="#3B82F6" />
              <Text style={styles.adminFeatureText}>Segmentación</Text>
            </View>
          </View>
        </View>
      )}

      {userType === 'ally' && (
        <View style={styles.allySection}>
          <Text style={styles.allyTitle}>Herramientas para Aliados</Text>
          <View style={styles.allyFeatures}>
            <View style={styles.allyFeature}>
              <Target size={16} color="#10B981" />
              <Text style={styles.allyFeatureText}>Marketing Inteligente</Text>
            </View>
            <View style={styles.allyFeature}>
              <Bot size={16} color="#8B5CF6" />
              <Text style={styles.allyFeatureText}>Asistente Virtual</Text>
            </View>
            <View style={styles.allyFeature}>
              <BarChart3 size={16} color="#3B82F6" />
              <Text style={styles.allyFeatureText}>Analytics Avanzado</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  featureFooter: {
    alignItems: 'flex-end',
  },
  accessText: {
    fontSize: 14,
    fontWeight: '500',
  },
  adminSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  adminTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  adminFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  adminFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  adminFeatureText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  allySection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  allyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  allyFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  allyFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  allyFeatureText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
});