import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../Text';
import { MessageSquare, Instagram, Facebook, Youtube } from 'lucide-react-native';

interface ChannelBadgeProps {
  channel: string;
  size?: 'sm' | 'md';
}

export const ChannelBadge: React.FC<ChannelBadgeProps> = ({ channel, size = 'sm' }) => {
  const normalized = (channel || 'WHATSAPP').toUpperCase();

  const getConfig = () => {
    switch (normalized) {
      case 'WHATSAPP':
        return { label: 'WhatsApp', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.15)', Icon: MessageSquare };
      case 'INSTAGRAM':
        return { label: 'Instagram', color: '#E1306C', bgColor: 'rgba(225, 48, 108, 0.15)', Icon: Instagram };
      case 'FACEBOOK':
        return { label: 'Facebook', color: '#1877F2', bgColor: 'rgba(24, 119, 242, 0.15)', Icon: Facebook };
      case 'YOUTUBE':
        return { label: 'YouTube', color: '#FF0000', bgColor: 'rgba(255, 0, 0, 0.15)', Icon: Youtube };
      default:
        return { label: normalized, color: '#A0AEC0', bgColor: 'rgba(160, 174, 192, 0.15)', Icon: MessageSquare };
    }
  };

  const { label, color, bgColor, Icon } = getConfig();
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }, size === 'md' && styles.badgeMd]}>
      <Icon size={iconSize} color={color} />
      <Text style={[styles.text, { color }, size === 'md' && styles.textMd]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  badgeMd: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  text: {
    fontSize: 10,
    fontWeight: '600',
  },
  textMd: {
    fontSize: 12,
  },
});
