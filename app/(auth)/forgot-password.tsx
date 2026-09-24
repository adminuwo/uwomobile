import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Text } from '../../src/components/Text';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { useTheme } from '../../src/theme';
import { authApi } from '../../src/api/auth';
import { Mail, ShieldCheck, Lock, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [debugOtp, setDebugOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.sendForgotPasswordOtp(email.trim().toLowerCase());
      setSuccessMessage(res.message || 'OTP code sent to your registered email.');
      // Dev mode auto-fill removed
      setStep(2);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to send OTP code. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!otp || otp.trim().length < 6) {
      setErrorMessage('Please enter a valid 6-digit OTP code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.verifyForgotPasswordOtp(email.trim().toLowerCase(), otp.trim());
      setSuccessMessage(res.message || 'OTP verified successfully.');
      setStep(3);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Invalid or expired OTP code.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.resetForgotPassword(email.trim().toLowerCase(), newPassword);
      setSuccessMessage(res.message || 'Password reset successfully!');
      setStep(4);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to reset password.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen safeAreaEdges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Back Navigation */}
          <View style={styles.topNav}>
            <TouchableOpacity
              onPress={() => {
                if (step > 1 && step < 4) {
                  setStep((prev) => (prev - 1) as any);
                  setErrorMessage('');
                } else {
                  router.replace('/(auth)/login');
                }
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={[styles.backBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
            >
              <ArrowLeft size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Form Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}>
            
            {/* Step Indicators */}
            {step < 4 ? (
              <View style={styles.stepsIndicator}>
                {[1, 2, 3].map((s) => (
                  <View
                    key={s}
                    style={[
                      styles.stepDot,
                      {
                        backgroundColor: step >= s ? colors.primary : colors.border,
                        flex: 1,
                      },
                    ]}
                  />
                ))}
              </View>
            ) : null}

            {/* Error Banner */}
            {errorMessage ? (
              <View style={[styles.errorContainer, { backgroundColor: colors.errorBg, borderColor: colors.error }]}>
                <AlertCircle size={18} color={colors.error} style={styles.errorIcon} />
                <Text variant="caption" color={colors.error} style={styles.errorText}>
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* Success Banner */}
            {successMessage && step !== 4 ? (
              <View style={[styles.successContainer, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
                <CheckCircle2 size={18} color="#16a34a" style={styles.errorIcon} />
                <Text variant="caption" color="#15803d" style={styles.errorText}>
                  {successMessage}
                </Text>
              </View>
            ) : null}

            {/* ================= STEP 1: ENTER EMAIL ================= */}
            {step === 1 && (
              <View>
                <View style={styles.iconCircle}>
                  <Mail size={28} color={colors.primary} />
                </View>
                <Text variant="h2" weight="bold" style={styles.formTitle}>
                  Forgot Password?
                </Text>
                <Text variant="caption" color={colors.textMuted} style={styles.formSubtitle}>
                  Enter the email address registered with your account to receive a 6-digit OTP code.
                </Text>

                <Input
                  label="Registered Email"
                  placeholder="name@company.com"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (errorMessage) setErrorMessage('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon={<Mail size={18} color={colors.textMuted} />}
                />

                <Button
                  title="Send Verification Code"
                  onPress={handleSendOtp}
                  loading={isLoading}
                  disabled={isLoading}
                  variant="primary"
                  fullWidth
                  rightIcon={<ArrowRight size={18} color={colors.textInverse} />}
                  style={styles.actionBtn}
                />
              </View>
            )}

            {/* ================= STEP 2: ENTER OTP ================= */}
            {step === 2 && (
              <View>
                <View style={styles.iconCircle}>
                  <ShieldCheck size={28} color={colors.primary} />
                </View>
                <Text variant="h2" weight="bold" style={styles.formTitle}>
                  Enter Verification Code
                </Text>
                <Text variant="caption" color={colors.textMuted} style={styles.formSubtitle}>
                  We sent a 6-digit OTP code to <Text weight="bold" color={colors.textPrimary}>{email}</Text>
                </Text>



                <Input
                  label="6-Digit OTP"
                  placeholder="123456"
                  value={otp}
                  onChangeText={(t) => {
                    setOtp(t.replace(/[^0-9]/g, ''));
                    if (errorMessage) setErrorMessage('');
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  leftIcon={<ShieldCheck size={18} color={colors.textMuted} />}
                />

                <Button
                  title="Verify OTP Code"
                  onPress={handleVerifyOtp}
                  loading={isLoading}
                  disabled={isLoading}
                  variant="primary"
                  fullWidth
                  rightIcon={<ArrowRight size={18} color={colors.textInverse} />}
                  style={styles.actionBtn}
                />

                <View style={styles.resendRow}>
                  <TouchableOpacity
                    onPress={handleSendOtp}
                    disabled={isLoading}
                    activeOpacity={0.7}
                  >
                    <Text variant="caption" weight="semibold" color={colors.primary}>
                      Didn't receive code? Resend OTP
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ================= STEP 3: RESET PASSWORD ================= */}
            {step === 3 && (
              <View>
                <View style={styles.iconCircle}>
                  <Lock size={28} color={colors.primary} />
                </View>
                <Text variant="h2" weight="bold" style={styles.formTitle}>
                  Set New Password
                </Text>
                <Text variant="caption" color={colors.textMuted} style={styles.formSubtitle}>
                  Create a secure password with at least 6 characters.
                </Text>

                <Input
                  label="New Password"
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChangeText={(t) => {
                    setNewPassword(t);
                    if (errorMessage) setErrorMessage('');
                  }}
                  secureTextEntry
                  leftIcon={<Lock size={18} color={colors.textMuted} />}
                />

                <Input
                  label="Confirm New Password"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChangeText={(t) => {
                    setConfirmPassword(t);
                    if (errorMessage) setErrorMessage('');
                  }}
                  secureTextEntry
                  leftIcon={<Lock size={18} color={colors.textMuted} />}
                />

                <Button
                  title="Update Password"
                  onPress={handleResetPassword}
                  loading={isLoading}
                  disabled={isLoading}
                  variant="primary"
                  fullWidth
                  rightIcon={<ArrowRight size={18} color={colors.textInverse} />}
                  style={styles.actionBtn}
                />
              </View>
            )}

            {/* ================= STEP 4: SUCCESS ================= */}
            {step === 4 && (
              <View style={styles.successState}>
                <View style={[styles.iconCircle, { backgroundColor: '#f0fdf4' }]}>
                  <CheckCircle2 size={36} color="#16a34a" />
                </View>
                <Text variant="h2" weight="bold" align="center" style={styles.formTitle}>
                  Password Reset Complete!
                </Text>
                <Text variant="caption" color={colors.textMuted} align="center" style={styles.formSubtitle}>
                  Your password has been successfully updated. You can now sign in with your new credentials.
                </Text>

                <Button
                  title="Return to Sign In"
                  onPress={() => router.replace('/(auth)/login')}
                  variant="primary"
                  fullWidth
                  rightIcon={<ArrowRight size={18} color={colors.textInverse} />}
                  style={styles.actionBtn}
                />
              </View>
            )}

            {/* Back to Login link */}
            {step !== 4 && (
              <View style={styles.loginLinkContainer}>
                <Text variant="caption" color={colors.textSecondary}>
                  Remember your password?{' '}
                </Text>
                <TouchableOpacity
                  onPress={() => router.replace('/(auth)/login')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <Text variant="caption" weight="bold" color={colors.primary}>
                    Sign in
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  topNav: {
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  stepsIndicator: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  stepDot: {
    height: 4,
    borderRadius: 2,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  formTitle: {
    marginBottom: 6,
  },
  formSubtitle: {
    marginBottom: 20,
    lineHeight: 18,
  },
  devBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    flex: 1,
  },
  actionBtn: {
    marginTop: 10,
  },
  resendRow: {
    alignItems: 'center',
    marginTop: 14,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  successState: {
    alignItems: 'center',
    paddingVertical: 12,
  },
});
