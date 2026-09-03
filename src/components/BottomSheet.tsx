import React, { ReactNode } from 'react';
import {
  Modal as RNModal,
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { X } from 'lucide-react-native';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  style?: ViewStyle;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  children,
  style,
}) => {
  const { colors, radius, spacing } = useTheme();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.sheet,
                {
                  backgroundColor: colors.bottomSheetBg,
                  borderColor: colors.border,
                  borderTopLeftRadius: radius.xl,
                  borderTopRightRadius: radius.xl,
                  padding: spacing.lg,
                },
                style,
              ]}
            >
              <View style={styles.handleContainer}>
                <View style={[styles.handle, { backgroundColor: colors.borderMuted }]} />
              </View>

              <View style={styles.header}>
                {title ? (
                  <Text variant="h3" weight="bold">
                    {title}
                  </Text>
                ) : <View />}
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    borderTopWidth: 1,
    paddingBottom: 34,
  },
  handleContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
});
