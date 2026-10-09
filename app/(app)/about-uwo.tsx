import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Path,
  Circle,
  Rect,
  Defs,
  LinearGradient,
  Stop,
  Line as SvgLine,
} from 'react-native-svg';
import {
  Cpu,
  Zap,
  Share2,
  Workflow,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Globe,
  MessageSquare,
  Users,
  ChevronRight,
  Radio,
  FileCheck,
  Receipt,
  FileText,
  CreditCard,
  Building,
  PhoneCall,
  Bot,
  ExternalLink,
  Laptop,
} from 'lucide-react-native';

import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { useTheme } from '../../src/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ═════════════════════════════════════════════════════════════════
// ── BRAND VECTOR LOGOS (Same authentic SVGs as connectors.tsx) ──
// ═════════════════════════════════════════════════════════════════

const WhatsAppLogo = ({ size = 28 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Circle cx="24" cy="24" r="24" fill="#25D366" />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M35.2 12.8C32.3 9.9 28.3 8.3 24.1 8.3C15.4 8.3 8.4 15.3 8.4 24C8.4 26.8 9.1 29.5 10.5 31.9L8.4 39.6L16.3 37.5C18.6 38.8 21.3 39.5 24.1 39.5C32.8 39.5 39.8 32.5 39.8 23.8C39.8 19.6 38.1 15.6 35.2 12.8ZM24.1 36.8C21.7 36.8 19.4 36.1 17.4 35L16.9 34.7L12.2 35.9L13.5 31.3L13.2 30.8C12 28.7 11.3 26.4 11.3 24C11.3 17 17 11.3 24.1 11.3C27.5 11.3 30.7 12.6 33.1 15C35.5 17.4 36.8 20.6 36.8 24C36.8 31 31.1 36.8 24.1 36.8ZM31 27.2C30.6 27 28.7 26.1 28.4 26C28 25.8 27.8 25.7 27.5 26.1C27.2 26.5 26.5 27.4 26.3 27.6C26.1 27.9 25.8 27.9 25.4 27.7C25 27.5 23.7 27.1 22.2 25.7C21 24.7 20.2 23.4 20 23C19.8 22.6 20 22.4 20.2 22.2C20.4 22 20.6 21.7 20.8 21.5C21 21.3 21.1 21.1 21.2 20.9C21.3 20.7 21.3 20.5 21.2 20.3C21.1 20.1 20.3 18.2 20 17.4C19.7 16.6 19.4 16.7 19.1 16.7H18.4C18.1 16.7 17.7 16.8 17.3 17.2C16.9 17.6 16 18.5 16 20.3C16 22.1 17.3 23.9 17.5 24.1C17.7 24.3 20.1 28 23.7 29.6C24.6 30 25.2 30.2 25.8 30.4C26.7 30.7 27.5 30.6 28.2 30.5C28.9 30.4 30.5 29.5 30.8 28.6C31.1 27.8 31.1 27.1 31 27.2Z"
      fill="#FFFFFF"
    />
  </Svg>
);

const InstagramLogo = ({ size = 28 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Defs>
      <LinearGradient id="igBrandGradAbout" x1="0%" y1="100%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#FFD600" />
        <Stop offset="25%" stopColor="#FF7A00" />
        <Stop offset="50%" stopColor="#FF0069" />
        <Stop offset="75%" stopColor="#D300C5" />
        <Stop offset="100%" stopColor="#7638FA" />
      </LinearGradient>
    </Defs>
    <Rect width="48" height="48" rx="12" fill="url(#igBrandGradAbout)" />
    <Rect x="11" y="11" width="26" height="26" rx="7" stroke="#FFFFFF" strokeWidth="3" fill="none" />
    <Circle cx="24" cy="24" r="6" stroke="#FFFFFF" strokeWidth="3" fill="none" />
    <Circle cx="31.5" cy="16.5" r="1.75" fill="#FFFFFF" />
  </Svg>
);

const FacebookLogo = ({ size = 28 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Circle cx="24" cy="24" r="24" fill="#1877F2" />
    <Path
      d="M29.5 25.1L30.3 19.9H25.3V16.5C25.3 15.1 26 13.7 28.2 13.7H30.5V9.3C30.5 9.3 28.4 9 26.4 9C22.3 9 19.6 11.5 19.6 16V19.9H15V25.1H19.6V37.7C20.5 37.9 21.5 38 22.5 38C23.5 38 24.4 37.9 25.3 37.7V25.1H29.5Z"
      fill="#FFFFFF"
    />
  </Svg>
);

const YouTubeLogo = ({ size = 28 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect width="48" height="48" rx="12" fill="#FF0000" />
    <Path d="M33.2 24.1L18.8 32.4V15.8L33.2 24.1Z" fill="#FFFFFF" />
  </Svg>
);

const GmailLogo = ({ size = 28 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Path d="M10 38V18.8L3 13.5V35C3 36.6 4.3 38 6 38H10Z" fill="#4285F4" />
    <Path d="M38 38V18.8L45 13.5V35C45 36.6 43.7 38 42 38H38Z" fill="#34A853" />
    <Path d="M38 18.8V10L24 20.5L10 10V18.8L24 29.3L38 18.8Z" fill="#EA4335" />
    <Path d="M10 10L3 13.5L10 18.8V10Z" fill="#C5221F" />
    <Path d="M38 10L45 13.5L38 18.8V10Z" fill="#FBBC04" />
  </Svg>
);

const OutlookLogo = ({ size = 28 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect width="48" height="48" rx="12" fill="#0078D4" />
    <Circle cx="24" cy="24" r="10" stroke="#FFFFFF" strokeWidth="3" fill="none" />
    <Path d="M17 19H31V29H17V19Z" fill="#FFFFFF" opacity={0.3} />
    <Path d="M17 19L24 24L31 19" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
  </Svg>
);

const GoogleMapsLogo = ({ size = 28 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect width="48" height="48" rx="12" fill="#34A853" />
    <Path
      d="M24 10C17.9 10 13 14.9 13 21C13 28.5 24 38 24 38C24 38 35 28.5 35 21C35 14.9 30.1 10 24 10Z"
      fill="#EA4335"
    />
    <Circle cx="24" cy="20" r="5" fill="#FFFFFF" />
  </Svg>
);

const GoogleDocsLogo = ({ size = 28 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect width="48" height="48" rx="12" fill="#4285F4" />
    <Rect x="13" y="11" width="22" height="26" rx="3" fill="#FFFFFF" />
    <Path d="M17 17H31M17 23H31M17 29H26" stroke="#4285F4" strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

const GoogleSheetsLogo = ({ size = 28 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect width="48" height="48" rx="12" fill="#0F9D58" />
    <Rect x="13" y="11" width="22" height="26" rx="3" fill="#FFFFFF" />
    <Path d="M17 17H31M17 23H31M17 29H31" stroke="#0F9D58" strokeWidth="2.5" strokeLinecap="round" />
    <Path d="M24 17V29" stroke="#0F9D58" strokeWidth="2" />
  </Svg>
);

const OneDriveLogo = ({ size = 28 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect width="48" height="48" rx="12" fill="#0078D4" />
    <Path
      d="M17.5 32C14.5 32 12 29.5 12 26.5C12 23.8 13.9 21.6 16.5 21.1C17.3 17.6 20.4 15 24 15C28.2 15 31.7 18.2 32 22.4C34.3 22.8 36 24.8 36 27.2C36 30 33.7 32 31 32H17.5Z"
      fill="#FFFFFF"
    />
  </Svg>
);

const GoogleSlidesLogo = ({ size = 28 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect width="48" height="48" rx="12" fill="#F4B400" />
    <Rect x="13" y="11" width="22" height="26" rx="3" fill="#FFFFFF" />
    <Rect x="17" y="16" width="14" height="11" rx="1" fill="#F4B400" />
  </Svg>
);

const GoogleNewsLogo = ({ size = 28 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect width="48" height="48" rx="12" fill="#4285F4" />
    <Rect x="12" y="12" width="24" height="24" rx="4" fill="#FFFFFF" />
    <Path d="M16 16H32V20H16V16Z" fill="#EA4335" />
    <Path d="M16 23H25V26H16V23Z" fill="#34A853" />
    <Path d="M16 28H28V30H16V28Z" fill="#FBBC04" />
    <Rect x="27" y="22" width="5" height="5" rx="1" fill="#4285F4" />
  </Svg>
);

export default function AboutUwoScreen() {
  const router = useRouter();
  const { colors, mode } = useTheme();
  const insets = useSafeAreaInsets();

  // Active founder state ('abha' | 'dev')
  const [activeFounder, setActiveFounder] = useState<'abha' | 'dev'>('abha');

  // Animation drivers
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const packetAnim = useRef(new Animated.Value(0)).current;
  const orbitAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Soft pulse for status indicators
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // 2. Data packet moving through connector line
    const packetLoop = Animated.loop(
      Animated.timing(packetAnim, {
        toValue: 1,
        duration: 2400,
        useNativeDriver: true,
      })
    );
    packetLoop.start();

    // 3. Subtle core orbit
    const orbitLoop = Animated.loop(
      Animated.timing(orbitAnim, {
        toValue: 1,
        duration: 12000,
        useNativeDriver: true,
      })
    );
    orbitLoop.start();

    return () => {
      pulseLoop.stop();
      packetLoop.stop();
      orbitLoop.stop();
    };
  }, [pulseAnim, packetAnim, orbitAnim]);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  const packetTranslateX = packetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 60],
  });

  const isDark = mode === 'dark' || true; // Native UWO Connect aesthetic is dark SaaS

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header title="About UWO" showBack={true} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 48 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Decorative Ambient Top Glow */}
        <View
          style={[
            styles.ambientGlow,
            { backgroundColor: `${colors.primary}14` },
          ]}
          pointerEvents="none"
        />

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* SECTION 1 — UWO IDENTITY (Branded Hero)                      */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <View style={styles.heroSection}>
          {/* Top Label */}
          <View
            style={[
              styles.identityBadge,
              {
                backgroundColor: `${colors.primary}18`,
                borderColor: `${colors.primary}35`,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.liveDot,
                {
                  backgroundColor: colors.primary,
                  transform: [{ scale: pulseScale }],
                  opacity: pulseOpacity,
                },
              ]}
            />
            <Text
              variant="caption"
              weight="bold"
              style={{ color: colors.primary, letterSpacing: 1.2, fontSize: 10 }}
            >
              ABOUT UWO
            </Text>
          </View>

          {/* Main Heading */}
          <Text
            variant="h1"
            weight="bold"
            align="center"
            style={[styles.heroHeading, { color: colors.textPrimary }]}
          >
            BUILT TO CONNECT.{'\n'}
            <Text
              variant="h1"
              weight="bold"
              style={{ color: colors.primary }}
            >
              DESIGNED TO AUTOMATE.
            </Text>
          </Text>

          {/* Supporting Text */}
          <Text
            variant="body"
            align="center"
            color={colors.textSecondary}
            style={styles.heroSubtitle}
          >
            UWO Connect brings communication, business tools and automation
            together inside one intelligent workspace.
          </Text>

          {/* Central Logo Workspace Visual with Connected Nodes & Workflow Lines */}
          <View style={styles.heroWorkspaceContainer}>
            {/* Background connection lines SVG */}
            <Svg
              width={SCREEN_WIDTH - 48}
              height={180}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            >
              <Defs>
                <LinearGradient id="heroLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.6} />
                  <Stop offset="50%" stopColor={colors.primary} stopOpacity={0.15} />
                  <Stop offset="100%" stopColor="#3B82F6" stopOpacity={0.6} />
                </LinearGradient>
              </Defs>
              <SvgLine
                x1="40"
                y1="36"
                x2={(SCREEN_WIDTH - 48) / 2}
                y2="90"
                stroke="url(#heroLineGrad)"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
              <SvgLine
                x1={SCREEN_WIDTH - 88}
                y1="36"
                x2={(SCREEN_WIDTH - 48) / 2}
                y2="90"
                stroke="url(#heroLineGrad)"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
              <SvgLine
                x1="40"
                y1="144"
                x2={(SCREEN_WIDTH - 48) / 2}
                y2="90"
                stroke="url(#heroLineGrad)"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
              <SvgLine
                x1={SCREEN_WIDTH - 88}
                y1="144"
                x2={(SCREEN_WIDTH - 48) / 2}
                y2="90"
                stroke="url(#heroLineGrad)"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
            </Svg>

            {/* Orbiting Satellite Node 1: AI Auto-Reply */}
            <View
              style={[
                styles.nodePill,
                styles.nodeTopLeft,
                {
                  backgroundColor: colors.surface,
                  borderColor: `${colors.primary}40`,
                },
              ]}
            >
              <Bot size={13} color={colors.primary} />
              <Text variant="caption" weight="bold" color={colors.textPrimary}>
                AI Engine
              </Text>
            </View>

            {/* Orbiting Satellite Node 2: WhatsApp / Omnichannel */}
            <View
              style={[
                styles.nodePill,
                styles.nodeTopRight,
                {
                  backgroundColor: colors.surface,
                  borderColor: '#25D36660',
                },
              ]}
            >
              <MessageSquare size={13} color="#25D366" />
              <Text variant="caption" weight="bold" color={colors.textPrimary}>
                Channels
              </Text>
            </View>

            {/* Central UWO Connect Core Hub */}
            <View
              style={[
                styles.heroLogoHub,
                {
                  backgroundColor: colors.surface,
                  borderColor: `${colors.primary}50`,
                  shadowColor: colors.primary,
                },
              ]}
            >
              <Image
                source={require('../../assets/icon.png')}
                style={styles.heroLogoImage}
                resizeMode="contain"
              />
              <View
                style={[
                  styles.activeGlowRing,
                  { borderColor: `${colors.primary}30` },
                ]}
              />
            </View>

            {/* Orbiting Satellite Node 3: Workflows */}
            <View
              style={[
                styles.nodePill,
                styles.nodeBottomLeft,
                {
                  backgroundColor: colors.surface,
                  borderColor: '#3B82F660',
                },
              ]}
            >
              <Workflow size={13} color="#3B82F6" />
              <Text variant="caption" weight="bold" color={colors.textPrimary}>
                Workflows
              </Text>
            </View>

            {/* Orbiting Satellite Node 4: Billing / Invoices */}
            <View
              style={[
                styles.nodePill,
                styles.nodeBottomRight,
                {
                  backgroundColor: colors.surface,
                  borderColor: '#10B98160',
                },
              ]}
            >
              <Receipt size={13} color="#10B981" />
              <Text variant="caption" weight="bold" color={colors.textPrimary}>
                Commerce
              </Text>
            </View>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* SECTION 2 — WHO WE ARE                                       */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <View style={styles.sectionBlock}>
          <Text
            variant="label"
            color={colors.textMuted}
            style={styles.sectionHeaderLabel}
          >
            WHO WE ARE
          </Text>

          <Card style={[styles.whoCard, { borderColor: `${colors.primary}25` }]}>
            <View style={styles.whoHeaderRow}>
              <View
                style={[
                  styles.whoIconCircle,
                  { backgroundColor: `${colors.primary}18` },
                ]}
              >
                <Cpu size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  variant="body"
                  weight="bold"
                  color={colors.textPrimary}
                  style={styles.whoMainStatement}
                >
                  UWO Connect is an intelligent communication and business
                  automation platform designed to connect conversations, tools,
                  teams and workflows in one workspace.
                </Text>
              </View>
            </View>

            {/* 3 Compact Capability Modules/Pills (Native Dashboard Module Style) */}
            <View style={styles.capabilityList}>
              {/* Module 1: Communication */}
              <View
                style={[
                  styles.capabilityModule,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.capModuleHeader}>
                  <View style={styles.capLeftHeader}>
                    <View
                      style={[
                        styles.capDot,
                        { backgroundColor: '#25D366' },
                      ]}
                    />
                    <Text
                      variant="caption"
                      weight="bold"
                      style={{ color: colors.primary, letterSpacing: 0.8 }}
                    >
                      COMMUNICATION
                    </Text>
                  </View>
                  <Badge label="OMNICHANNEL" variant="success" />
                </View>
                <Text
                  variant="body"
                  weight="medium"
                  color={colors.textPrimary}
                  style={styles.capText}
                >
                  WhatsApp • Instagram • Facebook • YouTube
                </Text>
              </View>

              {/* Module 2: Connectors */}
              <View
                style={[
                  styles.capabilityModule,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.capModuleHeader}>
                  <View style={styles.capLeftHeader}>
                    <View
                      style={[
                        styles.capDot,
                        { backgroundColor: '#3B82F6' },
                      ]}
                    />
                    <Text
                      variant="caption"
                      weight="bold"
                      style={{ color: '#3B82F6', letterSpacing: 0.8 }}
                    >
                      CONNECTORS
                    </Text>
                  </View>
                  <Badge label="INTEGRATIONS" variant="info" />
                </View>
                <Text
                  variant="body"
                  weight="medium"
                  color={colors.textPrimary}
                  style={styles.capText}
                >
                  Business tools, documents, email, maps and data
                </Text>
              </View>

              {/* Module 3: Automation */}
              <View
                style={[
                  styles.capabilityModule,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.capModuleHeader}>
                  <View style={styles.capLeftHeader}>
                    <View
                      style={[
                        styles.capDot,
                        { backgroundColor: '#F59E0B' },
                      ]}
                    />
                    <Text
                      variant="caption"
                      weight="bold"
                      style={{ color: '#F59E0B', letterSpacing: 0.8 }}
                    >
                      AUTOMATION
                    </Text>
                  </View>
                  <Badge label="WORKFLOW ENGINE" variant="warning" />
                </View>
                <Text
                  variant="body"
                  weight="medium"
                  color={colors.textPrimary}
                  style={styles.capText}
                >
                  CRM • AI Replies • Quotations • Payments • Invoices
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* SECTION 3 — THE PEOPLE BEHIND UWO (Unified Workspace)        */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <View style={styles.sectionBlock}>
          <Text
            variant="label"
            color={colors.textMuted}
            style={styles.sectionHeaderLabel}
          >
            THE PEOPLE BEHIND UWO
          </Text>

          <Text
            variant="body"
            color={colors.textSecondary}
            style={styles.foundersSubtitle}
          >
            Building the intelligence behind connected business workflows.
          </Text>

          {/* Unified Intelligence Workspace Card */}
          <Card
            style={[
              styles.intelligenceWorkspaceCard,
              {
                backgroundColor: colors.surface,
                borderColor: `${colors.primary}35`,
              },
            ]}
          >
            {/* Workspace Header Badge */}
            <View style={styles.workspaceHeaderRow}>
              <View
                style={[
                  styles.workspacePill,
                  {
                    backgroundColor: `${colors.primary}15`,
                    borderColor: `${colors.primary}30`,
                  },
                ]}
              >
                <Sparkles size={12} color={colors.primary} />
                <Text
                  variant="caption"
                  weight="bold"
                  style={{ color: colors.primary, letterSpacing: 1 }}
                >
                  UWO CONNECT INTELLIGENCE
                </Text>
              </View>
              <Text variant="caption" color={colors.textMuted}>
                Tap founder to inspect focus
              </Text>
            </View>

            {/* Interactive Dual Founder Workspace Stage */}
            <View style={styles.stageRow}>
              {/* Founder 1: ABHA (Automation Intelligence) */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setActiveFounder('abha')}
                style={[
                  styles.founderInteractiveCol,
                  activeFounder === 'abha' ? styles.founderActive : styles.founderDimmed,
                ]}
              >
                <View
                  style={[
                    styles.founderAvatarBox,
                    {
                      borderColor:
                        activeFounder === 'abha'
                          ? colors.primary
                          : colors.border,
                      backgroundColor: colors.card,
                    },
                    activeFounder === 'abha' && styles.avatarGlowActive,
                  ]}
                >
                  <Image
                    source={require('../../assets/images/abha.png')}
                    style={styles.founderPhoto}
                    resizeMode="cover"
                  />
                  {activeFounder === 'abha' && (
                    <View
                      style={[
                        styles.founderActiveDot,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                  )}
                </View>
                <Text
                  variant="h3"
                  weight="bold"
                  color={
                    activeFounder === 'abha'
                      ? colors.textPrimary
                      : colors.textSecondary
                  }
                  style={styles.founderNameText}
                >
                  ABHA
                </Text>
                <View
                  style={[
                    styles.founderRoleTag,
                    {
                      backgroundColor:
                        activeFounder === 'abha'
                          ? `${colors.primary}20`
                          : `${colors.textMuted}15`,
                      borderColor:
                        activeFounder === 'abha'
                          ? colors.primary
                          : 'transparent',
                    },
                  ]}
                >
                  <Text
                    variant="caption"
                    weight="bold"
                    style={{
                      color:
                        activeFounder === 'abha'
                          ? colors.primary
                          : colors.textMuted,
                      fontSize: 9.5,
                      letterSpacing: 0.5,
                    }}
                  >
                    AUTOMATION
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Founder 2: DEV (Connector Intelligence) */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setActiveFounder('dev')}
                style={[
                  styles.founderInteractiveCol,
                  activeFounder === 'dev' ? styles.founderActive : styles.founderDimmed,
                ]}
              >
                <View
                  style={[
                    styles.founderAvatarBox,
                    {
                      borderColor:
                        activeFounder === 'dev'
                          ? '#3B82F6'
                          : colors.border,
                      backgroundColor: colors.card,
                    },
                    activeFounder === 'dev' && styles.avatarGlowBlue,
                  ]}
                >
                  <Image
                    source={require('../../assets/images/dev.png')}
                    style={styles.founderPhoto}
                    resizeMode="cover"
                  />
                  {activeFounder === 'dev' && (
                    <View
                      style={[
                        styles.founderActiveDot,
                        { backgroundColor: '#3B82F6' },
                      ]}
                    />
                  )}
                </View>
                <Text
                  variant="h3"
                  weight="bold"
                  color={
                    activeFounder === 'dev'
                      ? colors.textPrimary
                      : colors.textSecondary
                  }
                  style={styles.founderNameText}
                >
                  DEV
                </Text>
                <View
                  style={[
                    styles.founderRoleTag,
                    {
                      backgroundColor:
                        activeFounder === 'dev'
                          ? '#3B82F620'
                          : `${colors.textMuted}15`,
                      borderColor:
                        activeFounder === 'dev' ? '#3B82F6' : 'transparent',
                    },
                  ]}
                >
                  <Text
                    variant="caption"
                    weight="bold"
                    style={{
                      color:
                        activeFounder === 'dev' ? '#3B82F6' : colors.textMuted,
                      fontSize: 9.5,
                      letterSpacing: 0.5,
                    }}
                  >
                    CONNECTORS
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Glowing Connection Flow between ABHA ↔ DEV with Animated Data Packets */}
            <View style={styles.flowLineWrapper}>
              <Svg width={SCREEN_WIDTH - 72} height={42} viewBox={`0 0 ${SCREEN_WIDTH - 72} 42`}>
                <Defs>
                  <LinearGradient id="coreLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.8} />
                    <Stop offset="50%" stopColor={colors.primary} stopOpacity={0.25} />
                    <Stop offset="100%" stopColor="#3B82F6" stopOpacity={0.8} />
                  </LinearGradient>
                </Defs>
                {/* Horizontal Interconnect Line */}
                <SvgLine
                  x1="48"
                  y1="21"
                  x2={SCREEN_WIDTH - 120}
                  y2="21"
                  stroke="url(#coreLineGrad)"
                  strokeWidth="2"
                  strokeDasharray="4,3"
                />
              </Svg>

              {/* Animated Floating Data Packet */}
              <Animated.View
                style={[
                  styles.dataPacket,
                  {
                    backgroundColor:
                      activeFounder === 'abha' ? colors.primary : '#3B82F6',
                    transform: [{ translateX: packetTranslateX }],
                  },
                ]}
              />

              {/* Center UWO Core Hub Node */}
              <View
                style={[
                  styles.coreCenterNode,
                  {
                    backgroundColor: colors.surface,
                    borderColor: `${colors.primary}50`,
                  },
                ]}
              >
                <Zap size={13} color={colors.primary} />
                <Text
                  variant="caption"
                  weight="bold"
                  style={{ color: colors.primary, fontSize: 9.5 }}
                >
                  UWO CORE
                </Text>
              </View>
            </View>

            {/* Active Founder Dynamic Intelligence Inspector Box */}
            <View
              style={[
                styles.intelligenceDetailBox,
                {
                  backgroundColor: colors.card,
                  borderColor:
                    activeFounder === 'abha'
                      ? `${colors.primary}40`
                      : '#3B82F640',
                },
              ]}
            >
              <View style={styles.detailHeaderRow}>
                <View
                  style={[
                    styles.detailBadge,
                    {
                      backgroundColor:
                        activeFounder === 'abha'
                          ? `${colors.primary}18`
                          : '#3B82F618',
                    },
                  ]}
                >
                  <Text
                    variant="caption"
                    weight="bold"
                    style={{
                      color:
                        activeFounder === 'abha'
                          ? colors.primary
                          : '#3B82F6',
                      fontSize: 10,
                      letterSpacing: 0.8,
                    }}
                  >
                    {activeFounder === 'abha'
                      ? 'ABHA • AUTOMATION INTELLIGENCE'
                      : 'DEV • CONNECTOR INTELLIGENCE'}
                  </Text>
                </View>
                <Badge
                  label="LIVE ENGINE"
                  variant={activeFounder === 'abha' ? 'success' : 'info'}
                />
              </View>

              <Text
                variant="body"
                color={colors.textPrimary}
                style={styles.detailDescription}
              >
                {activeFounder === 'abha'
                  ? 'Drives intelligent automation across conversations, CRM, quotations, invoices and business workflows.'
                  : 'Connects external business tools, data, documents and communication systems into the UWO Connect workflow.'}
              </Text>

              {/* Dynamic Capability Badges */}
              <View style={styles.detailTagsRow}>
                {activeFounder === 'abha' ? (
                  <>
                    <View style={[styles.miniPill, { borderColor: `${colors.primary}30` }]}>
                      <Text variant="caption" color={colors.textSecondary}>CRM Pipelines</Text>
                    </View>
                    <View style={[styles.miniPill, { borderColor: `${colors.primary}30` }]}>
                      <Text variant="caption" color={colors.textSecondary}>AI Auto Replies</Text>
                    </View>
                    <View style={[styles.miniPill, { borderColor: `${colors.primary}30` }]}>
                      <Text variant="caption" color={colors.textSecondary}>GST Invoices</Text>
                    </View>
                    <View style={[styles.miniPill, { borderColor: `${colors.primary}30` }]}>
                      <Text variant="caption" color={colors.textSecondary}>Smart Quotations</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={[styles.miniPill, { borderColor: '#3B82F630' }]}>
                      <Text variant="caption" color={colors.textSecondary}>Google Suite</Text>
                    </View>
                    <View style={[styles.miniPill, { borderColor: '#3B82F630' }]}>
                      <Text variant="caption" color={colors.textSecondary}>Microsoft 365</Text>
                    </View>
                    <View style={[styles.miniPill, { borderColor: '#3B82F630' }]}>
                      <Text variant="caption" color={colors.textSecondary}>Meta Cloud API</Text>
                    </View>
                    <View style={[styles.miniPill, { borderColor: '#3B82F630' }]}>
                      <Text variant="caption" color={colors.textSecondary}>Payment Gateways</Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          </Card>
        </View>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* SECTION 4 — WHAT WE BUILD (Capability Ecosystem Interface)   */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <View style={styles.sectionBlock}>
          <Text
            variant="label"
            color={colors.textMuted}
            style={styles.sectionHeaderLabel}
          >
            WHAT WE BUILD
          </Text>

          {/* Group 1: COMMUNICATION */}
          <Card style={[styles.ecosystemGroupCard, { borderColor: colors.border }]}>
            <View style={styles.groupHeaderRow}>
              <View style={[styles.groupIconBox, { backgroundColor: `${colors.primary}18` }]}>
                <MessageSquare size={17} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="h3" weight="bold" color={colors.textPrimary}>
                  COMMUNICATION
                </Text>
                <Text variant="caption" color={colors.textMuted}>
                  Direct customer touchpoints & omnichannel channels
                </Text>
              </View>
              <Badge label="4 CHANNELS" variant="success" />
            </View>

            <View style={styles.ecosystemGrid}>
              <View style={[styles.gridNodeItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <WhatsAppLogo size={24} />
                <Text variant="caption" weight="bold" color={colors.textPrimary}>WhatsApp</Text>
              </View>
              <View style={[styles.gridNodeItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <InstagramLogo size={24} />
                <Text variant="caption" weight="bold" color={colors.textPrimary}>Instagram</Text>
              </View>
              <View style={[styles.gridNodeItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <FacebookLogo size={24} />
                <Text variant="caption" weight="bold" color={colors.textPrimary}>Facebook</Text>
              </View>
              <View style={[styles.gridNodeItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <YouTubeLogo size={24} />
                <Text variant="caption" weight="bold" color={colors.textPrimary}>YouTube</Text>
              </View>
            </View>
          </Card>

          {/* Group 2: BUSINESS TOOLS */}
          <Card style={[styles.ecosystemGroupCard, { borderColor: colors.border, marginTop: 14 }]}>
            <View style={styles.groupHeaderRow}>
              <View style={[styles.groupIconBox, { backgroundColor: '#3B82F618' }]}>
                <Share2 size={17} color="#3B82F6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="h3" weight="bold" color={colors.textPrimary}>
                  BUSINESS TOOLS
                </Text>
                <Text variant="caption" color={colors.textMuted}>
                  Data sync, document pipelines & productivity connectors
                </Text>
              </View>
              <Badge label="8 CONNECTORS" variant="info" />
            </View>

            <View style={styles.ecosystemGrid}>
              <View style={[styles.gridNodeItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <GmailLogo size={22} />
                <Text variant="caption" weight="bold" color={colors.textPrimary}>Gmail</Text>
              </View>
              <View style={[styles.gridNodeItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <OutlookLogo size={22} />
                <Text variant="caption" weight="bold" color={colors.textPrimary}>Outlook</Text>
              </View>
              <View style={[styles.gridNodeItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <GoogleMapsLogo size={22} />
                <Text variant="caption" weight="bold" color={colors.textPrimary}>Google Maps</Text>
              </View>
              <View style={[styles.gridNodeItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <GoogleDocsLogo size={22} />
                <Text variant="caption" weight="bold" color={colors.textPrimary}>Google Docs</Text>
              </View>
              <View style={[styles.gridNodeItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <GoogleSheetsLogo size={22} />
                <Text variant="caption" weight="bold" color={colors.textPrimary}>Google Sheets</Text>
              </View>
              <View style={[styles.gridNodeItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <OneDriveLogo size={22} />
                <Text variant="caption" weight="bold" color={colors.textPrimary}>OneDrive</Text>
              </View>
              <View style={[styles.gridNodeItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <GoogleSlidesLogo size={22} />
                <Text variant="caption" weight="bold" color={colors.textPrimary}>Google Slides</Text>
              </View>
              <View style={[styles.gridNodeItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <GoogleNewsLogo size={22} />
                <Text variant="caption" weight="bold" color={colors.textPrimary}>Google News</Text>
              </View>
            </View>
          </Card>

          {/* Group 3: AUTOMATION */}
          <Card style={[styles.ecosystemGroupCard, { borderColor: colors.border, marginTop: 14 }]}>
            <View style={styles.groupHeaderRow}>
              <View style={[styles.groupIconBox, { backgroundColor: '#F59E0B18' }]}>
                <Cpu size={17} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="h3" weight="bold" color={colors.textPrimary}>
                  AUTOMATION
                </Text>
                <Text variant="caption" color={colors.textMuted}>
                  Intelligent workflows, AI replies & revenue management
                </Text>
              </View>
              <Badge label="8 MODULES" variant="warning" />
            </View>

            <View style={styles.ecosystemGrid}>
              <View style={[styles.gridNodeItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Users size={20} color={colors.primary} />
                <Text variant="caption" weight="bold" color={colors.textPrimary}>CRM</Text>
              </View>
              <View style={[styles.gridNodeItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Bot size={20} color="#059669" />
                <Text variant="caption" weight="bold" color={colors.textPrimary}>AI Auto Reply</Text>
              </View>
              <View style={[styles.gridNodeItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <FileCheck size={20} color="#3B82F6" />
                <Text variant="caption" weight="bold" color={colors.textPrimary}>Quotation</Text>
              </View>
              <View style={[styles.gridNodeItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Receipt size={20} color="#10B981" />
                <Text variant="caption" weight="bold" color={colors.textPrimary}>Invoice</Text>
              </View>
              <View style={[styles.gridNodeItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <FileText size={20} color="#6366F1" />
                <Text variant="caption" weight="bold" color={colors.textPrimary}>Proposal</Text>
              </View>
              <View style={[styles.gridNodeItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <CreditCard size={20} color="#EC4899" />
                <Text variant="caption" weight="bold" color={colors.textPrimary}>Payments</Text>
              </View>
              <View style={[styles.gridNodeItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Laptop size={20} color="#8B5CF6" />
                <Text variant="caption" weight="bold" color={colors.textPrimary}>Team Hub</Text>
              </View>
              <View style={[styles.gridNodeItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <PhoneCall size={20} color="#F43F5E" />
                <Text variant="caption" weight="bold" color={colors.textPrimary}>Voice & Video</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* SECTION 5 — UWO CONNECT CORE (Closing Visual)                */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <View style={styles.sectionBlock}>
          <Card
            style={[
              styles.coreSectionCard,
              {
                backgroundColor: colors.surface,
                borderColor: `${colors.primary}30`,
              },
            ]}
          >
            <View
              style={[
                styles.coreBadge,
                {
                  backgroundColor: `${colors.primary}18`,
                  borderColor: `${colors.primary}35`,
                },
              ]}
            >
              <Text
                variant="caption"
                weight="bold"
                style={{ color: colors.primary, letterSpacing: 1.2, fontSize: 10 }}
              >
                UWO CONNECT
              </Text>
            </View>

            <Text
              variant="h2"
              weight="bold"
              align="center"
              style={[styles.coreHeading, { color: colors.textPrimary }]}
            >
              ONE WORKSPACE.{'\n'}
              <Text style={{ color: colors.primary }}>
                CONNECTED INTELLIGENCE.
              </Text>
            </Text>

            {/* Central Core with Orbiting Module Tags */}
            <View style={styles.coreStage}>
              {/* Outer Orbit Circle */}
              <View
                style={[
                  styles.orbitRing,
                  { borderColor: `${colors.primary}25` },
                ]}
              />

              {/* Central Logo */}
              <View
                style={[
                  styles.coreCenterLogoBox,
                  {
                    backgroundColor: colors.card,
                    borderColor: `${colors.primary}50`,
                  },
                ]}
              >
                <Image
                  source={require('../../assets/icon.png')}
                  style={styles.coreCenterImage}
                  resizeMode="contain"
                />
              </View>

              {/* 8 Connected Nodes Representing the Core Modules */}
              <View style={styles.coreNodesContainer}>
                {[
                  'MESSAGES',
                  'CRM',
                  'AI',
                  'CONNECTORS',
                  'TEAM',
                  'QUOTATIONS',
                  'PAYMENTS',
                  'INVOICES',
                ].map((nodeLabel, idx) => (
                  <View
                    key={nodeLabel}
                    style={[
                      styles.coreNodeChip,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.chipDot,
                        {
                          backgroundColor:
                            idx % 2 === 0 ? colors.primary : '#3B82F6',
                        },
                      ]}
                    />
                    <Text
                      variant="caption"
                      weight="bold"
                      color={colors.textPrimary}
                      style={{ fontSize: 9.5, letterSpacing: 0.5 }}
                    >
                      {nodeLabel}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>
        </View>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* SECTION 6 — FOOTER                                            */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <View
          style={[
            styles.footerCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.footerHeaderRow}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.footerLogo}
              resizeMode="contain"
            />
            <View style={{ flex: 1 }}>
              <Text variant="body" weight="bold" color={colors.textPrimary}>
                UWO Connect
              </Text>
              <Text variant="caption" color={colors.textMuted}>
                Unified Communication & Business Automation Platform
              </Text>
            </View>
          </View>

          <View style={[styles.footerDivider, { backgroundColor: colors.divider }]} />

          {/* Website Link */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Linking.openURL('https://uwoconnect.aisa24.com')}
            style={[
              styles.websiteLinkButton,
              {
                backgroundColor: `${colors.primary}12`,
                borderColor: `${colors.primary}30`,
              },
            ]}
          >
            <Globe size={15} color={colors.primary} />
            <Text
              variant="caption"
              weight="bold"
              style={{ color: colors.primary, marginLeft: 6, flex: 1 }}
            >
              uwoconnect.aisa24.com
            </Text>
            <ExternalLink size={13} color={colors.primary} />
          </TouchableOpacity>

          <View style={styles.footerBottomNote}>
            <Text
              variant="caption"
              color={colors.textMuted}
              align="center"
              style={{ fontSize: 10.5 }}
            >
              © {new Date().getFullYear()} UWO Connect • Powered by Aisa Technologies
            </Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingTop: 12,
  },
  ambientGlow: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 180,
    borderRadius: 90,
  },

  // Section 1
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  identityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    marginBottom: 14,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  heroHeading: {
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  heroSubtitle: {
    maxWidth: 320,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  heroWorkspaceContainer: {
    width: '100%',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 4,
  },
  heroLogoHub: {
    width: 68,
    height: 68,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
  },
  heroLogoImage: {
    width: 48,
    height: 48,
  },
  activeGlowRing: {
    position: 'absolute',
    width: 82,
    height: 82,
    borderRadius: 26,
    borderWidth: 1,
  },
  nodePill: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  nodeTopLeft: {
    top: 14,
    left: 12,
  },
  nodeTopRight: {
    top: 14,
    right: 12,
  },
  nodeBottomLeft: {
    bottom: 14,
    left: 12,
  },
  nodeBottomRight: {
    bottom: 14,
    right: 12,
  },

  // General block
  sectionBlock: {
    marginBottom: 24,
  },
  sectionHeaderLabel: {
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 11,
    fontWeight: '700',
  },

  // Section 2
  whoCard: {
    padding: 18,
    borderRadius: 18,
  },
  whoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  whoIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whoMainStatement: {
    fontSize: 13.5,
    lineHeight: 19,
  },
  capabilityList: {
    gap: 10,
  },
  capabilityModule: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  capModuleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  capLeftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  capDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  capText: {
    fontSize: 12.5,
    lineHeight: 17,
  },

  // Section 3: Founders
  foundersSubtitle: {
    fontSize: 12.5,
    lineHeight: 17,
    marginBottom: 12,
  },
  intelligenceWorkspaceCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  workspaceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  workspacePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  founderInteractiveCol: {
    alignItems: 'center',
    flex: 1,
  },
  founderActive: {
    opacity: 1,
    transform: [{ scale: 1.04 }],
  },
  founderDimmed: {
    opacity: 0.45,
    transform: [{ scale: 0.96 }],
  },
  founderAvatarBox: {
    width: 82,
    height: 82,
    borderRadius: 24,
    borderWidth: 2,
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlowActive: {
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  avatarGlowBlue: {
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  founderPhoto: {
    width: '100%',
    height: '100%',
  },
  founderActiveDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  founderNameText: {
    fontSize: 14,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  founderRoleTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },

  // Flow line
  flowLineWrapper: {
    width: '100%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 4,
  },
  dataPacket: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  coreCenterNode: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },

  // Inspector box
  intelligenceDetailBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  detailDescription: {
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 10,
  },
  detailTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  miniPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },

  // Section 4: What We Build
  ecosystemGroupCard: {
    padding: 16,
    borderRadius: 18,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  groupIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ecosystemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridNodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    minWidth: '47%',
    flex: 1,
  },

  // Section 5: Core
  coreSectionCard: {
    padding: 20,
    borderRadius: 22,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  coreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 10,
  },
  coreHeading: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 18,
    letterSpacing: 0.3,
  },
  coreStage: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  orbitRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  coreCenterLogoBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  coreCenterImage: {
    width: 44,
    height: 44,
  },
  coreNodesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    maxWidth: 320,
  },
  coreNodeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 10,
    borderWidth: 1,
    gap: 5,
  },
  chipDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },

  // Section 6: Footer
  footerCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 4,
  },
  footerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  footerLogo: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  footerDivider: {
    height: 1,
    marginBottom: 12,
  },
  websiteLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  footerBottomNote: {
    alignItems: 'center',
  },
});
