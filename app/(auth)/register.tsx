import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Text } from '../../src/components/Text';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { resolveValidImageUri } from '../../src/utils/imageUri';
import { useSessionStore } from '../../src/stores/sessionStore';
import { useBrandStore } from '../../src/stores/brandStore';
import { useTheme } from '../../src/theme';
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  Building,
  User,
  Phone,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const { register, isLoading, error, clearError } = useSessionStore();
  const brand = useBrandStore((state) => state.brand);

  // Step 1: Meta Portfolio Eligibility Gate ('unanswered' | 'yes' | 'no')
  const [portfolioGate, setPortfolioGate] = useState<'unanswered' | 'yes' | 'no'>('unanswered');

  // Step 2: Form fields
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [portfolioName, setPortfolioName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleCreateAccount = async () => {
    clearError();
    setValidationError('');

    if (portfolioGate !== 'yes') {
      setValidationError('You must confirm you have a Meta Portfolio to register.');
      return;
    }

    if (!fullName.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }

    if (!businessName.trim()) {
      setValidationError('Please enter your business or company name.');
      return;
    }

    if (!portfolioName.trim()) {
      setValidationError('Please enter your Meta Portfolio name.');
      return;
    }

    if (!email || !email.includes('@')) {
      setValidationError('Please enter a valid business email address.');
      return;
    }

    if (!password || password.length < 8) {
      setValidationError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match. Please verify.');
      return;
    }

    if (!acceptedLegal) {
      setValidationError('Please agree to the Terms & Conditions and Privacy Policy to continue.');
      return;
    }

    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const success = await register({
      email: email.trim().toLowerCase(),
      password,
      first_name: firstName,
      last_name: lastName,
      business_name: businessName.trim(),
      meta_portfolio_name: portfolioName.trim(),
      portfolio_name: portfolioName.trim(),
      phone_number: phone.trim(),
      meta_portfolio_eligible: true,
      terms_accepted: true,
      privacy_accepted: true,
      terms_version: '1.0',
      privacy_version: '1.0',
    });

    if (success) {
      router.replace('/(app)/home');
    }
  };

  const displayError = validationError || error;

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
          {/* Header Brand Section */}
          <View style={styles.brandHeader}>
            <View style={[styles.logoBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {resolveValidImageUri(brand.logo_url) ? (
                <Image
                  source={{ uri: resolveValidImageUri(brand.logo_url)! }}
                  style={styles.logoImage}
                />
              ) : (
                <Image
                  source={require('../../assets/icon.png')}
                  style={styles.logoImage}
                />
              )}
            </View>
            <Text variant="h1" weight="bold" align="center" style={styles.brandTitle}>
              {brand.brand_name || 'UwoConnect'}
            </Text>
            <Text variant="caption" color={colors.textSecondary} align="center" style={styles.brandSubtitle}>
              {brand.tagline || 'Unified Communication & Business Automation'}
            </Text>
          </View>

          {/* ═════════════════════════════════════════════════════════ */}
          {/* CASE A: BLOCKED STATE (User selected "No")                 */}
          {/* ═════════════════════════════════════════════════════════ */}
          {portfolioGate === 'no' && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}>
              <View style={styles.blockedIconContainer}>
                <View style={[styles.blockedIconCircle, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
                  <XCircle size={38} color="#dc2626" />
                </View>
              </View>

              <Text variant="h2" weight="bold" align="center" style={{ color: '#991b1b', marginBottom: 8 }}>
                Registration Unavailable
              </Text>

              <View style={[styles.alertBox, { backgroundColor: '#fff1f2', borderColor: '#ffe4e6' }]}>
                <Text variant="body" weight="bold" align="center" style={{ color: '#be123c', lineHeight: 20 }}>
                  Meta Portfolio is required to register for Uwo Connect.
                </Text>
              </View>

              <Text variant="caption" color={colors.textSecondary} align="center" style={styles.blockedBodyText}>
                Uwo Connect integrates directly with Meta Business Manager and WhatsApp Cloud API. Without an existing Meta Portfolio, automated business messaging and CRM channels cannot be provisioned.
              </Text>

              <View style={[styles.infoCallout, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text variant="caption" weight="bold" color={colors.textPrimary} style={{ marginBottom: 4 }}>
                  How to get a Meta Portfolio:
                </Text>
                <Text variant="caption" color={colors.textSecondary} style={{ lineHeight: 18 }}>
                  1. Visit business.facebook.com{'\n'}
                  2. Create or verify your Business Portfolio{'\n'}
                  3. Return here to complete your account setup
                </Text>
                <TouchableOpacity
                  onPress={() => Linking.openURL('https://business.facebook.com')}
                  style={styles.metaLinkBtn}
                  activeOpacity={0.7}
                >
                  <Text variant="caption" weight="bold" color={colors.primary}>
                    Open Meta Business Suite
                  </Text>
                  <ExternalLink size={13} color={colors.primary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>

              <Button
                title="I Now Have a Meta Portfolio"
                onPress={() => setPortfolioGate('yes')}
                variant="primary"
                fullWidth
                leftIcon={<CheckCircle2 size={16} color={colors.textInverse} />}
                style={{ marginTop: 12, marginBottom: 10 }}
              />

              <Button
                title="Return to Sign In"
                onPress={() => router.replace('/(auth)/login')}
                variant="outline"
                fullWidth
                leftIcon={<ArrowLeft size={16} color={colors.textPrimary} />}
              />
            </View>
          )}

          {/* ═════════════════════════════════════════════════════════ */}
          {/* CASE B: GATE QUESTION ('unanswered')                       */}
          {/* ═════════════════════════════════════════════════════════ */}
          {portfolioGate === 'unanswered' && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}>
              <View style={styles.gateBadge}>
                <Briefcase size={14} color={colors.primary} />
                <Text variant="caption" weight="bold" color={colors.primary} style={{ marginLeft: 6 }}>
                  STEP 1 OF 2: ELIGIBILITY CHECK
                </Text>
              </View>

              <Text variant="h2" weight="bold" style={styles.formTitle}>
                Do you have a Meta Portfolio?
              </Text>
              <Text variant="caption" color={colors.textMuted} style={styles.formSubtitle}>
                A Meta Portfolio (Meta Business Manager) is required to deploy WhatsApp Cloud API and Meta business integrations.
              </Text>

              {/* Option: YES */}
              <TouchableOpacity
                onPress={() => setPortfolioGate('yes')}
                style={[styles.gateOptionCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}
                activeOpacity={0.8}
              >
                <View style={[styles.gateOptionIconCircle, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
                  <CheckCircle2 size={22} color="#059669" />
                </View>
                <View style={styles.gateOptionContent}>
                  <Text variant="body" weight="bold" style={{ color: colors.textPrimary, marginBottom: 2 }}>
                    Yes, I have a Meta Portfolio
                  </Text>
                  <Text variant="caption" color={colors.textSecondary} style={{ lineHeight: 16 }}>
                    I have an active Business Manager / Portfolio with WhatsApp accounts.
                  </Text>
                </View>
                <ArrowRight size={18} color={colors.primary} />
              </TouchableOpacity>

              {/* Option: NO */}
              <TouchableOpacity
                onPress={() => setPortfolioGate('no')}
                style={[styles.gateOptionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                activeOpacity={0.8}
              >
                <View style={[styles.gateOptionIconCircle, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
                  <XCircle size={22} color="#dc2626" />
                </View>
                <View style={styles.gateOptionContent}>
                  <Text variant="body" weight="bold" style={{ color: colors.textPrimary, marginBottom: 2 }}>
                    No, I don't have one
                  </Text>
                  <Text variant="caption" color={colors.textSecondary} style={{ lineHeight: 16 }}>
                    I do not currently have a Meta Business Portfolio.
                  </Text>
                </View>
                <ArrowRight size={18} color={colors.textMuted} />
              </TouchableOpacity>

              {/* Back to Sign in */}
              <View style={styles.signInLinkContainer}>
                <Text variant="caption" color={colors.textSecondary}>
                  Already registered?{' '}
                </Text>
                <TouchableOpacity
                  onPress={() => router.replace('/(auth)/login')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text variant="caption" weight="bold" color={colors.primary}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ═════════════════════════════════════════════════════════ */}
          {/* CASE C: REGISTRATION FORM (User answered "Yes")           */}
          {/* ═════════════════════════════════════════════════════════ */}
          {portfolioGate === 'yes' && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}>
              {/* Confirmed Gate Pill */}
              <View style={[styles.confirmedPill, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Check size={14} color="#059669" />
                  <Text variant="caption" weight="bold" style={{ color: '#065f46', marginLeft: 6 }}>
                    Meta Portfolio: {portfolioName ? portfolioName : 'Confirmed'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setPortfolioGate('unanswered')}>
                  <Text variant="caption" color="#059669" style={{ textDecorationLine: 'underline' }}>
                    Change
                  </Text>
                </TouchableOpacity>
              </View>

              <Text variant="h2" weight="bold" style={styles.formTitle}>
                Create Your Account
              </Text>
              <Text variant="caption" color={colors.textMuted} style={styles.formSubtitle}>
                Instant setup. Start messaging with AI-powered automations.
              </Text>

              {/* Error Banner */}
              {displayError ? (
                <View style={[styles.errorContainer, { backgroundColor: colors.surface, borderColor: colors.error }]}>
                  <AlertCircle size={18} color={colors.error} style={styles.errorIcon} />
                  <Text variant="caption" color={colors.error} style={styles.errorText}>
                    {displayError}
                  </Text>
                </View>
              ) : null}

              {/* Full Name */}
              <Input
                label="Full Name"
                placeholder="e.g. John Doe"
                value={fullName}
                onChangeText={(t) => {
                  setFullName(t);
                  if (validationError) setValidationError('');
                }}
                autoCapitalize="words"
                leftIcon={<User size={18} color={colors.textMuted} />}
              />

              {/* Business Name */}
              <Input
                label="Business / Company Name"
                placeholder="e.g. Acme Innovations Inc."
                value={businessName}
                onChangeText={(t) => {
                  setBusinessName(t);
                  if (validationError) setValidationError('');
                }}
                autoCapitalize="words"
                leftIcon={<Building size={18} color={colors.textMuted} />}
              />

              {/* Meta Portfolio Name */}
              <Input
                label="Meta Portfolio Name"
                placeholder="e.g. Acme Meta Business Portfolio"
                value={portfolioName}
                onChangeText={(t) => {
                  setPortfolioName(t);
                  if (validationError) setValidationError('');
                }}
                autoCapitalize="words"
                leftIcon={<Briefcase size={18} color={colors.textMuted} />}
              />

              {/* Email Address */}
              <Input
                label="Business Email"
                placeholder="john@example.com"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (validationError) setValidationError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Mail size={18} color={colors.textMuted} />}
              />

              {/* Phone Number */}
              <Input
                label="Phone / Mobile Number"
                placeholder="+1 555-0199"
                value={phone}
                onChangeText={(t) => {
                  setPhone(t);
                  if (validationError) setValidationError('');
                }}
                keyboardType="phone-pad"
                leftIcon={<Phone size={18} color={colors.textMuted} />}
              />

              {/* Password */}
              <Input
                label="Password (min. 8 characters)"
                placeholder="••••••••••••"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (validationError) setValidationError('');
                }}
                secureTextEntry
                leftIcon={<Lock size={18} color={colors.textMuted} />}
              />

              {/* Confirm Password */}
              <Input
                label="Confirm Password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  if (validationError) setValidationError('');
                }}
                secureTextEntry
                leftIcon={<Lock size={18} color={colors.textMuted} />}
              />

              {/* Mandatory Terms & Privacy Consent Checkbox */}
              <View style={styles.consentRow}>
                <TouchableOpacity
                  style={[
                    styles.checkboxBox,
                    {
                      borderColor: acceptedLegal ? colors.primary : colors.border,
                      backgroundColor: acceptedLegal ? colors.primary : colors.surface,
                    },
                  ]}
                  onPress={() => {
                    setAcceptedLegal(!acceptedLegal);
                    if (validationError) setValidationError('');
                  }}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {acceptedLegal && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                </TouchableOpacity>

                <View style={styles.consentTextContainer}>
                  <Text variant="caption" color={colors.textSecondary} style={{ lineHeight: 18 }}>
                    I have read and agree to the{' '}
                    <Text
                      variant="caption"
                      weight="bold"
                      color={colors.primary}
                      onPress={() => router.push('/(auth)/terms')}
                    >
                      Terms & Conditions
                    </Text>
                    {' '}and{' '}
                    <Text
                      variant="caption"
                      weight="bold"
                      color={colors.primary}
                      onPress={() => router.push('/(auth)/privacy')}
                    >
                      Privacy Policy
                    </Text>
                    .
                  </Text>
                </View>
              </View>

              {/* Submit Button */}
              <Button
                title="Create Account"
                onPress={handleCreateAccount}
                loading={isLoading}
                disabled={isLoading}
                variant="primary"
                fullWidth
                rightIcon={<ArrowRight size={18} color={colors.textInverse} />}
                style={styles.submitBtn}
              />

              {/* Sign In Link */}
              <View style={styles.signInLinkContainer}>
                <Text variant="caption" color={colors.textSecondary}>
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity
                  onPress={() => router.replace('/(auth)/login')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text variant="caption" weight="bold" color={colors.primary}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Footer note */}
          <View style={styles.footer}>
            <Text variant="caption" color={colors.textMuted} align="center">
              Secured by UwoConnect • v1.0.0
            </Text>
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
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoImage: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
  },
  brandTitle: {
    marginBottom: 4,
  },
  brandSubtitle: {
    maxWidth: 280,
  },
  card: {
    padding: 20,
    borderWidth: 1,
  },
  formTitle: {
    marginBottom: 4,
  },
  formSubtitle: {
    marginBottom: 18,
    lineHeight: 18,
  },
  gateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  gateOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  gateOptionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  gateOptionContent: {
    flex: 1,
    marginRight: 8,
  },
  confirmedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  blockedIconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  blockedIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  blockedBodyText: {
    lineHeight: 18,
    marginBottom: 16,
  },
  infoCallout: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  metaLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    flex: 1,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 12,
    gap: 10,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  consentTextContainer: {
    flex: 1,
  },
  submitBtn: {
    marginTop: 8,
  },
  signInLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  footer: {
    marginTop: 28,
  },
});
