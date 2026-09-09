import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, Text as SvgText } from 'react-native-svg';
import { Text } from './Text';
import { Card } from './Card';
import { useTranslation } from '../i18n';
import { Zap, TrendingUp, MessageSquare, Clock } from 'lucide-react-native';

interface GrowthChartProps {
  automationRuns: number;
  activeAutomations: number;
  unreadMessages: number;
  avgResponse: string;
  colors: any;
}

const DATA_PERIODS = {
  '7D': [
    { label: 'Mon', value: 12 },
    { label: 'Tue', value: 28 },
    { label: 'Wed', value: 45 },
    { label: 'Thu', value: 38 },
    { label: 'Fri', value: 65 },
    { label: 'Sat', value: 52 },
    { label: 'Sun', value: 84 },
  ],
  '30D': [
    { label: 'W1', value: 120 },
    { label: 'W2', value: 240 },
    { label: 'W3', value: 180 },
    { label: 'W4', value: 350 },
  ],
  '90D': [
    { label: 'Month 1', value: 450 },
    { label: 'Month 2', value: 780 },
    { label: 'Month 3', value: 1120 },
  ],
  '1Y': [
    { label: 'Q1', value: 1200 },
    { label: 'Q2', value: 2100 },
    { label: 'Q3', value: 3400 },
    { label: 'Q4', value: 4800 },
  ],
};

const chartWidth = Dimensions.get('window').width - 64; // padding
const chartHeight = 140;

export const GrowthChart: React.FC<GrowthChartProps> = ({
  automationRuns,
  activeAutomations,
  unreadMessages,
  avgResponse,
  colors,
}) => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<'7D' | '30D' | '90D' | '1Y'>('7D');
  const points = DATA_PERIODS[period];

  const maxValue = Math.max(...points.map((p) => p.value)) * 1.25 || 100;
  const minValue = 0;

  const paddingX = 16;
  const paddingY = 16;

  const getX = (idx: number) => paddingX + (idx / (points.length - 1)) * (chartWidth - paddingX * 2);
  const getY = (val: number) => chartHeight - paddingY - (val / maxValue) * (chartHeight - paddingY * 2);

  const pathD = points.reduce((acc, pt, idx) => {
    const x = getX(idx);
    const y = getY(pt.value);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const areaD = `${pathD} L ${getX(points.length - 1)} ${chartHeight} L ${getX(0)} ${chartHeight} Z`;

  const lastPoint = points[points.length - 1];
  const lastX = getX(points.length - 1);
  const lastY = getY(lastPoint.value);

  return (
    <Card style={styles.container}>
      {/* Header with Title & Period Filters */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <TrendingUp size={18} color={colors.primary} style={{ marginRight: 8 }} />
          <Text variant="h3" weight="bold" color={colors.textPrimary}>
            {t('home.growthActivity')}
          </Text>
        </View>

        <View style={styles.periodRow}>
          {(['7D', '30D', '90D', '1Y'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              style={[
                styles.periodPill,
                period === p && { backgroundColor: colors.primary },
              ]}
              activeOpacity={0.7}
            >
              <Text
                variant="caption"
                weight={period === p ? 'bold' : 'regular'}
                color={period === p ? '#FFFFFF' : colors.textMuted}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* SVG Chart */}
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.4" />
              <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          <Line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke={colors.border} strokeDasharray="4 4" strokeWidth="1" />
          <Line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke={colors.border} strokeDasharray="4 4" strokeWidth="1" />
          <Line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke={colors.border} strokeWidth="1" />

          {/* Area Fill */}
          <Path d={areaD} fill="url(#growthGradient)" />

          {/* Line Path */}
          <Path d={pathD} fill="none" stroke={colors.primary} strokeWidth="3" />

          {/* X Axis Labels & Points */}
          {points.map((pt, idx) => {
            const x = getX(idx);
            const y = getY(pt.value);
            return (
              <React.Fragment key={idx}>
                <Circle cx={x} cy={y} r="4" fill={colors.background} stroke={colors.primary} strokeWidth="2" />
                <SvgText
                  x={x}
                  y={chartHeight - 4}
                  fontSize="10"
                  fill={colors.textMuted}
                  textAnchor="middle"
                >
                  {pt.label}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Glowing Endpoint Dot */}
          <Circle cx={lastX} cy={lastY} r="7" fill={colors.primary} opacity="0.3" />
          <Circle cx={lastX} cy={lastY} r="4" fill={colors.primary} />
        </Svg>
      </View>

      {/* Key Metric Indicators below chart */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <Zap size={14} color={colors.primary} />
          <Text variant="caption" color={colors.textMuted} style={styles.metricLabel}>
            Runs
          </Text>
          <Text variant="body" weight="bold" color={colors.textPrimary}>
            {automationRuns}
          </Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <TrendingUp size={14} color="#10B981" />
          <Text variant="caption" color={colors.textMuted} style={styles.metricLabel}>
            Active
          </Text>
          <Text variant="body" weight="bold" color={colors.textPrimary}>
            {activeAutomations}
          </Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <MessageSquare size={14} color="#F59E0B" />
          <Text variant="caption" color={colors.textMuted} style={styles.metricLabel}>
            Unread
          </Text>
          <Text variant="body" weight="bold" color={colors.textPrimary}>
            {unreadMessages}
          </Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <Clock size={14} color="#6366F1" />
          <Text variant="caption" color={colors.textMuted} style={styles.metricLabel}>
            Avg Res
          </Text>
          <Text variant="body" weight="bold" color={colors.textPrimary}>
            {avgResponse}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 2,
  },
  periodPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    marginTop: 2,
    marginBottom: 1,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});
