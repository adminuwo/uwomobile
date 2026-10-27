import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Linking,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Text } from '../../src/components/Text';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { PasswordStrengthIndicator } from '../../src/components/PasswordStrengthIndicator';
import { evaluatePassword } from '../../src/utils/passwordValidation';
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
  MapPin,
  RefreshCw,
} from 'lucide-react-native';

import * as WebBrowser from 'expo-web-browser';
import { APPLE_LEGAL_LINKS } from '../../src/config/iapConfig';

function maskEmail(val: string) {
  if (!val || !val.includes('@')) return val;
  const [local, domain] = val.split('@');
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
}

export default function RegisterScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const { register, verifyRegistrationOtp, resendRegistrationOtp, isLoading, error, clearError } = useSessionStore();
  const brand = useBrandStore((state) => state.brand);

  // Screen Step: 'form' | 'otp_verification'
  const [step, setStep] = useState<'form' | 'otp_verification'>('form');

  // Step 1: Meta Portfolio Eligibility Gate ('unanswered' | 'yes' | 'no')
  const [portfolioGate, setPortfolioGate] = useState<'unanswered' | 'yes' | 'no'>('unanswered');

  // Step 2: Form fields
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [portfolioName, setPortfolioName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [validationError, setValidationError] = useState('');

  // OTP Verification state
  const [otpEmail, setOtpEmail] = useState('');
  const [otpDebug, setOtpDebug] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const otpInputRefs = useRef<(TextInput | null)[]>([]);

  // OTP Resend Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp_verification' && otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, otpTimer]);

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

    const passwordEval = evaluatePassword(password);
    if (!passwordEval.isValid) {
      setValidationError('Password does not meet all security requirements. Please check the requirements below.');
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
    const locParts = location.split(',').map((p) => p.trim()).filter(Boolean);

    const result = await register({
      email: email.trim().toLowerCase(),
      password,
      first_name: firstName,
      last_name: lastName,
      business_name: businessName.trim(),
      meta_portfolio_name: portfolioName.trim(),
      portfolio_name: portfolioName.trim(),
      phone_number: phone.trim(),
      location: location.trim(),
      city: locParts[0] || '',
      country: locParts.length > 1 ? locParts[locParts.length - 1] : '',
      meta_portfolio_eligible: true,
      terms_accepted: true,
      privacy_accepted: true,
      terms_version: '1.0',
      privacy_version: '1.0',
    });

    if (result === true) {
      router.replace('/(app)/home');
    } else if (result && typeof result === 'object' && result.requiresOtp) {
      setOtpEmail(result.email || email.trim().toLowerCase());
      setOtpDebug(result.otp_debug || '');
      setStep('otp_verification');
      setOtpTimer(60);
      setOtpError('');
      setOtpSuccess('Verification code sent to your registered email address.');
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 300);
    }
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    const next = [...otpDigits];

    if (!clean) {
      next[index] = '';
      setOtpDigits(next);
      return;
    }

    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        next[i] = chars[i] || '';
      }
      setOtpDigits(next);
      const nextFocus = Math.min(chars.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    next[index] = clean;
    setOtpDigits(next);

    if (clean && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (index: number, e: any) => {
    if (e.nativeEvent?.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
        const next = [...otpDigits];
        next[index - 1] = '';
        setOtpDigits(next);
      }
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpDigits.join('');
    if (code.length < 6) {
      setOtpError('Please enter all 6 digits.');
      return;
    }

    setVerifyingOtp(true);
    setOtpError('');
    setOtpSuccess('');

    const success = await verifyRegistrationOtp(otpEmail, code);
    setVerifyingOtp(false);

    if (success) {
      router.replace('/(app)/home');
    } else {
      setOtpError('Invalid or expired verification code. Please check and try again.');
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0 || resendingOtp) return;

    setResendingOtp(true);
    setOtpError('');
    setOtpSuccess('');

    const res = await resendRegistrationOtp(otpEmail);
    setResendingOtp(false);

    if (res.success) {
      setOtpSuccess(res.message || 'Verification code resent.');
      if (res.otp_debug) {
        setOtpDebug(res.otp_debug);
      }
      setOtpTimer(60);
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } else {
      setOtpError(res.message || 'Failed to resend verification code.');
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
              {brand.brand_name || 'UWO Connect'}
            </Text>
            <Text variant="caption" color={colors.textSecondary} align="center" style={styles.brandSubtitle}>
              {brand.tagline || 'Unified Communication & Business Automation'}
            </Text>
          </View>

          {/* ═════════════════════════════════════════════════════════ */}
          {/* CASE OTP: Email Verification Step                         */}
          {/* ═════════════════════════════════════════════════════════ */}
          {step === 'otp_verification' && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl }]}>
              <View style={styles.otpHeaderIcon}>
                <View style={[styles.otpIconCircle, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
                  <Mail size={30} color={colors.primary} />
                </View>
              </View>

              <Text variant="h2" weight="bold" align="center" style={{ color: colors.textPrimary, marginBottom: 6 }}>
                Verify Your Email Address
              </Text>

              <Text variant="caption" color={colors.textSecondary} align="center" style={{ marginBottom: 4 }}>
                We sent a 6-digit verification code to
              </Text>

              <View style={[styles.maskedEmailBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text variant="caption" weight="bold" color={colors.textPrimary}>
                  {maskEmail(otpEmail)}
                </Text>
              </View>

              {/* Dev mode code helper */}
              {Boolean(otpDebug) && (
                <View style={[styles.devOtpBox, { backgroundColor: '#fef3c7', borderColor: '#fde68a' }]}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#92400e' }}>
                    DEV OTP: <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', letterSpacing: 2 }}>{otpDebug}</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      const chars = otpDebug.slice(0, 6).split('');
                      setOtpDigits(chars);
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#b45309', textDecorationLine: 'underline' }}>
                      Auto-fill
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Error Alert */}
              {Boolean(otpError) && (
                <View style={[styles.errorContainer, { backgroundColor: colors.error + '10', borderColor: colors.error + '30' }]}>
                  <AlertCircle size={16} color={colors.error} style={styles.errorIcon} />
                  <Text variant="caption" color={colors.error} style={styles.errorText}>
                    {otpError}
                  </Text>
                </View>
              )}

              {/* Success Alert */}
              {Boolean(otpSuccess) && (
                <View style={[styles.errorContainer, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
                  <CheckCircle2 size={16} color="#059669" style={styles.errorIcon} />
                  <Text variant="caption" style={{ color: '#047857', flex: 1 }}>
                    {otpSuccess}
                  </Text>
                </View>
              )}

              {/* 6 Digit Inputs */}
              <View style={styles.otpInputsRow}>
                {otpDigits.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={(ref) => {
                      otpInputRefs.current[idx] = ref;
                    }}
                    style={[
                      styles.otpDigitBox,
                      {
                        backgroundColor: colors.surface,
                        borderColor: digit ? colors.primary : colors.border,
                        color: colors.textPrimary,
                      },
                    ]}
                    maxLength={1}
                    keyboardType="number-pad"
                    value={digit}
                    onChangeText={(val) => handleOtpDigitChange(idx, val)}
                    onKeyPress={(e) => handleOtpKeyPress(idx, e)}
                    selectTextOnFocus
                  />
                ))}
              </View>

              {/* Verify Button */}
              <Button
                title="Verify & Continue"
                onPress={handleVerifyOtp}
                loading={verifyingOtp}
                disabled={otpDigits.join('').length < 6 || verifyingOtp}
                style={styles.submitBtn}
              />

              {/* Resend Section */}
              <View style={styles.resendSection}>
                <Text variant="caption" color={colors.textSecondary} align="center">
                  Didn't receive the email? Check spam or
                </Text>
                {otpTimer > 0 ? (
                  <Text variant="caption" color={colors.textSecondary} align="center" style={{ marginTop: 4 }}>
                    Resend code in <Text weight="bold" color={colors.textPrimary}>{otpTimer}s</Text>
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={handleResendOtp}
                    disabled={resendingOtp}
                    style={styles.resendButton}
                  >
                    {resendingOtp ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <RefreshCw size={13} color={colors.primary} />
                        <Text variant="caption" weight="bold" color={colors.primary}>
                          Resend Verification Code
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {/* Back to Edit Button */}
              <TouchableOpacity
                onPress={() => {
                  setStep('form');
                  setOtpError('');
                }}
                style={styles.backToEditBtn}
              >
                <ArrowLeft size={14} color={colors.textSecondary} />
                <Text variant="caption" color={colors.textSecondary} weight="bold" style={{ marginLeft: 6 }}>
                  Edit Details / Change Email
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ═════════════════════════════════════════════════════════ */}
          {/* CASE A: BLOCKED STATE (User selected "No")                 */}
          {/* ═════════════════════════════════════════════════════════ */}
          {step === 'form' && portfolioGate === 'no' && (
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
          {step === 'form' && portfolioGate === 'unanswered' && (
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
          {step === 'form' && portfolioGate === 'yes' && (
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

              {/* Location / City */}
              <Input
                label="Location / City"
                placeholder="e.g. Mumbai, India"
                value={location}
                onChangeText={(t) => {
                  setLocation(t);
                  if (validationError) setValidationError('');
                }}
                autoCapitalize="words"
                leftIcon={<MapPin size={18} color={colors.textMuted} />}
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

              {/* Real-time Password Strength Bar & Checklist */}
              <PasswordStrengthIndicator
                password={password}
                confirmPassword={confirmPassword}
                showChecklist={true}
              />

              {/* Mandatory Terms & Privacy Consent Checkbox */}
              <TouchableOpacity
                style={styles.consentRow}
                onPress={() => {
                  setAcceptedLegal(!acceptedLegal);
                  if (validationError) setValidationError('');
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    {
                      borderColor: acceptedLegal ? colors.primary : colors.border,
                      backgroundColor: acceptedLegal ? colors.primary : colors.surface,
                    },
                  ]}
                >
                  {acceptedLegal && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                </View>

                <Text style={[styles.consentText, { color: colors.textSecondary }]}>
                  I have read and agree to the{' '}
                  <Text
                    style={[styles.consentLink, { color: colors.primary }]}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      router.push('/(auth)/terms');
                    }}
                  >
                    App Terms
                  </Text>
                  ,{' '}
                  <Text
                    style={[styles.consentLink, { color: colors.primary }]}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      WebBrowser.openBrowserAsync(APPLE_LEGAL_LINKS.APPLE_STANDARD_EULA_URL);
                    }}
                  >
                    Apple EULA (Terms of Use)
                  </Text>
                  {' '}and{' '}
                  <Text
                    style={[styles.consentLink, { color: colors.primary }]}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      router.push('/(auth)/privacy');
                    }}
                  >
                    Privacy Policy
                  </Text>
                  .
                </Text>
              </TouchableOpacity>

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
              Secured by UWO Connect • v1.0.0
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
    alignItems: 'center',
    marginVertical: 14,
  },
  checkboxBox: {
    width: 17,
    height: 17,
    borderRadius: 4,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },
  consentText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  consentLink: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
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
  otpHeaderIcon: {
    alignItems: 'center',
    marginBottom: 12,
  },
  otpIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  maskedEmailBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'center',
    marginVertical: 8,
  },
  devOtpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 10,
  },
  otpInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  otpDigitBox: {
    width: 44,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  resendSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  resendButton: {
    marginTop: 6,
    paddingVertical: 4,
  },
  backToEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 6,
  },
});
