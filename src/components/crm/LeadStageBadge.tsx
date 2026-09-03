import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../Text';
import { LeadStage } from '../../api/crm';

interface LeadStageBadgeProps {
  stage: LeadStage;
  size?: 'sm' | 'md';
}

export const LeadStageBadge: React.FC<LeadStageBadgeProps> = ({ stage, size = 'sm' }) => {
  const getStageConfig = (st: LeadStage) => {
    switch (st) {
      case 'NEW':
        return { label: 'New Lead', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.15)' };
      case 'FOLLOWUP':
        return { label: 'Follow Up', color: '#EAB308', bgColor: 'rgba(234, 179, 8, 0.15)' };
      case 'NEGOTIATION':
        return { label: 'Negotiation', color: '#F97316', bgColor: 'rgba(249, 115, 22, 0.15)' };
      case 'WON':
        return { label: 'Closed Won', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.15)' };
      case 'LOST':
        return { label: 'Closed Lost', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.15)' };
      default:
        return { label: st || 'New', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.15)' };
    }
  };

  const { label, color, bgColor } = getStageConfig(stage);

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }, size === 'md' && styles.badgeMd]}>
      <Text style={[styles.text, { color }, size === 'md' && styles.textMd]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeMd: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
  textMd: {
    fontSize: 13,
  },
});
