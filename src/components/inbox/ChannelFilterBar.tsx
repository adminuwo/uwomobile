import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '../Text';
import { colors } from '../../theme/colors';

export type ChannelFilter = 'ALL' | 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'YOUTUBE';

interface ChannelFilterBarProps {
  selectedChannel: ChannelFilter;
  onSelectChannel: (channel: ChannelFilter) => void;
}

const CHANNELS: { id: ChannelFilter; label: string }[] = [
  { id: 'ALL', label: 'All Messages' },
  { id: 'WHATSAPP', label: 'WhatsApp' },
  { id: 'INSTAGRAM', label: 'Instagram' },
  { id: 'FACEBOOK', label: 'Facebook' },
  { id: 'YOUTUBE', label: 'YouTube' },
];

export const ChannelFilterBar: React.FC<ChannelFilterBarProps> = ({ selectedChannel, onSelectChannel }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CHANNELS.map((ch) => {
        const isSelected = selectedChannel === ch.id;
        return (
          <TouchableOpacity
            key={ch.id}
            activeOpacity={0.7}
            style={[styles.chip, isSelected && styles.selectedChip]}
            onPress={() => onSelectChannel(ch.id)}
          >
            <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>
              {ch.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  selectedChip: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  selectedChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
