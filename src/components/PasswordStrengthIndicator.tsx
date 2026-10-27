import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { Check, X, ShieldCheck } from 'lucide-react-native';
import { evaluatePassword } from '../utils/passwordValidation';

interface PasswordStrengthIndicatorProps {
  password?: string;
  confirmPassword?: string;
  showChecklist?: boolean;
  containerStyle?: ViewStyle;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password = '',
  confirmPassword,
  showChecklist = true,
  containerStyle,
}) => {
  const { colors, radius, spacing } = useTheme();

  const evaluation = useMemo(() => evaluatePassword(password), [password]);

  const confirmMatch = useMemo(() => {
    if (confirmPassword === undefined || confirmPassword === '') return null;
    return password.length > 0 && password === confirmPassword;
  }, [password, confirmPassword]);

  // If user hasn't typed anything in password or confirm, don't clutter the UI
  if (!password && !confirmPassword) {
    return null;
  }

  const { criteria, strength } = evaluation;

  // Segment colors based on current score
  const getSegmentColor = (segmentIndex: number) => {
    if (strength.score >= segmentIndex + 1) {
      return strength.color;
    }
    return colors.borderMuted || '#e2e8f0';
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Strength Bar & Header */}
      {password.length > 0 && (
        <View style={styles.strengthSection}>
          <View style={styles.headerRow}>
            <View style={styles.titleWithIcon}>
              <ShieldCheck size={14} color={strength.color} />
              <Text variant="caption" weight="semibold" style={{ color: colors.textSecondary, marginLeft: 4 }}>
                Password Strength:
              </Text>
            </View>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: `${strength.color}18`,
                  borderColor: `${strength.color}40`,
                },
              ]}
            >
              <Text
                variant="caption"
                weight="bold"
                style={{ color: strength.color, fontSize: 11 }}
              >
                {strength.label}
              </Text>
            </View>
          </View>

          {/* 4-segment progress bar */}
          <View style={styles.barContainer}>
            {[0, 1, 2, 3].map((index) => (
              <View
                key={index}
                style={[
                  styles.barSegment,
                  {
                    backgroundColor: getSegmentColor(index),
                    borderRadius: radius.full,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      )}

      {/* 5-Rule Real-Time Checklist */}
      {showChecklist && password.length > 0 && (
        <View
          style={[
            styles.checklistCard,
            {
              backgroundColor: colors.cardHover || '#f8fafc',
              borderColor: colors.borderMuted || '#e2e8f0',
              borderRadius: radius.md,
            },
          ]}
        >
          <Text variant="caption" weight="bold" style={{ color: colors.textSecondary, marginBottom: 8, fontSize: 11 }}>
            Mandatory Security Requirements:
          </Text>

          <View style={styles.criteriaGrid}>
            {criteria.map((item) => (
              <View key={item.id} style={styles.criterionRow}>
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: item.met ? '#10b98120' : '#94a3b818',
                      borderColor: item.met ? '#10b98150' : '#94a3b830',
                    },
                  ]}
                >
                  {item.met ? (
                    <Check size={11} color="#10b981" strokeWidth={3} />
                  ) : (
                    <X size={11} color="#94a3b8" strokeWidth={2.5} />
                  )}
                </View>
                <Text
                  variant="caption"
                  weight={item.met ? 'semibold' : 'regular'}
                  style={[
                    styles.criterionText,
                    {
                      color: item.met ? '#0f766e' : colors.textMuted,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Confirm Password Match Indicator */}
      {confirmMatch !== null && (
        <View
          style={[
            styles.matchCard,
            {
              backgroundColor: confirmMatch ? '#10b98115' : '#ef444415',
              borderColor: confirmMatch ? '#10b98140' : '#ef444440',
              borderRadius: radius.sm,
            },
          ]}
        >
          {confirmMatch ? (
            <Check size={14} color="#10b981" strokeWidth={3} />
          ) : (
            <X size={14} color="#ef4444" strokeWidth={3} />
          )}
          <Text
            variant="caption"
            weight="bold"
            style={{
              color: confirmMatch ? '#047857' : '#b91c1c',
              marginLeft: 6,
              fontSize: 11,
            }}
          >
            {confirmMatch ? 'Passwords match' : 'Passwords do not match'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: '100%',
  },
  strengthSection: {
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  barContainer: {
    flexDirection: 'row',
    gap: 6,
    height: 4,
    width: '100%',
  },
  barSegment: {
    flex: 1,
    height: 4,
  },
  checklistCard: {
    borderWidth: 1,
    padding: 10,
    marginTop: 4,
    marginBottom: 6,
  },
  criteriaGrid: {
    gap: 5,
  },
  criterionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  criterionText: {
    fontSize: 11,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 4,
  },
});
