import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ReferralAnalytics, ReferralFunnel } from '@/types/referral';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 40;
const CHART_HEIGHT = 200;

interface LineChartProps {
  data: ReferralAnalytics['chartData'];
  dataKey: 'leads' | 'conversions' | 'revenue';
  color: string;
  label: string;
}

export const LineChart: React.FC<LineChartProps> = ({ data, dataKey, color, label }) => {
  if (data.length === 0) return null;

  const values = data.map(d => d[dataKey]);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const range = maxValue - minValue || 1;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * CHART_WIDTH;
    const normalizedValue = (item[dataKey] - minValue) / range;
    const y = CHART_HEIGHT - (normalizedValue * (CHART_HEIGHT - 40)) - 20;
    return { x, y, value: item[dataKey] };
  });



  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartLabel}>{label}</Text>
      <View style={[styles.chart, { width: CHART_WIDTH, height: CHART_HEIGHT }]}>
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>{maxValue.toLocaleString()}</Text>
          <Text style={styles.axisLabel}>{Math.round(maxValue / 2).toLocaleString()}</Text>
          <Text style={styles.axisLabel}>0</Text>
        </View>
        
        <View style={styles.chartArea}>
          <View style={styles.gridLines}>
            {[0, 1, 2, 3, 4].map(i => (
              <View key={i} style={styles.gridLine} />
            ))}
          </View>

          <View style={styles.lineContainer}>
            {points.map((point, index) => {
              if (index === 0) return null;
              const prevPoint = points[index - 1];
              const lineWidth = Math.sqrt(
                Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2)
              );
              const angle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x) * (180 / Math.PI);

              return (
                <View
                  key={index}
                  style={[
                    styles.line,
                    {
                      width: lineWidth,
                      left: prevPoint.x,
                      top: prevPoint.y,
                      backgroundColor: color,
                      transform: [{ rotate: `${angle}deg` }],
                    },
                  ]}
                />
              );
            })}
            
            {points.map((point, index) => (
              <View
                key={`dot-${index}`}
                style={[
                  styles.dot,
                  {
                    left: point.x - 4,
                    top: point.y - 4,
                    backgroundColor: color,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>
      
      <View style={styles.xAxis}>
        <Text style={styles.axisLabel}>{data[0]?.date.slice(5)}</Text>
        <Text style={styles.axisLabel}>{data[Math.floor(data.length / 2)]?.date.slice(5)}</Text>
        <Text style={styles.axisLabel}>{data[data.length - 1]?.date.slice(5)}</Text>
      </View>
    </View>
  );
};

interface BarChartProps {
  data: ReferralAnalytics['sourceBreakdown'];
  color: string;
  label: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, color, label }) => {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.leads), 1);

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      direct_link: 'Link Directo',
      qr_code: 'Código QR',
      social_media: 'Redes Sociales',
      email: 'Email',
      whatsapp: 'WhatsApp',
      other: 'Otro',
    };
    return labels[source] || source;
  };

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartLabel}>{label}</Text>
      <View style={[styles.chart, { width: CHART_WIDTH, height: CHART_HEIGHT }]}>
        <View style={styles.barChartContainer}>
          {data.map((item, index) => {
            const barHeight = (item.leads / maxValue) * (CHART_HEIGHT - 60);
            return (
              <View key={index} style={styles.barWrapper}>
                <View style={styles.barContainer}>
                  <Text style={styles.barValue}>{item.leads}</Text>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: color,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel} numberOfLines={2}>
                  {getSourceLabel(item.source)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

interface FunnelChartProps {
  data: ReferralFunnel[];
}

export const FunnelChart: React.FC<FunnelChartProps> = ({ data }) => {
  if (data.length === 0) return null;

  const maxCount = data[0]?.count || 1;

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      lead: 'Lead',
      contacted: 'Contactado',
      qualified: 'Calificado',
      converted: 'Convertido',
    };
    return labels[stage] || stage;
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      lead: '#3b82f6',
      contacted: '#8b5cf6',
      qualified: '#f59e0b',
      converted: '#10b981',
    };
    return colors[stage] || '#64748b';
  };

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartLabel}>Embudo de Conversión</Text>
      <View style={styles.funnelContainer}>
        {data.map((stage, index) => {
          const widthPercentage = (stage.count / maxCount) * 100;
          const color = getStageColor(stage.stage);

          return (
            <View key={index} style={styles.funnelStage}>
              <View style={styles.funnelStageInfo}>
                <Text style={styles.funnelStageLabel}>{getStageLabel(stage.stage)}</Text>
                <Text style={styles.funnelStageCount}>{stage.count}</Text>
              </View>
              <View style={styles.funnelBarContainer}>
                <View
                  style={[
                    styles.funnelBar,
                    {
                      width: `${widthPercentage}%`,
                      backgroundColor: color,
                    },
                  ]}
                >
                  <Text style={styles.funnelBarText}>{stage.percentage.toFixed(1)}%</Text>
                </View>
              </View>
              {index < data.length - 1 && stage.dropoffRate > 0 && (
                <Text style={styles.dropoffText}>
                  ↓ {stage.dropoffRate.toFixed(1)}% abandono
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, change, icon, color = '#3b82f6' }) => {
  const changeColor = change && change > 0 ? '#10b981' : change && change < 0 ? '#ef4444' : '#64748b';
  const changeIcon = change && change > 0 ? '↑' : change && change < 0 ? '↓' : '';

  return (
    <View style={styles.metricCard}>
      {icon && <View style={[styles.metricIcon, { backgroundColor: `${color}20` }]}><Text>{icon}</Text></View>}
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      {change !== undefined && (
        <Text style={[styles.metricChange, { color: changeColor }]}>
          {changeIcon} {Math.abs(change).toFixed(1)}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    marginBottom: 24,
  },
  chartLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  chart: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  yAxis: {
    position: 'absolute',
    left: 0,
    top: 16,
    height: CHART_HEIGHT - 40,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  axisLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  chartArea: {
    marginLeft: 40,
    height: CHART_HEIGHT - 40,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  lineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  line: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 60,
    marginTop: 8,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: CHART_HEIGHT - 60,
    paddingBottom: 8,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: CHART_HEIGHT - 80,
  },
  bar: {
    width: 30,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 4,
  },
  barValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 60,
  },
  funnelContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  funnelStage: {
    marginBottom: 16,
  },
  funnelStageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  funnelStageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  funnelStageCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  funnelBarContainer: {
    height: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  funnelBar: {
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 12,
    minWidth: 60,
  },
  funnelBarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  dropoffText: {
    fontSize: 11,
    color: '#ef4444',
    marginTop: 4,
    textAlign: 'right',
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minWidth: 150,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  metricChange: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
