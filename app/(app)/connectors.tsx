import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useConnectorsTabStore, ConnectorsTargetTab } from '../../src/stores/connectorsTabStore';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { useTheme } from '../../src/theme';
import { authApi } from '../../src/api/auth';
import { channelAuthApi } from '../../src/api/channelAuth';
import { statsApi } from '../../src/api/stats';
import { useSessionStore } from '../../src/stores/sessionStore';
import { useChannelAccess } from '../../src/hooks/useChannelAccess';
import { 
  Share2, 
  MessageSquare, 
  Mail, 
  Calendar, 
  Video, 
  Cloud, 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Sparkles, 
  FileText,
  Globe,
  Layers,
  ChevronRight,
  Users,
  Receipt,
  PhoneCall,
  Bot,
  FolderKanban,
  CreditCard,
  Package,
  ShoppingBag,
  Newspaper,
  X,
  Eye,
  EyeOff,
  Check,
  Lock
} from 'lucide-react-native';

// ═════════════════════════════════════════════════════════════════════════════════
// ── AUTHENTIC BRAND VECTOR LOGO SVG COMPONENTS ──
// ═════════════════════════════════════════════════════════════════════════════════

const WhatsAppLogo = ({ size = 44 }: { size?: number }) => (
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

const InstagramLogo = ({ size = 44 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Defs>
      <LinearGradient id="igBrandGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#FFD600" />
        <Stop offset="25%" stopColor="#FF7A00" />
        <Stop offset="50%" stopColor="#FF0069" />
        <Stop offset="75%" stopColor="#D300C5" />
        <Stop offset="100%" stopColor="#7638FA" />
      </LinearGradient>
    </Defs>
    <Rect width="48" height="48" rx="12" fill="url(#igBrandGrad)" />
    <Rect x="11" y="11" width="26" height="26" rx="7" stroke="#FFFFFF" strokeWidth="3" fill="none" />
    <Circle cx="24" cy="24" r="6" stroke="#FFFFFF" strokeWidth="3" fill="none" />
    <Circle cx="31.5" cy="16.5" r="1.75" fill="#FFFFFF" />
  </Svg>
);

const FacebookLogo = ({ size = 44 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Circle cx="24" cy="24" r="24" fill="#1877F2" />
    <Path
      d="M29.5 25.1L30.3 19.9H25.3V16.5C25.3 15.1 26 13.7 28.2 13.7H30.5V9.3C30.5 9.3 28.4 9 26.4 9C22.3 9 19.6 11.5 19.6 16V19.9H15V25.1H19.6V37.7C20.5 37.9 21.5 38 22.5 38C23.5 38 24.4 37.9 25.3 37.7V25.1H29.5Z"
      fill="#FFFFFF"
    />
  </Svg>
);

const YouTubeLogo = ({ size = 44 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect width="48" height="48" rx="12" fill="#FF0000" />
    <Path d="M33.2 24.1L18.8 32.4V15.8L33.2 24.1Z" fill="#FFFFFF" />
  </Svg>
);

const GmailLogo = ({ size = 44 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Path d="M10 38V18.8L3 13.5V35C3 36.6 4.3 38 6 38H10Z" fill="#4285F4" />
    <Path d="M38 38V18.8L45 13.5V35C45 36.6 43.7 38 42 38H38Z" fill="#34A853" />
    <Path d="M38 18.8V10L24 20.5L10 10V18.8L24 29.3L38 18.8Z" fill="#EA4335" />
    <Path d="M10 10L3 13.5L10 18.8V10Z" fill="#C5221F" />
    <Path d="M38 10L45 13.5L38 18.8V10Z" fill="#FBBC04" />
  </Svg>
);

const OutlookLogo = ({ size = 44 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect width="48" height="48" rx="12" fill="#0078D4" />
    <Circle cx="24" cy="24" r="10" stroke="#FFFFFF" strokeWidth="3" fill="none" />
    <Path d="M17 19H31V29H17V19Z" fill="#FFFFFF" opacity={0.3} />
    <Path d="M17 19L24 24L31 19" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
  </Svg>
);

const GoogleCalendarLogo = ({ size = 44 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect width="48" height="48" rx="12" fill="#4285F4" />
    <Rect x="12" y="14" width="24" height="22" rx="4" fill="#FFFFFF" />
    <Path d="M12 14H36V20H12V14Z" fill="#EA4335" />
    <Circle cx="18" cy="11" r="2" fill="#FFFFFF" />
    <Circle cx="30" cy="11" r="2" fill="#FFFFFF" />
  </Svg>
);

const GoogleSheetsLogo = ({ size = 44 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect width="48" height="48" rx="12" fill="#0F9D58" />
    <Rect x="13" y="11" width="22" height="26" rx="3" fill="#FFFFFF" />
    <Path d="M17 17H31M17 23H31M17 29H31" stroke="#0F9D58" strokeWidth="2.5" strokeLinecap="round" />
    <Path d="M24 17V29" stroke="#0F9D58" strokeWidth="2" />
  </Svg>
);

const GoogleDocsLogo = ({ size = 44 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect width="48" height="48" rx="12" fill="#4285F4" />
    <Rect x="13" y="11" width="22" height="26" rx="3" fill="#FFFFFF" />
    <Path d="M17 17H31M17 23H31M17 29H26" stroke="#4285F4" strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

const OneDriveLogo = ({ size = 44 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect width="48" height="48" rx="12" fill="#0078D4" />
    <Path
      d="M17.5 32C14.5 32 12 29.5 12 26.5C12 23.8 13.9 21.6 16.5 21.1C17.3 17.6 20.4 15 24 15C28.2 15 31.7 18.2 32 22.4C34.3 22.8 36 24.8 36 27.2C36 30 33.7 32 31 32H17.5Z"
      fill="#FFFFFF"
    />
  </Svg>
);

const ZohoLogo = ({ size = 44 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect width="48" height="48" rx="12" fill="#E03131" />
    <Path d="M14 15H34L19 33H34" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const RazorpayLogo = ({ size = 44 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect width="48" height="48" rx="12" fill="#02042B" />
    <Path d="M28.5 12L17 26H24.5L19 36L31 22H23.5L28.5 12Z" fill="#008CFF" />
  </Svg>
);

const TeamWorkspaceLogo = ({ size = 44 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect width="48" height="48" rx="12" fill="#8B5CF6" />
    <Circle cx="19" cy="20" r="5" fill="#FFFFFF" />
    <Circle cx="29" cy="20" r="5" fill="#FFFFFF" opacity={0.8} />
    <Path d="M11 34C11 29.5 14.5 27 19 27C23.5 27 27 29.5 27 34" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
    <Path d="M26 34C26.5 31.5 28.5 30 31.5 30C34.5 30 36.5 31.5 37 34" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity={0.8} />
  </Svg>
);

const QuotationsLogo = ({ size = 44 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect width="48" height="48" rx="12" fill="#3B82F6" />
    <Rect x="13" y="11" width="22" height="26" rx="4" fill="#FFFFFF" />
    <Path d="M17 17H30M17 23H26M17 29H23" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
    <Circle cx="31" cy="29" r="6" fill="#10B981" />
    <Path d="M28.5 29L30.2 30.7L33.5 27.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const GSTInvoicesLogo = ({ size = 44 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect width="48" height="48" rx="12" fill="#10B981" />
    <Rect x="13" y="10" width="22" height="28" rx="3" fill="#FFFFFF" />
    <Path d="M17 15H31M17 20H31" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
    <Path d="M19 26C19 26 21 24.5 24 24.5C27 24.5 29 26 29 27.5C29 29.5 24 29 24 31C24 32.5 27 33.5 29 33.5" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <Path d="M24 23.5V34.5" stroke="#10B981" strokeWidth="2" />
  </Svg>
);

const VoiceVideoLogo = ({ size = 44 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect width="48" height="48" rx="12" fill="#EC4899" />
    <Path d="M14 18C14 15.8 15.8 14 18 14H24C26.2 14 28 15.8 28 18V30C28 32.2 26.2 34 24 34H18C15.8 34 14 32.2 14 30V18Z" fill="#FFFFFF" />
    <Path d="M28 20L35 16V32L28 28V20Z" fill="#FFFFFF" opacity={0.85} />
  </Svg>
);

const AutoReplyBotLogo = ({ size = 44 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect width="48" height="48" rx="12" fill="#059669" />
    <Rect x="12" y="16" width="24" height="18" rx="6" fill="#FFFFFF" />
    <Circle cx="19" cy="23" r="2.5" fill="#059669" />
    <Circle cx="29" cy="23" r="2.5" fill="#059669" />
    <Path d="M20 28H28" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
    <Path d="M24 10V16" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    <Circle cx="24" cy="9" r="2" fill="#FFFFFF" />
  </Svg>
);

const EcommerceCatalogLogo = ({ size = 44 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect width="48" height="48" rx="12" fill="#F59E0B" />
    <Path d="M14 18H34L32 35H16L14 18Z" fill="#FFFFFF" />
    <Path d="M19 18V14C19 11.2 21.2 9 24 9C26.8 9 29 11.2 29 14V18" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" />
  </Svg>
);

const ProposalBuilderLogo = ({ size = 44 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect width="48" height="48" rx="12" fill="#6366F1" />
    <Path d="M24 10L27 18L35 21L27 24L24 32L21 24L13 21L21 18L24 10Z" fill="#FFFFFF" />
    <Path d="M34 30L35.5 34L39.5 35.5L35.5 37L34 41L32.5 37L28.5 35.5L32.5 34L34 30Z" fill="#FFFFFF" opacity={0.8} />
  </Svg>
);

const GoogleNewsLogo = ({ size = 44 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect width="48" height="48" rx="12" fill="#4285F4" />
    <Rect x="12" y="12" width="24" height="24" rx="4" fill="#FFFFFF" />
    <Path d="M16 16H32V20H16V16Z" fill="#EA4335" />
    <Path d="M16 23H25V26H16V23Z" fill="#34A853" />
    <Path d="M16 28H28V30H16V28Z" fill="#FBBC04" />
    <Rect x="27" y="22" width="5" height="5" rx="1" fill="#4285F4" />
  </Svg>
);

export type ConnectorType = 'channel' | 'connector' | 'feature';
export type FilterTab = 'ALL' | 'CHANNELS' | 'CONNECTORS' | 'FEATURES' | 'ACTIVE';

export interface ChannelConnectorItem {
  id: string;
  name: string;
  category: string;
  type: ConnectorType;
  description: string;
  icon: React.ReactNode;
  color: string;
  isConnected: boolean;
  isSvg?: boolean;
  details?: string;
  route?: string;
}

export default function ConnectorsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ tab?: string }>();
  const { colors, spacing, radius } = useTheme();
  const user = useSessionStore((state) => state.user);
  const storeTab = useConnectorsTabStore((state) => state.targetTab);
  const setStoreTab = useConnectorsTabStore((state) => state.setTargetTab);
  const { isChannelComingSoon } = useChannelAccess();

  const getInitialTab = (): FilterTab => {
    const fromParam = params?.tab?.toUpperCase();
    if (fromParam && ['ALL', 'CHANNELS', 'CONNECTORS', 'FEATURES', 'ACTIVE'].includes(fromParam)) {
      return fromParam as FilterTab;
    }
    if (storeTab && ['ALL', 'CHANNELS', 'CONNECTORS', 'FEATURES', 'ACTIVE'].includes(storeTab)) {
      return storeTab as FilterTab;
    }
    return 'ALL';
  };

  const [activeFilter, setActiveFilter] = useState<FilterTab>(getInitialTab);

  useFocusEffect(
    useCallback(() => {
      const fromParam = params?.tab?.toUpperCase();
      const target = (fromParam && ['ALL', 'CHANNELS', 'CONNECTORS', 'FEATURES', 'ACTIVE'].includes(fromParam))
        ? fromParam
        : storeTab;
      if (target && ['ALL', 'CHANNELS', 'CONNECTORS', 'FEATURES', 'ACTIVE'].includes(target)) {
        setActiveFilter(target as FilterTab);
      }
    }, [params?.tab, storeTab])
  );

  const [selectedItem, setSelectedItem] = useState<ChannelConnectorItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMetaConnecting, setIsMetaConnecting] = useState(false);
  const [metaTab, setMetaTab] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [formFields, setFormFields] = useState<Record<string, string>>({});

  const isMetaChannel = Boolean(
    selectedItem && ['whatsapp', 'facebook', 'instagram'].includes(selectedItem.id)
  );

  const handleMetaOnboarding = async (channelId: 'whatsapp' | 'facebook' | 'instagram') => {
    setIsMetaConnecting(true);
    try {
      if (channelId === 'whatsapp') {
        const res = await channelAuthApi.startWhatsAppMetaOnboarding();
        if (res.success) {
          await refetchProfile();
          await refetchStats();
          setIsModalOpen(false);
          Alert.alert(
            'WhatsApp Connected! 🎉',
            res.data?.message || 'Your WhatsApp Business Account has been connected successfully via Meta Cloud API.'
          );
        } else if (res.cancelled) {
          // User dismissed or closed window
        } else {
          Alert.alert('Meta Connection Failed', res.error || 'Failed to complete WhatsApp onboarding with Meta.');
        }
      } else if (channelId === 'facebook') {
        const res = await channelAuthApi.startFacebookMetaOnboarding();
        if (res.success) {
          await refetchProfile();
          await refetchStats();
          setIsModalOpen(false);
          Alert.alert(
            'Facebook Page Connected! 🎉',
            res.data?.message || 'Your Facebook Page has been connected successfully.'
          );
        } else if (res.cancelled) {
          // User dismissed
        } else {
          Alert.alert('Meta Connection Failed', res.error || 'Failed to complete Facebook onboarding with Meta.');
        }
      } else if (channelId === 'instagram') {
        const res = await channelAuthApi.startInstagramMetaOnboarding();
        if (res.success) {
          await refetchProfile();
          await refetchStats();
          setIsModalOpen(false);
          Alert.alert(
            'Instagram Connected! 🎉',
            res.data?.message || 'Your Instagram Account has been connected successfully.'
          );
        } else if (res.cancelled) {
          // User dismissed
        } else {
          Alert.alert('Meta Connection Failed', res.error || 'Failed to complete Instagram onboarding with Meta.');
        }
      }
    } catch (err: any) {
      console.error('[Meta Onboarding Error]:', err);
      Alert.alert('Connection Error', err?.message || 'An unexpected error occurred during onboarding.');
    } finally {
      setIsMetaConnecting(false);
    }
  };

  const userKey = user?.id || user?.email || 'anon';

  const { data: profileData, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['userProfile', userKey],
    queryFn: () => authApi.getProfile(),
    retry: 1,
    staleTime: 5000,
  });

  const { data: clientStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['clientStats', userKey],
    queryFn: () => statsApi.getClientStats(),
    retry: 1,
    staleTime: 5000,
  });

  const onRefresh = () => {
    refetchProfile();
    refetchStats();
  };

  const client = profileData?.client || user?.client;

  const connectorsList: ChannelConnectorItem[] = [
    // ══════════════════ 1. CHANNELS (Messaging & Social Media Logos) ══════════════════
    {
      id: 'whatsapp',
      name: 'WhatsApp Business API',
      category: 'Messaging Channel',
      type: 'channel',
      description: 'Official Meta Cloud API for 24/7 AI auto-replies, broadcasts & CRM sync',
      icon: <WhatsAppLogo size={44} />,
      color: '#25D366',
      isConnected: !isChannelComingSoon('whatsapp') && Boolean(
        (client?.whatsapp_phone_number_id || client?.whatsapp_config?.phone_number_id || client?.whatsapp_access_token) &&
        client?.whatsapp_enabled !== false
      ),
      isSvg: true,
      details: isChannelComingSoon('whatsapp')
        ? 'Coming Soon'
        : (client?.phone_number || client?.whatsapp_phone_number_id || client?.whatsapp_config?.display_phone_number)
        ? `Phone: ${client?.phone_number || client?.whatsapp_phone_number_id || client?.whatsapp_config?.display_phone_number}`
        : (client?.whatsapp_access_token ? 'Credentials Configured' : 'Connect WhatsApp Cloud API'),
    },
    {
      id: 'instagram',
      name: 'Instagram Direct DM',
      category: 'Social Channel',
      type: 'channel',
      description: 'Auto-reply to Story mentions, DMs & Lead generation automation',
      icon: <InstagramLogo size={44} />,
      color: '#E4405F',
      isConnected: !isChannelComingSoon('instagram') && Boolean(
        client?.instagram_enabled &&
        (client?.instagram_config?.page_id || client?.instagram_config?.access_token || client?.instagram_config?.username || client?.instagram_enabled)
      ),
      isSvg: true,
      details: isChannelComingSoon('instagram')
        ? 'Coming Soon'
        : client?.instagram_config?.username
        ? `@${client.instagram_config.username}`
        : (client?.instagram_enabled ? 'Active Meta Graph Sync' : 'Connect Instagram Account'),
    },
    {
      id: 'facebook',
      name: 'Facebook Messenger',
      category: 'Social Channel',
      type: 'channel',
      description: 'Auto-respond to Page messages, Lead Ads & customer inquiries',
      icon: <FacebookLogo size={44} />,
      color: '#1877F2',
      isConnected: !isChannelComingSoon('facebook') && Boolean(
        client?.facebook_enabled &&
        (client?.facebook_config?.page_id || client?.facebook_config?.access_token || client?.facebook_config?.page_name || client?.facebook_enabled)
      ),
      isSvg: true,
      details: isChannelComingSoon('facebook')
        ? 'Coming Soon'
        : client?.facebook_config?.page_name
        ? client.facebook_config.page_name
        : (client?.facebook_enabled ? 'Facebook Page Connected' : 'Connect Facebook Page'),
    },
    {
      id: 'youtube',
      name: 'YouTube Channel API',
      category: 'Video & Media Channel',
      type: 'channel',
      description: 'Auto AI replies to channel comments, video lead tracking & analytics',
      icon: <YouTubeLogo size={44} />,
      color: '#FF0000',
      isConnected: !isChannelComingSoon('youtube') && Boolean(
        client?.youtube_enabled &&
        (client?.youtube_config?.channel_id || client?.youtube_enabled)
      ),
      isSvg: true,
      details: isChannelComingSoon('youtube')
        ? 'Coming Soon'
        : client?.youtube_config?.channel_title
        ? client.youtube_config.channel_title
        : (client?.youtube_enabled ? 'Channel Analytics Active' : 'Connect YouTube Channel'),
    },

    // ══════════════════ 2. CONNECTORS (Email & Cloud Integration Logos) ══════════════════
    {
      id: 'gmail',
      name: 'Gmail & Google Workspace',
      category: 'Email Connector',
      type: 'connector',
      description: 'AI Email Auto-responder, Lead extraction & Smart Inbox sync',
      icon: <GmailLogo size={44} />,
      color: '#EA4335',
      isConnected: !isChannelComingSoon('gmail') && Boolean(
        client?.gmail_enabled &&
        (client?.gmail_config?.email || client?.gmail_config?.access_token || client?.gmail_enabled)
      ),
      isSvg: true,
      details: isChannelComingSoon('gmail')
        ? 'Coming Soon'
        : client?.gmail_config?.email
        ? client.gmail_config.email
        : (client?.gmail_enabled ? 'OAuth Account Connected' : 'Google Workspace OAuth'),
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook 365',
      category: 'Email & Workspace',
      type: 'connector',
      description: 'Corporate Email integration & Teams communication assistant',
      icon: <OutlookLogo size={44} />,
      color: '#0078D4',
      isConnected: !isChannelComingSoon('outlook') && Boolean(
        client?.outlook_enabled &&
        (client?.outlook_config?.email || client?.outlook_config?.access_token || client?.outlook_enabled)
      ),
      isSvg: true,
      details: isChannelComingSoon('outlook')
        ? 'Coming Soon'
        : client?.outlook_config?.email
        ? client.outlook_config.email
        : (client?.outlook_enabled ? 'Microsoft Graph Connected' : 'Connect 365 Account'),
    },
    {
      id: 'google_calendar',
      name: 'Google Calendar',
      category: 'Scheduling Connector',
      type: 'connector',
      description: 'Auto-book meetings, demo appointments & sync CRM schedules',
      icon: <GoogleCalendarLogo size={44} />,
      color: '#4285F4',
      isConnected: !isChannelComingSoon('google_calendar') && Boolean(client?.google_calendar_enabled),
      isSvg: true,
      details: isChannelComingSoon('google_calendar')
        ? 'Coming Soon'
        : (client?.google_calendar_enabled ? 'Calendar Sync Active' : 'Connect Google Calendar'),
    },
    {
      id: 'google_sheets',
      name: 'Google Sheets Export',
      category: 'Data Export Connector',
      type: 'connector',
      description: 'Real-time Lead export to Google Sheets & auto row appending',
      icon: <GoogleSheetsLogo size={44} />,
      color: '#34A853',
      isConnected: !isChannelComingSoon('google_sheets') && Boolean(client?.google_sheets_enabled),
      isSvg: true,
      details: isChannelComingSoon('google_sheets')
        ? 'Coming Soon'
        : (client?.google_sheets_enabled ? 'Live Spreadsheet Sync' : 'Connect Google Sheets'),
    },
    {
      id: 'google_docs',
      name: 'Google Docs & Slides',
      category: 'Document Generator',
      type: 'connector',
      description: 'Auto-generate AI Proposals, Pitch decks & Sales summaries',
      icon: <GoogleDocsLogo size={44} />,
      color: '#4285F4',
      isConnected: !isChannelComingSoon('google_docs') && Boolean(client?.google_docs_enabled || client?.google_slides_enabled),
      isSvg: true,
      details: isChannelComingSoon('google_docs')
        ? 'Coming Soon'
        : ((client?.google_docs_enabled || client?.google_slides_enabled) ? 'Docs Generator Active' : 'Connect Google Docs'),
    },
    {
      id: 'onedrive',
      name: 'OneDrive Cloud Storage',
      category: 'Cloud Storage Connector',
      type: 'connector',
      description: 'Cloud document indexing for Knowledge Base AI training',
      icon: <OneDriveLogo size={44} />,
      color: '#0078D4',
      isConnected: !isChannelComingSoon('onedrive') && Boolean(client?.onedrive_enabled),
      isSvg: true,
      details: isChannelComingSoon('onedrive')
        ? 'Coming Soon'
        : (client?.onedrive_enabled ? 'OneDrive Sync Active' : 'Connect OneDrive'),
    },

    // ══════════════════ 3. FEATURES (Platform Modules & AI Capabilities Logos) ══════════════════
    {
      id: 'team_dashboard',
      name: 'Team Workspace & Members',
      category: 'Platform Feature',
      type: 'feature',
      description: 'Manage active team agents, supervisors, roles & permissions',
      icon: <TeamWorkspaceLogo size={44} />,
      color: '#8B5CF6',
      isConnected: !isChannelComingSoon('team_dashboard'),
      isSvg: true,
      details: isChannelComingSoon('team_dashboard') ? 'Coming Soon' : 'Active Team Workspace',
      route: '/more',
    },
    {
      id: 'quotation_engine',
      name: 'Quotations & Estimates',
      category: 'Sales Feature',
      type: 'feature',
      description: 'Create, track & send digital price quotes to leads',
      icon: <QuotationsLogo size={44} />,
      color: '#3B82F6',
      isConnected: !isChannelComingSoon('quotation_engine'),
      isSvg: true,
      details: isChannelComingSoon('quotation_engine') ? 'Coming Soon' : 'Active Sales Quotations',
      route: '/sales/quotations',
    },
    {
      id: 'invoice_system',
      name: 'GST Invoices & Billing',
      category: 'Finance Feature',
      type: 'feature',
      description: 'Generate compliant GST invoices, receipts & track payments',
      icon: <GSTInvoicesLogo size={44} />,
      color: '#10B981',
      isConnected: !isChannelComingSoon('invoice_system'),
      isSvg: true,
      details: isChannelComingSoon('invoice_system') ? 'Coming Soon' : 'Active Billing Engine',
      route: '/sales/invoices',
    },
    {
      id: 'voice_video_calling',
      name: 'Voice & Video Calling (WebRTC)',
      category: 'Communication Feature',
      type: 'feature',
      description: 'Crystal-clear in-app HD Voice & Video calls with customers',
      icon: <VoiceVideoLogo size={44} />,
      color: '#EC4899',
      isConnected: !isChannelComingSoon('voice_video_calling'),
      isSvg: true,
      details: isChannelComingSoon('voice_video_calling') ? 'Coming Soon' : 'Active WebRTC Calling Engine',
    },
    {
      id: 'auto_reply_engine',
      name: 'AI Auto Reply Bot Engine',
      category: 'AI Feature',
      type: 'feature',
      description: 'Automated AI response bot, RAG knowledge answers & workflows',
      icon: <AutoReplyBotLogo size={44} />,
      color: '#059669',
      isConnected: !isChannelComingSoon('auto_reply_engine'),
      isSvg: true,
      details: isChannelComingSoon('auto_reply_engine') ? 'Coming Soon' : 'Active RAG & Flow Engine',
      route: '/workflows',
    },
    {
      id: 'zoho_crm_pipeline',
      name: 'Zoho CRM & Pipeline Sync',
      category: 'CRM Feature',
      type: 'feature',
      description: 'Bi-directional Contact sync, lead status & pipeline tracking',
      icon: <ZohoLogo size={44} />,
      color: '#E03131',
      isConnected: !isChannelComingSoon('zoho_crm_pipeline') && Boolean(client?.zoho_enabled),
      isSvg: true,
      details: isChannelComingSoon('zoho_crm_pipeline')
        ? 'Coming Soon'
        : (client?.zoho_enabled ? 'Zoho CRM Active' : 'Connect Zoho Account'),
      route: '/crm',
    },
    {
      id: 'razorpay_gateway',
      name: 'Razorpay Payment Gateway',
      category: 'Payments Feature',
      type: 'feature',
      description: 'Accept UPI, Cards, NetBanking payments & instant wallet recharges',
      icon: <RazorpayLogo size={44} />,
      color: '#0078D4',
      isConnected: !isChannelComingSoon('razorpay_gateway') && Boolean((client?.settings as any)?.razorpay_key_id || client?.assigned_plan),
      isSvg: true,
      details: isChannelComingSoon('razorpay_gateway')
        ? 'Coming Soon'
        : ((client?.settings as any)?.razorpay_key_id ? 'Active Payment Gateway' : 'Ready to Connect'),
      route: '/sales/wallet',
    },
    {
      id: 'ecommerce_catalog',
      name: 'E-Commerce Product Catalog',
      category: 'Catalog Feature',
      type: 'feature',
      description: 'Manage products, inventory, prices & send catalog in chat',
      icon: <EcommerceCatalogLogo size={44} />,
      color: '#F59E0B',
      isConnected: !isChannelComingSoon('ecommerce_catalog'),
      isSvg: true,
      details: isChannelComingSoon('ecommerce_catalog') ? 'Coming Soon' : 'Active Product Catalog',
      route: '/sales/products',
    },
    {
      id: 'proposal_builder',
      name: 'Proposal Builder Generator',
      category: 'AI Sales Feature',
      type: 'feature',
      description: 'AI-assisted client proposal generation & interactive pitch decks',
      icon: <ProposalBuilderLogo size={44} />,
      color: '#6366F1',
      isConnected: !isChannelComingSoon('proposal_builder'),
      isSvg: true,
      details: isChannelComingSoon('proposal_builder') ? 'Coming Soon' : 'Active Proposal Generator',
    },
    {
      id: 'google_news_radar',
      name: 'Google News AI Market Radar',
      category: 'AI Market Feature',
      type: 'feature',
      description: 'Real-time industry news feed, competitor tracking & AI summaries',
      icon: <GoogleNewsLogo size={44} />,
      color: '#4285F4',
      isConnected: !isChannelComingSoon('google_news_radar') && Boolean(client?.google_news_enabled ?? true),
      isSvg: true,
      details: isChannelComingSoon('google_news_radar') ? 'Coming Soon' : 'Live RSS & AI Intelligence Feed',
    },
  ];

  const channelsList = connectorsList.filter(c => c.type === 'channel');
  const connectorsOnlyList = connectorsList.filter(c => c.type === 'connector');
  const featuresOnlyList = connectorsList.filter(c => c.type === 'feature');

  // Available (non-coming-soon) lists strictly excluding Coming Soon items
  const availableChannels = channelsList.filter(c => !isChannelComingSoon(c.id));
  const availableConnectors = connectorsOnlyList.filter(c => !isChannelComingSoon(c.id));
  const availableFeatures = featuresOnlyList.filter(c => !isChannelComingSoon(c.id));
  const totalAvailableCount = availableChannels.length + availableConnectors.length + availableFeatures.length;

  const channelsCount = availableChannels.length;
  const connectedChannelsCount = channelsList.filter(c => c.isConnected).length;

  const connectorsCount = availableConnectors.length;
  const connectedConnectorsCount = connectorsOnlyList.filter(c => c.isConnected).length;

  const featuresCount = availableFeatures.length;
  const connectedFeaturesCount = featuresOnlyList.filter(c => c.isConnected).length;

  const connectedCount = connectorsList.filter(c => c.isConnected).length;

  const channelsSummaryText = availableChannels.length > 0
    ? availableChannels.map(c => c.name.split(' ')[0]).join(', ')
    : 'Omnichannel Messaging Hub';

  const connectorsSummaryText = availableConnectors.length > 0
    ? availableConnectors.slice(0, 4).map(c => c.name.split(' ')[0]).join(', ')
    : 'Google Workspace, 365, Zoho & Cloud';

  const featuresSummaryText = availableFeatures.length > 0
    ? availableFeatures.slice(0, 4).map(f => f.name.split(' ')[0]).join(', ')
    : 'Workflows, CRM, Billing & AI Automation';

  const isDedicatedMode = activeFilter === 'CHANNELS' || activeFilter === 'CONNECTORS' || activeFilter === 'FEATURES';

  const filterTabs = [
    { id: 'ALL', label: 'All', count: totalAvailableCount, icon: <Layers size={14} /> },
    { id: 'CHANNELS', label: 'Channels', count: channelsCount, icon: <Share2 size={14} /> },
    { id: 'CONNECTORS', label: 'Connectors', count: connectorsCount, icon: <Database size={14} /> },
    { id: 'FEATURES', label: 'Features', count: featuresCount, icon: <Sparkles size={14} /> },
    { id: 'ACTIVE', label: 'Active', count: connectedCount, icon: <CheckCircle2 size={14} /> },
  ];

  const getFilteredItems = (): ChannelConnectorItem[] => {
    switch (activeFilter) {
      case 'CHANNELS':
        return channelsList;
      case 'CONNECTORS':
        return connectorsOnlyList;
      case 'FEATURES':
        return featuresOnlyList;
      case 'ACTIVE':
        return connectorsList.filter(item => item.isConnected);
      case 'ALL':
      default:
        return connectorsList;
    }
  };

  const filteredItems = getFilteredItems();

  const handleItemPress = (item: ChannelConnectorItem) => {
    if (isChannelComingSoon(item.id)) {
      Alert.alert(
        `${item.name} (Coming Soon)`,
        `This integration is currently deactivated by the platform administrator for your workspace and will be available in an upcoming update.\n\nActive channels available today: WhatsApp Business API, Instagram Direct, and Facebook Messenger.`,
        [{ text: 'Understood', style: 'default' }]
      );
      return;
    }

    if (item.route) {
      router.push(item.route as any);
      return;
    }

    setSelectedItem(item);
    setShowToken(false);
    setMetaTab('AUTO');

    if (item.id === 'whatsapp') {
      setFormFields({
        displayName: client?.business_name || client?.company_name || user?.name || '',
        wabaId: client?.whatsapp_waba_id || (client?.whatsapp_config?.waba_id as string) || '',
        phoneId: client?.whatsapp_phone_number_id || (client?.whatsapp_config?.phone_number_id as string) || '',
        phoneNumber: client?.phone_number || client?.phone || '',
        portfolioId: (client?.settings as any)?.business_portfolio_id || client?.meta_portfolio_name || '',
        accessToken: client?.whatsapp_access_token || '',
      });
    } else if (item.id === 'instagram') {
      setFormFields({
        displayName: client?.instagram_config?.page_name || client?.business_name || '',
        instagramHandle: client?.instagram_config?.username || client?.instagram_config?.instagram_handle || '',
        pageId: client?.instagram_config?.page_id || client?.instagram_config?.ig_user_id || '',
        accessToken: client?.instagram_config?.access_token || '',
      });
    } else if (item.id === 'facebook') {
      setFormFields({
        displayName: client?.facebook_config?.page_name || client?.business_name || '',
        pageId: client?.facebook_config?.page_id || '',
        accessToken: client?.facebook_config?.access_token || '',
      });
    } else if (item.id === 'youtube') {
      setFormFields({
        channelTitle: client?.youtube_config?.channel_title || '',
        channelId: client?.youtube_config?.channel_id || '',
        status: client?.youtube_enabled ? 'Connected & Active' : 'Ready to Connect',
      });
    } else if (item.id === 'gmail') {
      setFormFields({
        emailAccount: client?.gmail_config?.email || client?.email || '',
        oauthStatus: client?.gmail_enabled ? 'Active Google Workspace OAuth2' : 'Not Connected',
        scopes: client?.gmail_enabled ? 'Mail.Read, Mail.Send, Leads.Extract' : 'None',
      });
    } else if (item.id === 'outlook') {
      setFormFields({
        emailAccount: client?.outlook_config?.email || client?.email || '',
        oauthStatus: client?.outlook_enabled ? 'Active Microsoft Graph v1.0' : 'Not Connected',
        tenantId: client?.outlook_config?.tenant_id || '',
      });
    } else if (item.id === 'razorpay_gateway') {
      setFormFields({
        keyId: (client?.settings as any)?.razorpay_key_id || '',
        keySecret: (client?.settings as any)?.razorpay_key_secret ? '••••••••••••••••••••••••' : '',
        webhookStatus: (client?.settings as any)?.razorpay_key_id ? 'Active & Verified' : 'Ready to Connect',
      });
    } else {
      setFormFields({
        displayName: client?.business_name || client?.company_name || user?.name || '',
        accountEmail: client?.email || user?.email || '',
        status: item.isConnected ? 'Connected & Synced' : 'Ready to Connect',
      });
    }

    setIsModalOpen(true);
  };

  const handleSaveConfiguration = async () => {
    if (!selectedItem) return;
    setIsSaving(true);
    try {
      let payload: Record<string, any> = {};

      if (selectedItem.id === 'whatsapp') {
        payload = {
          business_name: formFields.displayName || client?.business_name,
          phone_number: formFields.phoneNumber,
          whatsapp_waba_id: formFields.wabaId,
          whatsapp_phone_number_id: formFields.phoneId,
          whatsapp_enabled: Boolean(formFields.phoneId || formFields.wabaId || formFields.phoneNumber),
          ...(formFields.accessToken ? { whatsapp_access_token: formFields.accessToken } : {}),
          ...(formFields.portfolioId ? { meta_portfolio_name: formFields.portfolioId } : {}),
          settings: {
            ...(client?.settings || {}),
            ...(formFields.portfolioId ? { business_portfolio_id: formFields.portfolioId } : {}),
            api_version: 'v20.0',
            last_connected: new Date().toISOString(),
          }
        };
      } else if (selectedItem.id === 'instagram') {
        payload = {
          instagram_enabled: Boolean(formFields.pageId || formFields.accessToken || formFields.instagramHandle || formFields.displayName),
          instagram_config: {
            ...(client?.instagram_config || {}),
            page_name: formFields.displayName,
            username: formFields.instagramHandle ? formFields.instagramHandle.replace(/^@/, '') : '',
            page_id: formFields.pageId,
            ...(formFields.accessToken ? { access_token: formFields.accessToken } : {}),
          }
        };
      } else if (selectedItem.id === 'facebook') {
        payload = {
          facebook_enabled: Boolean(formFields.pageId || formFields.accessToken || formFields.displayName),
          facebook_config: {
            ...(client?.facebook_config || {}),
            page_name: formFields.displayName,
            page_id: formFields.pageId,
            ...(formFields.accessToken ? { access_token: formFields.accessToken } : {}),
          }
        };
      } else if (selectedItem.id === 'gmail') {
        payload = {
          gmail_enabled: Boolean(formFields.emailAccount),
          gmail_config: {
            ...(client?.gmail_config || {}),
            email: formFields.emailAccount,
          }
        };
      } else if (selectedItem.id === 'outlook') {
        payload = {
          outlook_enabled: Boolean(formFields.emailAccount),
          outlook_config: {
            ...(client?.outlook_config || {}),
            email: formFields.emailAccount,
            tenant_id: formFields.tenantId,
          }
        };
      } else {
        payload = {
          business_name: formFields.displayName || client?.business_name,
        };
      }

      await authApi.updateProfile(payload);
      await refetchProfile();
      await refetchStats();

      setIsModalOpen(false);
      Alert.alert(
        'Configuration Saved',
        `${selectedItem.name} credentials updated successfully in database.`
      );
    } catch (err: any) {
      console.error('[Connector Save Error]:', err);
      Alert.alert('Save Failed', err?.message || 'Failed to update channel credentials. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderConnectorCard = (item: ChannelConnectorItem) => {
    const isComingSoon = isChannelComingSoon(item.id);

    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.7}
        onPress={() => handleItemPress(item)}
      >
        <Card style={styles.connectorCard}>
          <View style={styles.connectorHeader}>
            <View style={[
              styles.iconContainer, 
              item.isSvg ? { backgroundColor: 'transparent' } : { backgroundColor: item.color + '15' }
            ]}>
              {item.icon}
            </View>

            <View style={styles.connectorTitleBox}>
              <View style={styles.nameBadgeRow}>
                <Text variant="h3" weight="bold" color={colors.textPrimary} style={styles.connectorName}>
                  {item.name}
                </Text>
              </View>
              <Text variant="caption" color={colors.textMuted}>
                {item.category}
              </Text>
            </View>

            <Badge 
              label={isComingSoon ? 'COMING SOON' : item.isConnected ? 'ACTIVE' : 'READY'} 
              variant={isComingSoon ? 'warning' : item.isConnected ? 'success' : 'info'} 
            />
          </View>

          <Text variant="caption" color={colors.textMuted} style={styles.connectorDesc}>
            {item.description}
          </Text>

          <View style={[styles.connectorFooter, { borderTopColor: colors.border }]}>
            <Text 
              variant="caption" 
              weight="medium" 
              color={isComingSoon ? '#F59E0B' : item.isConnected ? colors.primary : colors.textMuted}
            >
              {isComingSoon ? 'Deactivated by Admin' : item.details}
            </Text>
            <View style={styles.statusRow}>
              {isComingSoon ? (
                <Lock size={16} color="#F59E0B" />
              ) : item.route ? (
                <ChevronRight size={18} color={colors.primary} />
              ) : item.isConnected ? (
                <CheckCircle2 size={16} color={colors.success} />
              ) : (
                <Zap size={16} color={colors.textMuted} />
              )}
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const headerTitle = 
    activeFilter === 'CHANNELS' 
      ? 'Channels' 
      : activeFilter === 'CONNECTORS' 
      ? 'Connectors' 
      : activeFilter === 'FEATURES' 
      ? 'Features' 
      : 'Connectors & Channels';

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header 
        title={headerTitle} 
        showBack={true} 
        onBackPress={() => {
          useConnectorsTabStore.getState().setTargetTab('ALL');
          router.replace('/(app)/home' as any);
        }}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 72 + insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={profileLoading || statsLoading} onRefresh={onRefresh} />
        }
      >
        {/* Summary Header Card */}
        <Card variant="default" style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryTextGroup}>
              <Text variant="h2" weight="bold" color={colors.textPrimary}>
                {activeFilter === 'CHANNELS'
                  ? `${connectedChannelsCount} / ${channelsCount} Connected`
                  : activeFilter === 'CONNECTORS'
                  ? `${connectedConnectorsCount} / ${connectorsCount} Active`
                  : activeFilter === 'FEATURES'
                  ? `${connectedFeaturesCount} / ${featuresCount} Enabled`
                  : `${connectedCount} / ${totalAvailableCount} Active`}
              </Text>
              <Text variant="caption" color={colors.textMuted} style={styles.summarySubtitle}>
                {activeFilter === 'CHANNELS'
                  ? channelsSummaryText
                  : activeFilter === 'CONNECTORS'
                  ? connectorsSummaryText
                  : activeFilter === 'FEATURES'
                  ? featuresSummaryText
                  : 'Channels, cloud connectors & platform features'}
              </Text>
            </View>
            <View 
              style={[
                styles.badgePill, 
                { 
                  backgroundColor: activeFilter === 'FEATURES' 
                    ? `${colors.secondary || '#8B5CF6'}15` 
                    : activeFilter === 'CONNECTORS'
                    ? `${colors.primary}15`
                    : `${colors.success || '#10B981'}15` 
                }
              ]}
            >
              {activeFilter === 'FEATURES' ? (
                <Sparkles size={16} color={colors.secondary || '#8B5CF6'} />
              ) : (
                <CheckCircle2 size={16} color={activeFilter === 'CONNECTORS' ? colors.primary : (colors.success || '#10B981')} />
              )}
              <Text 
                variant="caption" 
                weight="bold" 
                color={
                  activeFilter === 'FEATURES' 
                    ? (colors.secondary || '#8B5CF6') 
                    : activeFilter === 'CONNECTORS'
                    ? colors.primary
                    : (colors.success || '#10B981')
                }
              >
                {activeFilter === 'CHANNELS' 
                  ? 'Channels Ready' 
                  : activeFilter === 'CONNECTORS' 
                  ? 'Cloud Synced' 
                  : activeFilter === 'FEATURES' 
                  ? 'Platform Active' 
                  : 'System Ready'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Top Category Filter Pills — ONLY shown in general hub mode, HIDDEN in dedicated view */}
        {!isDedicatedMode && (
          <View style={styles.filterSection}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.filterScroll}
            >
              {filterTabs.map((tab) => {
                const isActive = activeFilter === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    activeOpacity={0.8}
                    style={[
                      styles.filterPill,
                      {
                        backgroundColor: isActive ? colors.primary : colors.surface,
                        borderColor: isActive ? colors.primary : colors.border,
                      }
                    ]}
                    onPress={() => setActiveFilter(tab.id as FilterTab)}
                  >
                    {React.cloneElement(tab.icon as React.ReactElement, {
                      color: isActive ? colors.textInverse : colors.textSecondary
                    })}
                    <Text 
                      variant="caption" 
                      weight="bold" 
                      color={isActive ? colors.textInverse : colors.textPrimary}
                    >
                      {tab.label} ({tab.count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Dedicated or Categorized List View */}
        {activeFilter === 'CHANNELS' ? (
          <>
            <Text variant="label" style={styles.sectionLabel}>
              COMMUNICATION CHANNELS ({channelsCount})
            </Text>
            {channelsList.map(renderConnectorCard)}
          </>
        ) : activeFilter === 'CONNECTORS' ? (
          <>
            <Text variant="label" style={styles.sectionLabel}>
              CONNECTORS & INTEGRATIONS ({connectorsCount})
            </Text>
            {connectorsOnlyList.map(renderConnectorCard)}
          </>
        ) : activeFilter === 'FEATURES' ? (
          <>
            <Text variant="label" style={styles.sectionLabel}>
              PLATFORM FEATURES & MODULES ({featuresCount})
            </Text>
            {featuresOnlyList.map(renderConnectorCard)}
          </>
        ) : activeFilter === 'ACTIVE' ? (
          <>
            <Text variant="label" style={styles.sectionLabel}>
              ACTIVE ITEMS ({connectedCount})
            </Text>
            {connectorsList.filter(i => i.isConnected).map(renderConnectorCard)}
          </>
        ) : (
          <>
            {/* Section 1: Channels */}
            <Text variant="label" style={styles.sectionLabel}>
              CHANNELS ({channelsCount})
            </Text>
            {channelsList.map(renderConnectorCard)}

            {/* Section 2: Connectors */}
            <Text variant="label" style={styles.sectionLabel}>
              CONNECTORS & INTEGRATIONS ({connectorsCount})
            </Text>
            {connectorsOnlyList.map(renderConnectorCard)}

            {/* Section 3: Features */}
            <Text variant="label" style={styles.sectionLabel}>
              PLATFORM FEATURES ({featuresCount})
            </Text>
            {featuresOnlyList.map(renderConnectorCard)}
          </>
        )}
      </ScrollView>

      {/* Configuration Sheet Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                {selectedItem?.icon ? (
                  <View style={[styles.modalIconBox, selectedItem.isSvg ? { backgroundColor: 'transparent' } : { backgroundColor: selectedItem.color + '15' }]}>
                    {selectedItem.icon}
                  </View>
                ) : null}
                <View style={styles.modalHeaderTitleGroup}>
                  <Text variant="h2" weight="bold" color={colors.textPrimary}>
                    {selectedItem?.name || 'Channel'}
                  </Text>
                  <Text variant="caption" color={colors.textMuted}>
                    {isMetaChannel ? 'Official Meta Business Integration' : `Manage ${selectedItem?.name} settings`}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.closeBtn, { backgroundColor: colors.background }]}
                onPress={() => setIsModalOpen(false)}
              >
                <X size={18} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Segmented Mode Tab Switcher for Meta Channels */}
            {isMetaChannel && (
              <View style={[styles.metaTabWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <TouchableOpacity
                  style={[
                    styles.metaTabButton,
                    metaTab === 'AUTO' && [styles.metaTabButtonActive, { backgroundColor: colors.surface }]
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setMetaTab('AUTO')}
                >
                  <Zap size={14} color={metaTab === 'AUTO' ? (selectedItem?.color || colors.primary) : colors.textMuted} />
                  <Text
                    variant="caption"
                    weight="bold"
                    color={metaTab === 'AUTO' ? colors.textPrimary : colors.textMuted}
                  >
                    1-Click Auto
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.metaTabButton,
                    metaTab === 'MANUAL' && [styles.metaTabButtonActive, { backgroundColor: colors.surface }]
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setMetaTab('MANUAL')}
                >
                  <Text
                    variant="caption"
                    weight="bold"
                    color={metaTab === 'MANUAL' ? colors.textPrimary : colors.textMuted}
                  >
                    Manual Setup
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {isMetaChannel && metaTab === 'AUTO' ? (
              /* ── 1-CLICK AUTO HERO VIEW ── */
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                {/* Status Capsule */}
                <View 
                  style={[
                    styles.sleekStatusCapsule, 
                    { 
                      backgroundColor: selectedItem?.isConnected ? '#10B98112' : '#F59E0B12',
                      borderColor: selectedItem?.isConnected ? '#10B98135' : '#F59E0B35',
                    }
                  ]}
                >
                  <View style={[styles.statusDot, { backgroundColor: selectedItem?.isConnected ? '#10B981' : '#F59E0B' }]} />
                  <Text variant="caption" weight="bold" style={{ color: selectedItem?.isConnected ? '#059669' : '#D97706', fontSize: 12 }}>
                    {selectedItem?.isConnected ? 'Active & Live Sync' : 'Ready for Connection'}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <Text variant="caption" color={colors.textMuted} style={{ fontSize: 11 }}>
                    {selectedItem?.id === 'whatsapp' ? 'Cloud API v20.0' : 'Graph API v20.0'}
                  </Text>
                </View>

                {/* Hero Card */}
                <View 
                  style={[
                    styles.heroCard, 
                    { 
                      borderColor: `${selectedItem?.color || colors.primary}30`,
                      backgroundColor: `${selectedItem?.color || colors.primary}06`,
                    }
                  ]}
                >
                  <View style={styles.heroBadgeRow}>
                    <View style={[styles.recommendedPill, { backgroundColor: `${selectedItem?.color || colors.primary}18` }]}>
                      <Sparkles size={11} color={selectedItem?.color || colors.primary} />
                      <Text style={[styles.recommendedPillText, { color: selectedItem?.color || colors.primary }]}>
                        RECOMMENDED
                      </Text>
                    </View>
                    <Text variant="caption" color={colors.textMuted} style={{ fontSize: 11, fontWeight: '600' }}>
                      ⚡ FAST SETUP
                    </Text>
                  </View>

                  <View style={styles.heroCardTopRow}>
                    <View style={[styles.heroIconCircle, { backgroundColor: `${selectedItem?.color || colors.primary}18` }]}>
                      {selectedItem?.id === 'whatsapp' ? (
                        <WhatsAppLogo size={34} />
                      ) : selectedItem?.id === 'instagram' ? (
                        <InstagramLogo size={34} />
                      ) : (
                        <FacebookLogo size={34} />
                      )}
                    </View>
                    <View style={styles.heroTitleGroup}>
                      <Text variant="body" weight="bold" color={colors.textPrimary} style={{ fontSize: 16 }}>
                        {selectedItem?.id === 'whatsapp'
                          ? 'WhatsApp Cloud API'
                          : selectedItem?.id === 'instagram'
                          ? 'Instagram Direct DM'
                          : 'Facebook Messenger'}
                      </Text>
                      <Text variant="caption" color={colors.textMuted}>
                        Official Meta Platform Integration
                      </Text>
                    </View>
                  </View>

                  <View style={styles.benefitContainer}>
                    <View style={styles.benefitRow}>
                      <CheckCircle2 size={15} color={selectedItem?.color || colors.primary} />
                      <Text variant="caption" color={colors.textPrimary} style={styles.benefitText}>
                        1-Click login with your Facebook / Meta Business
                      </Text>
                    </View>
                    <View style={styles.benefitRow}>
                      <CheckCircle2 size={15} color={selectedItem?.color || colors.primary} />
                      <Text variant="caption" color={colors.textPrimary} style={styles.benefitText}>
                        Automatic webhook verification & token renewal
                      </Text>
                    </View>
                    <View style={styles.benefitRow}>
                      <CheckCircle2 size={15} color={selectedItem?.color || colors.primary} />
                      <Text variant="caption" color={colors.textPrimary} style={styles.benefitText}>
                        AI auto-replies, broadcasts & live CRM sync
                      </Text>
                    </View>
                  </View>

                  {selectedItem?.isConnected && (
                    <View style={[styles.linkedDetailsBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Text variant="caption" weight="bold" color={colors.textMuted} style={{ fontSize: 10, textTransform: 'uppercase' }}>
                        Connected Account
                      </Text>
                      <Text variant="body" weight="bold" color={colors.textPrimary} style={{ marginTop: 2 }}>
                        {selectedItem.details}
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.heroCtaBtn,
                      { backgroundColor: selectedItem?.color || colors.primary },
                      isMetaConnecting && { opacity: 0.75 }
                    ]}
                    activeOpacity={0.88}
                    disabled={isMetaConnecting}
                    onPress={() => handleMetaOnboarding(selectedItem.id as 'whatsapp' | 'facebook' | 'instagram')}
                  >
                    {isMetaConnecting ? (
                      <View style={styles.btnRow}>
                        <ActivityIndicator size="small" color="#FFF" />
                        <Text variant="body" weight="bold" color="#FFF" style={{ marginLeft: 8 }}>
                          Connecting with Meta...
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.btnRow}>
                        <Zap size={18} color="#FFF" />
                        <Text variant="body" weight="bold" color="#FFF" style={{ marginLeft: 6 }}>
                          {selectedItem?.isConnected
                            ? `Re-connect / Switch Account`
                            : `Connect with Meta (1-Click)`}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={styles.switchModeFooter}
                  activeOpacity={0.7}
                  onPress={() => setMetaTab('MANUAL')}
                >
                  <Text variant="caption" color={colors.textMuted}>
                    Prefer manual setup? <Text variant="caption" weight="bold" color={colors.primary}>Enter tokens & IDs →</Text>
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              /* ── MANUAL SETUP VIEW (For Manual tab or non-Meta channels) ── */
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                {/* Status Capsule */}
                <View 
                  style={[
                    styles.sleekStatusCapsule, 
                    { 
                      backgroundColor: selectedItem?.isConnected ? '#10B98112' : '#F59E0B12',
                      borderColor: selectedItem?.isConnected ? '#10B98135' : '#F59E0B35',
                    }
                  ]}
                >
                  <View style={[styles.statusDot, { backgroundColor: selectedItem?.isConnected ? '#10B981' : '#F59E0B' }]} />
                  <Text variant="caption" weight="bold" style={{ color: selectedItem?.isConnected ? '#059669' : '#D97706', fontSize: 12 }}>
                    {selectedItem?.isConnected ? 'Active & Live Sync' : 'Ready for Setup'}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <Text variant="caption" color={colors.textMuted} style={{ fontSize: 11 }}>
                    {selectedItem?.id === 'whatsapp' ? 'Cloud API v20.0' : selectedItem?.type === 'channel' ? 'Meta Graph v20.0' : 'Enterprise REST'}
                  </Text>
                </View>

                <Text variant="label" color={colors.textMuted} style={styles.formSectionLabel}>
                  BUSINESS INFORMATION & API TOKENS
                </Text>

                {selectedItem?.id === 'whatsapp' ? (
                  <>
                    <View style={styles.inputGroup}>
                      <Text variant="caption" weight="bold" color={colors.textPrimary} style={styles.inputLabel}>
                        Display Name *
                      </Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                        value={formFields.displayName}
                        onChangeText={(val) => setFormFields(prev => ({ ...prev, displayName: val }))}
                        placeholder="Enter Business Display Name"
                        placeholderTextColor={colors.textMuted}
                      />
                    </View>

                    <View style={styles.inputRow}>
                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text variant="caption" weight="bold" color={colors.textPrimary} style={styles.inputLabel}>
                          WABA ID *
                        </Text>
                        <TextInput
                          style={[styles.textInput, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                          value={formFields.wabaId}
                          onChangeText={(val) => setFormFields(prev => ({ ...prev, wabaId: val }))}
                          placeholder="Account ID"
                          placeholderTextColor={colors.textMuted}
                        />
                      </View>

                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text variant="caption" weight="bold" color={colors.textPrimary} style={styles.inputLabel}>
                          Phone ID *
                        </Text>
                        <TextInput
                          style={[styles.textInput, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                          value={formFields.phoneId}
                          onChangeText={(val) => setFormFields(prev => ({ ...prev, phoneId: val }))}
                          placeholder="Phone Number ID"
                          placeholderTextColor={colors.textMuted}
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text variant="caption" weight="bold" color={colors.textPrimary} style={styles.inputLabel}>
                        WhatsApp Business Phone Number *
                      </Text>
                      <View style={styles.phoneInputRow}>
                        <View style={[styles.countryCodeBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                          <Text variant="caption" weight="bold" color={colors.textPrimary}>
                            IN +91
                          </Text>
                        </View>
                        <TextInput
                          style={[styles.textInput, { flex: 1, backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                          value={formFields.phoneNumber}
                          onChangeText={(val) => setFormFields(prev => ({ ...prev, phoneNumber: val }))}
                          placeholder="Phone Number"
                          placeholderTextColor={colors.textMuted}
                          keyboardType="phone-pad"
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text variant="caption" weight="bold" color={colors.textPrimary} style={styles.inputLabel}>
                        System User Access Token *
                      </Text>
                      <View style={styles.passwordInputWrapper}>
                        <TextInput
                          style={[styles.textInput, styles.passwordInput, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                          value={formFields.accessToken}
                          onChangeText={(val) => setFormFields(prev => ({ ...prev, accessToken: val }))}
                          secureTextEntry={!showToken}
                          placeholder="Meta Access Token"
                          placeholderTextColor={colors.textMuted}
                        />
                        <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowToken(!showToken)}>
                          {showToken ? <EyeOff size={18} color={colors.textMuted} /> : <Eye size={18} color={colors.textMuted} />}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                ) : (
                  Object.keys(formFields).map((key) => (
                    <View key={key} style={styles.inputGroup}>
                      <Text variant="caption" weight="bold" color={colors.textPrimary} style={styles.inputLabel}>
                        {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                      </Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                        value={formFields[key]}
                        onChangeText={(val) => setFormFields(prev => ({ ...prev, [key]: val }))}
                        placeholder={`Enter ${key}`}
                        placeholderTextColor={colors.textMuted}
                      />
                    </View>
                  ))
                )}

                {/* Metadata Diagnostics Box */}
                <Card variant="outlined" style={styles.metaCard}>
                  <Text variant="caption" weight="bold" color={colors.textPrimary} style={{ marginBottom: 6 }}>
                    METADATA INFO & DIAGNOSTICS
                  </Text>
                  <View style={styles.metaGrid}>
                    <View style={styles.metaItem}>
                      <Text variant="caption" color={colors.textMuted}>Last Synced</Text>
                      <Text variant="caption" weight="bold" color={colors.textPrimary}>
                        {selectedItem?.isConnected ? 'Live Active Sync' : 'Not Connected'}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text variant="caption" color={colors.textMuted}>API Engine</Text>
                      <Text variant="caption" weight="bold" style={{ color: selectedItem?.color || colors.success }}>
                        {selectedItem?.id === 'whatsapp' ? 'v20.0 Cloud API' : selectedItem?.type === 'channel' ? 'Meta Graph v20.0' : 'Enterprise REST'}
                      </Text>
                    </View>
                  </View>
                </Card>
              </ScrollView>
            )}

            {/* Modal Actions Footer */}
            {isMetaChannel && metaTab === 'AUTO' ? (
              <View style={[styles.modalFooterSingle, { borderTopColor: colors.border }]}>
                <TouchableOpacity 
                  style={[styles.closeModalBtn, { backgroundColor: colors.background, borderColor: colors.border }]} 
                  onPress={() => setIsModalOpen(false)}
                >
                  <Text variant="body" weight="bold" color={colors.textPrimary}>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
                <TouchableOpacity 
                  style={[styles.cancelBtn, { borderColor: colors.border }]} 
                  onPress={() => setIsModalOpen(false)}
                >
                  <Text variant="body" weight="medium" color={colors.textPrimary}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.saveBtn, { backgroundColor: selectedItem?.color || colors.success }]}
                  disabled={isSaving}
                  onPress={handleSaveConfiguration}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <>
                      <Check size={18} color="#FFF" />
                      <Text variant="body" weight="bold" color="#FFF">
                        Update Configuration
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    marginBottom: 16,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryTextGroup: {
    flex: 1,
  },
  summarySubtitle: {
    marginTop: 2,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterScroll: {
    gap: 8,
    paddingRight: 10,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  sectionLabel: {
    marginTop: 6,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  connectorCard: {
    marginBottom: 12,
    padding: 16,
  },
  connectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  connectorTitleBox: {
    flex: 1,
  },
  brandBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  connectorName: {
    fontSize: 15,
  },
  connectorDesc: {
    lineHeight: 18,
    marginBottom: 12,
  },
  connectorFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  noteCard: {
    marginTop: 10,
    padding: 14,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  modalIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  modalHeaderTitleGroup: {
    flex: 1,
    marginRight: 12,
  },
  modalBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    paddingBottom: 20,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  formSectionLabel: {
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    marginBottom: 6,
  },
  textInput: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  countryCodeBox: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passwordInputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 44,
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    padding: 6,
  },
  metaCard: {
    marginTop: 10,
    padding: 14,
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    gap: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  metaTabWrapper: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    gap: 4,
  },
  metaTabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
    gap: 6,
  },
  metaTabButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  recommendedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  recommendedPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sleekStatusCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 12,
  },
  heroCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  heroIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitleGroup: {
    flex: 1,
  },
  benefitContainer: {
    gap: 10,
    marginBottom: 18,
    paddingHorizontal: 2,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  linkedDetailsBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  heroCtaBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchModeFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  modalFooterSingle: {
    paddingTop: 14,
    borderTopWidth: 1,
  },
  closeModalBtn: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
