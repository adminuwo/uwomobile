import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Text as RNText } from 'react-native';
import { useTheme } from '../../theme';

import { getChannelColor } from './ChannelBadge';
import { useChannelAccess } from '../../hooks/useChannelAccess';

export type ChannelFilter = 'ALL' | 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK';

interface ChannelFilterBarProps {
  selectedChannel: ChannelFilter;
  onSelectChannel: (channel: ChannelFilter) => void;
}

const CHANNELS: { id: ChannelFilter; label: string }[] = [
  { id: 'ALL', label: 'All Messages' },
  { id: 'WHATSAPP', label: 'WhatsApp' },
  { id: 'INSTAGRAM', label: 'Instagram' },
  { id: 'FACEBOOK', label: 'Facebook' },
];

export const ChannelFilterBar: React.FC<ChannelFilterBarProps> = ({ selectedChannel, onSelectChannel }) => {
  const { colors } = useTheme();
  const { isChannelActive } = useChannelAccess();

  const visibleChannels = React.useMemo(() => {
    return CHANNELS.filter((ch) => {
      if (ch.id === 'ALL') return true;
      if (ch.id === 'FACEBOOK') return isChannelActive('facebook');
      if (ch.id === 'INSTAGRAM') return isChannelActive('instagram');
      if (ch.id === 'WHATSAPP') return isChannelActive('whatsapp');
      return true;
    });
  }, [isChannelActive]);

  React.useEffect(() => {
    if (selectedChannel === 'FACEBOOK' && !isChannelActive('facebook')) {
      onSelectChannel('ALL');
    } else if (selectedChannel === 'INSTAGRAM' && !isChannelActive('instagram')) {
      onSelectChannel('ALL');
    }
  }, [selectedChannel, isChannelActive, onSelectChannel]);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.container}
      >
        {visibleChannels.map((ch) => {
          const isSelected = selectedChannel === ch.id;
          const chipColor = ch.id === 'ALL' ? colors.primary : getChannelColor(ch.id);
          return (
            <TouchableOpacity
              key={ch.id}
              activeOpacity={0.75}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? chipColor : colors.card,
                  borderColor: isSelected ? chipColor : colors.border,
                },
              ]}
              onPress={() => onSelectChannel(ch.id)}
            >
              <RNText
                style={[
                  styles.chipText,
                  { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                  isSelected && styles.selectedChipText,
                ]}
              >
                {ch.label}
              </RNText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    height: 52,
    justifyContent: 'center',
    marginBottom: 4,
  },
  scrollView: {
    flexGrow: 0,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    height: 38,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    includeFontPadding: false,
    textAlign: 'center',
  },
  selectedChipText: {
    fontWeight: '700',
  },
});
