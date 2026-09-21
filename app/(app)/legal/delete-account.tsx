import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../../src/components/Screen';
import { Header } from '../../../src/components/Header';
import { Text } from '../../../src/components/Text';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { useTheme } from '../../../src/theme';
import { useSessionStore } from '../../../src/stores/sessionStore';
import { legalApi } from '../../../src/api/legal';
import {
  AlertTriangle,
  Trash2,
  Lock,
  FileText,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react-native';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, logout } = useSessionStore();

  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const isConfirmed = confirmText.trim().toUpperCase() === 'DELETE';

  const handleDelete = async () => {
    if (!isConfirmed) {
      Alert.alert(
        'Confirmation Required',
        "Please type 'DELETE' in the confirmation field to verify your request."
      );
      return;
    }

    Alert.alert(
      'Final Warning: Delete Account',
      `Are you sure you want to permanently delete account "${user?.email}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Permanently Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await legalApi.deleteAccount({
                confirmation: 'DELETE',
                password: password.trim() || undefined,
              });

              Alert.alert(
                'Account Deactivated',
                'Your account has been scheduled for permanent deletion. You will now be signed out.',
                [
                  {
                    text: 'OK',
                    onPress: async () => {
                      await logout();
                      router.replace('/(auth)/login');
                    },
                  },
                ]
              );
            } catch (err: any) {
              Alert.alert(
                'Deletion Error',
                err?.message || 'Failed to process account deletion. Please verify your credentials and try again.'
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header title="Account Deletion" showBack={true} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Danger Warning Banner */}
          <Card
            style={[
              styles.warningBanner,
              { backgroundColor: colors.error + '12', borderColor: colors.error + '35' },
            ]}
          >
            <View style={styles.warningRow}>
              <AlertTriangle size={24} color={colors.error} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text variant="body" weight="bold" color={colors.error}>
                  Permanent Action
                </Text>
                <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                  Deleting your account will terminate your access, credentials, and individual user permissions across UWO Connect.
                </Text>
              </View>
            </View>
          </Card>

          {/* Account Details */}
          <Text variant="label" color={colors.textMuted} style={styles.sectionLabel}>
            Account to be deleted
          </Text>
          <Card style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.userRow}>
              <View style={[styles.avatarBox, { backgroundColor: colors.primary + '18' }]}>
                <Text variant="body" weight="bold" color={colors.primary}>
                  {(user?.name || user?.email || 'U')[0].toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text variant="body" weight="bold" color={colors.textPrimary}>
                  {user?.name || 'Account Owner'}
                </Text>
                <Text variant="caption" color={colors.textSecondary}>
                  {user?.email}
                </Text>
              </View>
            </View>
          </Card>

          {/* What happens to data */}
          <Text variant="label" color={colors.textMuted} style={styles.sectionLabel}>
            What happens when you delete:
          </Text>
          <Card style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.bulletRow}>
              <XCircle size={16} color={colors.error} style={{ marginTop: 2 }} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text variant="body" weight="bold" color={colors.textPrimary}>
                  Personal Credentials & Sessions
                </Text>
                <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                  All mobile JWT tokens, linked desktop sessions, and notification push tokens will be immediately revoked.
                </Text>
              </View>
            </View>

            <View style={styles.bulletRow}>
              <XCircle size={16} color={colors.error} style={{ marginTop: 2 }} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text variant="body" weight="bold" color={colors.textPrimary}>
                  Team & Agent Access
                </Text>
                <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                  You will lose access to team channels, attendance records, assigned leads, and workspace chats.
                </Text>
              </View>
            </View>

            <View style={styles.bulletRow}>
              <CheckCircle2 size={16} color="#059669" style={{ marginTop: 2 }} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text variant="body" weight="bold" color={colors.textPrimary}>
                  Shared Organization Records
                </Text>
                <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                  Organization-level CRM contacts, tax invoices, and business billing records belonging to the company are preserved in accordance with statutory accounting and tax compliance laws.
                </Text>
              </View>
            </View>
          </Card>

          {/* Verification Input */}
          <Text variant="label" color={colors.textMuted} style={styles.sectionLabel}>
            Verification
          </Text>
          <Card style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text variant="caption" color={colors.textSecondary}>
              To confirm that you want to delete this account, please type{' '}
              <Text variant="caption" weight="bold" color={colors.error}>
                DELETE
              </Text>{' '}
              in the box below:
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBg,
                  color: colors.textPrimary,
                  borderColor: isConfirmed ? colors.error : colors.border,
                },
              ]}
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder="Type DELETE"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
            />

            <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 4 }}>
              Account Password (optional if logged in via Google):
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBg,
                  color: colors.textPrimary,
                  borderColor: colors.border,
                },
              ]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
            />
          </Card>

          {/* Delete Action Button */}
          <Button
            title={deleting ? 'Deleting Account...' : 'Permanently Delete Account'}
            onPress={handleDelete}
            loading={deleting}
            disabled={!isConfirmed || deleting}
            variant="danger"
            icon={<Trash2 size={16} color="#FFFFFF" />}
            style={[styles.deleteBtn, !isConfirmed && { opacity: 0.5 }]}
          />

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.replace('/(app)/more')}
            disabled={deleting}
          >
            <Text variant="body" weight="bold" color={colors.textSecondary}>
              Cancel and Return to Safety
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  warningBanner: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 4,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionLabel: {
    marginBottom: 2,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  deleteBtn: {
    marginTop: 12,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
});
