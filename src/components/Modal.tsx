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

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  style?: ViewStyle;
}

export const Modal: React.FC<ModalProps> = ({
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
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: colors.modalBg,
                  borderColor: colors.border,
                  borderRadius: radius.xl,
                  padding: spacing.lg,
                },
                style,
              ]}
            >
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
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
