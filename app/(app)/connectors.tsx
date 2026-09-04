import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { useTheme } from '../../src/theme';
import { authApi } from '../../src/api/auth';
import { statsApi } from '../../src/api/stats';
import { useSessionStore } from '../../src/stores/sessionStore';
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
  Check
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
  const { colors, spacing, radius } = useTheme();
  const user = useSessionStore((state) => state.user);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');

  const [selectedItem, setSelectedItem] = useState<ChannelConnectorItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formFields, setFormFields] = useState<Record<string, string>>({});

  const { data: profileData, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => authApi.getProfile(),
  });

  const { data: clientStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['clientStats'],
    queryFn: () => statsApi.getClientStats(),
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
      isConnected: Boolean(client?.whatsapp_phone_number_id || client?.whatsapp_access_token || client?.automation_enabled),
      isSvg: true,
      details: client?.whatsapp_phone_number_id ? `Phone ID: ${client.whatsapp_phone_number_id}` : 'Official Meta Cloud API Connected',
    },
    {
      id: 'instagram',
      name: 'Instagram Direct DM',
      category: 'Social Channel',
      type: 'channel',
      description: 'Auto-reply to Story mentions, DMs & Lead generation automation',
      icon: <InstagramLogo size={44} />,
      color: '#E4405F',
      isConnected: Boolean(client?.instagram_enabled),
      isSvg: true,
      details: client?.instagram_enabled ? 'Active Meta Graph Sync' : 'Connect Meta Page Account',
    },
    {
      id: 'facebook',
      name: 'Facebook Messenger',
      category: 'Social Channel',
      type: 'channel',
      description: 'Auto-respond to Page messages, Lead Ads & customer inquiries',
      icon: <FacebookLogo size={44} />,
      color: '#1877F2',
      isConnected: Boolean(client?.facebook_enabled),
      isSvg: true,
      details: client?.facebook_enabled ? 'Facebook Page Connected' : 'Connect Facebook Page',
    },
    {
      id: 'youtube',
      name: 'YouTube Channel API',
      category: 'Video & Media Channel',
      type: 'channel',
      description: 'Auto AI replies to channel comments, video lead tracking & analytics',
      icon: <YouTubeLogo size={44} />,
      color: '#FF0000',
      isConnected: Boolean(client?.youtube_enabled),
      isSvg: true,
      details: client?.youtube_enabled ? 'Channel Analytics Active' : 'Connect YouTube Channel',
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
      isConnected: Boolean(client?.gmail_enabled),
      isSvg: true,
      details: client?.gmail_enabled ? 'OAuth Account Connected' : 'Google Workspace OAuth',
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook 365',
      category: 'Email & Workspace',
      type: 'connector',
      description: 'Corporate Email integration & Teams communication assistant',
      icon: <OutlookLogo size={44} />,
      color: '#0078D4',
      isConnected: Boolean(client?.outlook_enabled),
      isSvg: true,
      details: client?.outlook_enabled ? 'Microsoft Graph Connected' : 'Connect 365 Account',
    },
    {
      id: 'google_calendar',
      name: 'Google Calendar',
      category: 'Scheduling Connector',
      type: 'connector',
      description: 'Auto-book meetings, demo appointments & sync CRM schedules',
      icon: <GoogleCalendarLogo size={44} />,
      color: '#4285F4',
      isConnected: Boolean(client?.google_calendar_enabled),
      isSvg: true,
      details: client?.google_calendar_enabled ? 'Calendar Sync Active' : 'Connect Google Calendar',
    },
    {
      id: 'google_sheets',
      name: 'Google Sheets Export',
      category: 'Data Export Connector',
      type: 'connector',
      description: 'Real-time Lead export to Google Sheets & auto row appending',
      icon: <GoogleSheetsLogo size={44} />,
      color: '#34A853',
      isConnected: Boolean(client?.google_sheets_enabled),
      isSvg: true,
      details: client?.google_sheets_enabled ? 'Live Spreadsheet Sync' : 'Connect Google Sheets',
    },
    {
      id: 'google_docs',
      name: 'Google Docs & Slides',
      category: 'Document Generator',
      type: 'connector',
      description: 'Auto-generate AI Proposals, Pitch decks & Sales summaries',
      icon: <GoogleDocsLogo size={44} />,
      color: '#4285F4',
      isConnected: Boolean(client?.google_docs_enabled || client?.google_slides_enabled),
      isSvg: true,
      details: (client?.google_docs_enabled || client?.google_slides_enabled) ? 'Docs Generator Active' : 'Connect Google Docs',
    },
    {
      id: 'onedrive',
      name: 'OneDrive Cloud Storage',
      category: 'Cloud Storage Connector',
      type: 'connector',
      description: 'Cloud document indexing for Knowledge Base AI training',
      icon: <OneDriveLogo size={44} />,
      color: '#0078D4',
      isConnected: Boolean(client?.onedrive_enabled),
      isSvg: true,
      details: client?.onedrive_enabled ? 'OneDrive Sync Active' : 'Connect OneDrive',
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
      isConnected: true,
      isSvg: true,
      details: 'Active Team Workspace',
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
      isConnected: true,
      isSvg: true,
      details: 'Active Sales Quotations',
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
      isConnected: true,
      isSvg: true,
      details: 'Active Billing Engine',
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
      isConnected: true,
      isSvg: true,
      details: 'Active WebRTC Calling Engine',
    },
    {
      id: 'auto_reply_engine',
      name: 'AI Auto Reply Bot Engine',
      category: 'AI Feature',
      type: 'feature',
      description: 'Automated AI response bot, RAG knowledge answers & workflows',
      icon: <AutoReplyBotLogo size={44} />,
      color: '#059669',
      isConnected: true,
      isSvg: true,
      details: 'Active RAG & Flow Engine',
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
      isConnected: Boolean(client?.zoho_enabled),
      isSvg: true,
      details: client?.zoho_enabled ? 'Zoho CRM Active' : 'Connect Zoho Account',
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
      isConnected: true,
      isSvg: true,
      details: 'Active Payment Gateway',
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
      isConnected: true,
      isSvg: true,
      details: 'Active Product Catalog',
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
      isConnected: true,
      isSvg: true,
      details: 'Active Proposal Generator',
    },
    {
      id: 'google_news_radar',
      name: 'Google News AI Market Radar',
      category: 'AI Market Feature',
      type: 'feature',
      description: 'Real-time industry news feed, competitor tracking & AI summaries',
      icon: <GoogleNewsLogo size={44} />,
      color: '#4285F4',
      isConnected: Boolean(client?.google_news_enabled ?? true),
      isSvg: true,
      details: 'Live RSS & AI Intelligence Feed',
    },
  ];

  const channelsCount = connectorsList.filter(c => c.type === 'channel').length;
  const connectorsCount = connectorsList.filter(c => c.type === 'connector').length;
  const featuresCount = connectorsList.filter(c => c.type === 'feature').length;
  const connectedCount = connectorsList.filter(c => c.isConnected).length;

  const filterTabs = [
    { id: 'ALL', label: 'All', count: connectorsList.length, icon: <Layers size={14} /> },
    { id: 'CHANNELS', label: 'Channels', count: channelsCount, icon: <Share2 size={14} /> },
    { id: 'CONNECTORS', label: 'Connectors', count: connectorsCount, icon: <Database size={14} /> },
    { id: 'FEATURES', label: 'Features', count: featuresCount, icon: <Sparkles size={14} /> },
    { id: 'ACTIVE', label: 'Active', count: connectedCount, icon: <CheckCircle2 size={14} /> },
  ];

  const getFilteredItems = (): ChannelConnectorItem[] => {
    switch (activeFilter) {
      case 'CHANNELS':
        return connectorsList.filter(item => item.type === 'channel');
      case 'CONNECTORS':
        return connectorsList.filter(item => item.type === 'connector');
      case 'FEATURES':
        return connectorsList.filter(item => item.type === 'feature');
      case 'ACTIVE':
        return connectorsList.filter(item => item.isConnected);
      case 'ALL':
      default:
        return connectorsList;
    }
  };

  const filteredItems = getFilteredItems();

  const handleItemPress = (item: ChannelConnectorItem) => {
    if (item.route) {
      router.push(item.route as any);
      return;
    }

    setSelectedItem(item);
    setShowToken(false);

    if (item.id === 'whatsapp') {
      setFormFields({
        displayName: client?.business_name || client?.company_name || 'Unified Web Options Pvt Ltd',
        wabaId: '947532301669617',
        phoneId: client?.whatsapp_phone_number_id || '1144355915438778',
        phoneNumber: client?.phone || '8358990909',
        portfolioId: '847294871904729',
        accessToken: client?.whatsapp_access_token || 'EAAGkn02834710928374901823901823901823908129038',
      });
    } else if (item.id === 'instagram') {
      setFormFields({
        displayName: client?.business_name || 'UwoConnect Instagram',
        instagramHandle: '@uwoconnect_official',
        pageId: '1092837492019',
        accessToken: 'EAAGkn02834710928374901823901823901823908129038',
      });
    } else if (item.id === 'facebook') {
      setFormFields({
        displayName: client?.business_name || 'UwoConnect Official Page',
        pageId: '84920192837',
        accessToken: 'EAAGkn02834710928374901823901823901823908129038',
      });
    } else if (item.id === 'gmail') {
      setFormFields({
        emailAccount: client?.email || 'support@uwoconnect.com',
        oauthStatus: 'Active Google Workspace OAuth2',
        scopes: 'Mail.Read, Mail.Send, Leads.Extract',
      });
    } else if (item.id === 'outlook') {
      setFormFields({
        emailAccount: client?.email || 'support@uwoconnect.com',
        oauthStatus: 'Active Microsoft Graph v1.0',
        tenantId: '92837492-3847-2910-8273-918273645192',
      });
    } else if (item.id === 'razorpay_gateway') {
      setFormFields({
        keyId: 'rzp_live_839201928374',
        keySecret: '••••••••••••••••••••••••',
        webhookStatus: 'Active & Verified',
      });
    } else {
      setFormFields({
        displayName: client?.business_name || client?.company_name || 'Workspace Account',
        accountEmail: client?.email || 'support@uwoconnect.com',
        status: item.isConnected ? 'Connected & Synced' : 'Ready to Connect',
      });
    }

    setIsModalOpen(true);
  };

  const renderConnectorCard = (item: ChannelConnectorItem) => (
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
            label={item.isConnected ? 'ACTIVE' : 'READY'} 
            variant={item.isConnected ? 'success' : 'warning'} 
          />
        </View>

        <Text variant="caption" color={colors.textMuted} style={styles.connectorDesc}>
          {item.description}
        </Text>

        <View style={[styles.connectorFooter, { borderTopColor: colors.border }]}>
          <Text variant="caption" weight="medium" color={item.isConnected ? colors.primary : colors.textMuted}>
            {item.details}
          </Text>
          <View style={styles.statusRow}>
            {item.route ? (
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

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header title="Connectors & Channels" showBack onBackPress={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
                {connectedCount} / {connectorsList.length} Active
              </Text>
              <Text variant="caption" color={colors.textMuted} style={styles.summarySubtitle}>
                Channels, cloud connectors & platform features
              </Text>
            </View>
            <View style={[styles.badgePill, { backgroundColor: colors.success + '15' }]}>
              <CheckCircle2 size={16} color={colors.success} />
              <Text variant="caption" weight="bold" color={colors.success}>
                System Ready
              </Text>
            </View>
          </View>
        </Card>

        {/* Top Category Filter Pills */}
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

        {/* Categorized List View */}
        {activeFilter === 'ALL' ? (
          <>
            {/* Section 1: Channels */}
            <Text variant="label" style={styles.sectionLabel}>
              CHANNELS ({channelsCount})
            </Text>
            {connectorsList.filter(i => i.type === 'channel').map(renderConnectorCard)}

            {/* Section 2: Connectors */}
            <Text variant="label" style={styles.sectionLabel}>
              CONNECTORS & INTEGRATIONS ({connectorsCount})
            </Text>
            {connectorsList.filter(i => i.type === 'connector').map(renderConnectorCard)}

            {/* Section 3: Features */}
            <Text variant="label" style={styles.sectionLabel}>
              PLATFORM FEATURES ({featuresCount})
            </Text>
            {connectorsList.filter(i => i.type === 'feature').map(renderConnectorCard)}
          </>
        ) : (
          <>
            <Text variant="label" style={styles.sectionLabel}>
              {activeFilter} ITEMS ({filteredItems.length})
            </Text>
            {filteredItems.length > 0 ? (
              filteredItems.map(renderConnectorCard)
            ) : (
              <Card variant="outlined" style={styles.emptyCard}>
                <Text variant="caption" color={colors.textMuted}>
                  No items found in this category filter.
                </Text>
              </Card>
            )}
          </>
        )}

        {/* Security Note */}
        <Card variant="outlined" style={styles.noteCard}>
          <View style={styles.noteHeader}>
            <ShieldCheck size={18} color={colors.primary} />
            <Text variant="label" weight="bold" color={colors.primary}>
              Enterprise Security & Encryption
            </Text>
          </View>
          <Text variant="caption" color={colors.textMuted}>
            All channel OAuth tokens & API credentials are encrypted with AES-256 and stored securely in dedicated tenant vaults.
          </Text>
        </Card>
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
                    Configure {selectedItem?.name || 'Channel'}
                  </Text>
                  <Text variant="caption" color={colors.textMuted}>
                    Connect and manage your {selectedItem?.name} API settings.
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

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              {/* Connection Status Box */}
              <View 
                style={[
                  styles.statusBox, 
                  { 
                    backgroundColor: selectedItem?.isConnected 
                      ? (selectedItem.color ? selectedItem.color + '15' : colors.success + '15') 
                      : colors.warning + '15',
                    borderColor: selectedItem?.isConnected ? (selectedItem.color ? selectedItem.color + '30' : colors.success + '30') : colors.warning + '30',
                    borderWidth: 1,
                  }
                ]}
              >
                <View 
                  style={[
                    styles.statusDot, 
                    { backgroundColor: selectedItem?.isConnected ? (selectedItem.color || colors.success) : colors.warning }
                  ]} 
                />
                <View style={{ flex: 1 }}>
                  <Text 
                    variant="caption" 
                    weight="bold" 
                    style={{ color: selectedItem?.isConnected ? (selectedItem.color || colors.success) : colors.warning }}
                  >
                    CONNECTION STATUS
                  </Text>
                  <Text variant="body" weight="bold" color={colors.textPrimary}>
                    {selectedItem?.isConnected ? 'Connected & Live Sync' : 'Ready for Setup'}
                  </Text>
                </View>
                <View 
                  style={[
                    styles.modalBadgePill, 
                    { backgroundColor: selectedItem?.isConnected ? (selectedItem.color ? selectedItem.color + '20' : colors.success + '20') : colors.warning + '20' }
                  ]}
                >
                  <Text 
                    variant="caption" 
                    weight="bold" 
                    style={{ color: selectedItem?.isConnected ? (selectedItem.color || colors.success) : colors.warning, fontSize: 11 }}
                  >
                    {selectedItem?.isConnected ? 'v20.0 API' : 'READY'}
                  </Text>
                </View>
              </View>

              {/* Form Section */}
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
                    <Text variant="caption" color={colors.textMuted}>Last Connected</Text>
                    <Text variant="caption" weight="bold" color={colors.textPrimary}>Aug 20, 2026, 10:46 AM</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text variant="caption" color={colors.textMuted}>API Version</Text>
                    <Text variant="caption" weight="bold" style={{ color: selectedItem?.color || colors.success }}>v20.0 Cloud API</Text>
                  </View>
                </View>
              </Card>
            </ScrollView>

            {/* Modal Actions Footer */}
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
                onPress={() => {
                  setIsSaving(true);
                  setTimeout(() => {
                    setIsSaving(false);
                    setIsModalOpen(false);
                    Alert.alert('Configuration Updated', `${selectedItem?.name || 'Channel'} configuration saved!`);
                  }, 500);
                }}
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
});
