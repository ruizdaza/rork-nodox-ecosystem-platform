import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Calendar,
  BarChart3,
  PieChart,
} from "lucide-react-native";

export default function ReferralAnalytics() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");

  const analyticsData = {
    totalLeads: 156,
    leadsGrowth: 23,
    conversions: 42,
    conversionRate: 26.9,
    revenue: 8450000,
    revenueGrowth: 18,
    averageValue: 201190,
    topSources: [
      { name: "Link directo", value: 45, percentage: 28.8 },
      { name: "WhatsApp", value: 38, percentage: 24.4 },
      { name: "Redes sociales", value: 32, percentage: 20.5 },
      { name: "Email", value: 25, percentage: 16.0 },
      { name: "Código QR", value: 16, percentage: 10.3 },
    ],
    monthlyTrend: [
      { month: "Ene", leads: 12, conversions: 3 },
      { month: "Feb", leads: 18, conversions: 5 },
      { month: "Mar", leads: 25, conversions: 7 },
      { month: "Abr", leads: 32, conversions: 9 },
      { month: "May", leads: 38, conversions: 10 },
      { month: "Jun", leads: 31, conversions: 8 },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Analytics de Referidos",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft color="#1e293b" size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics Detallado</Text>
          <View style={styles.timeRangeSelector}>
            {(["week", "month", "year"] as const).map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.timeRangeButton,
                  timeRange === range && styles.timeRangeButtonActive,
                ]}
                onPress={() => setTimeRange(range)}
              >
                <Text
                  style={[
                    styles.timeRangeText,
                    timeRange === range && styles.timeRangeTextActive,
                  ]}
                >
                  {range === "week" ? "Semana" : range === "month" ? "Mes" : "Año"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Users color="#3b82f6" size={20} />
              <View
                style={[
                  styles.trendBadge,
                  { backgroundColor: "#10b98120" },
                ]}
              >
                <TrendingUp color="#10b981" size={12} />
                <Text style={[styles.trendText, { color: "#10b981" }]}>
                  +{analyticsData.leadsGrowth}%
                </Text>
              </View>
            </View>
            <Text style={styles.metricValue}>{analyticsData.totalLeads}</Text>
            <Text style={styles.metricLabel}>Total Leads</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Target color="#f59e0b" size={20} />
              <Text style={styles.conversionRate}>
                {analyticsData.conversionRate}%
              </Text>
            </View>
            <Text style={styles.metricValue}>{analyticsData.conversions}</Text>
            <Text style={styles.metricLabel}>Conversiones</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <DollarSign color="#10b981" size={20} />
              <View
                style={[
                  styles.trendBadge,
                  { backgroundColor: "#10b98120" },
                ]}
              >
                <TrendingUp color="#10b981" size={12} />
                <Text style={[styles.trendText, { color: "#10b981" }]}>
                  +{analyticsData.revenueGrowth}%
                </Text>
              </View>
            </View>
            <Text style={styles.metricValue}>
              ${(analyticsData.revenue / 1000000).toFixed(1)}M
            </Text>
            <Text style={styles.metricLabel}>Ingresos generados</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <BarChart3 color="#8b5cf6" size={20} />
            </View>
            <Text style={styles.metricValue}>
              ${(analyticsData.averageValue / 1000).toFixed(0)}K
            </Text>
            <Text style={styles.metricLabel}>Valor promedio</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fuentes principales</Text>
          <View style={styles.sourcesContainer}>
            {analyticsData.topSources.map((source, index) => (
              <View key={index} style={styles.sourceItem}>
                <View style={styles.sourceHeader}>
                  <Text style={styles.sourceName}>{source.name}</Text>
                  <Text style={styles.sourceValue}>{source.value} leads</Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${source.percentage}%`,
                        backgroundColor:
                          index === 0
                            ? "#3b82f6"
                            : index === 1
                            ? "#10b981"
                            : index === 2
                            ? "#f59e0b"
                            : index === 3
                            ? "#8b5cf6"
                            : "#64748b",
                      },
                    ]}
                  />
                </View>
                <Text style={styles.sourcePercentage}>
                  {source.percentage.toFixed(1)}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tendencia mensual</Text>
          <View style={styles.chartContainer}>
            <View style={styles.chartBars}>
              {analyticsData.monthlyTrend.map((item, index) => (
                <View key={index} style={styles.barGroup}>
                  <View style={styles.barsColumn}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: (item.leads / 40) * 100,
                          backgroundColor: "#3b82f6",
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.bar,
                        {
                          height: (item.conversions / 40) * 100,
                          backgroundColor: "#10b981",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{item.month}</Text>
                </View>
              ))}
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#3b82f6" }]} />
                <Text style={styles.legendText}>Leads</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#10b981" }]} />
                <Text style={styles.legendText}>Conversiones</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights</Text>
          <View style={styles.insightCard}>
            <TrendingUp color="#10b981" size={24} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Mejor rendimiento</Text>
              <Text style={styles.insightText}>
                Los enlaces directos son tu fuente más efectiva con 28.8% de los
                leads
              </Text>
            </View>
          </View>

          <View style={styles.insightCard}>
            <Calendar color="#3b82f6" size={24} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Tendencia positiva</Text>
              <Text style={styles.insightText}>
                Crecimiento constante del 23% en los últimos 30 días
              </Text>
            </View>
          </View>

          <View style={styles.insightCard}>
            <Target color="#f59e0b" size={24} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Oportunidad de mejora</Text>
              <Text style={styles.insightText}>
                Tu tasa de conversión de 26.9% está por encima del promedio
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#1e293b",
    marginBottom: 16,
  },
  timeRangeSelector: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  timeRangeButtonActive: {
    backgroundColor: "#3b82f6",
  },
  timeRangeText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: "#64748b",
  },
  timeRangeTextActive: {
    color: "#ffffff",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 2,
  },
  trendText: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
  conversionRate: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#f59e0b",
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#1e293b",
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: "#64748b",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#1e293b",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sourcesContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  sourceItem: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sourceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sourceName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1e293b",
  },
  sourceValue: {
    fontSize: 12,
    color: "#64748b",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  sourcePercentage: {
    fontSize: 11,
    color: "#64748b",
    textAlign: "right",
  },
  chartContainer: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartBars: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 150,
    marginBottom: 16,
  },
  barGroup: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  barsColumn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    width: "100%",
    justifyContent: "center",
  },
  bar: {
    width: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    color: "#64748b",
  },
  chartLegend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: "#64748b",
  },
  insightCard: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    gap: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1e293b",
    marginBottom: 4,
  },
  insightText: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 18,
  },
});
