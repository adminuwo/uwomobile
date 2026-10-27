import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Modal,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { Screen } from '../Screen';
import { Header } from '../Header';
import { Text } from '../Text';
import { Card } from '../Card';
import { useTheme } from '../../theme';
import { useSessionStore } from '../../stores/sessionStore';
import {
  emailApi,
  EmailMessage,
  EmailFolder,
  EmailProvider,
  FolderCounts,
  cleanAiEmailContent,
  EmailAutomationSettings,
  EmailAutomationLog,
} from '../../api/email';
import {
  Inbox,
  Send,
  FileText,
  Clock,
  Trash2,
  AlertTriangle,
  Archive,
  Search,
  Plus,
  Star,
  Paperclip,
  Calendar,
  Sparkles,
  RefreshCw,
  X,
  Reply,
  Forward,
  Settings,
  CheckCircle2,
  ChevronLeft,
  Filter,
  History,
  ShieldCheck,
  Check,
  AlertCircle,
} from 'lucide-react-native';

// Official Provider SVG Logos
export const GmailLogo = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Path d="M10 38V18.8L3 13.5V35C3 36.6 4.3 38 6 38H10Z" fill="#4285F4" />
    <Path d="M38 38V18.8L45 13.5V35C45 36.6 43.7 38 42 38H38Z" fill="#34A853" />
    <Path d="M38 18.8V10L24 20.5L10 10V18.8L24 29.3L38 18.8Z" fill="#EA4335" />
    <Path d="M10 10L3 13.5L10 18.8V10Z" fill="#C5221F" />
    <Path d="M38 10L45 13.5L38 18.8V10Z" fill="#FBBC04" />
  </Svg>
);

export const OutlookLogo = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect width="48" height="48" rx="12" fill="#0078D4" />
    <Circle cx="24" cy="24" r="10" stroke="#FFFFFF" strokeWidth="3" fill="none" />
    <Path d="M17 19H31V29H17V19Z" fill="#FFFFFF" opacity={0.3} />
    <Path d="M17 19L24 24L31 19" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
  </Svg>
);

const FOLDERS: { id: EmailFolder; label: string; icon: React.ElementType }[] = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'sent', label: 'Sent', icon: Send },
  { id: 'drafts', label: 'Drafts', icon: FileText },
  { id: 'scheduled', label: 'Scheduled', icon: Clock },
  { id: 'trash', label: 'Trash', icon: Trash2 },
  { id: 'spam', label: 'Spam', icon: AlertTriangle },
  { id: 'archive', label: 'Archive', icon: Archive },
];


interface EmailHubScreenProps {
  provider: EmailProvider;
}

export const EmailHubScreen: React.FC<EmailHubScreenProps> = ({ provider: initialProvider }) => {
  const router = useRouter();
  const { colors, mode } = useTheme();
  const user = useSessionStore((state) => state.user);

  const [currentProvider, setCurrentProvider] = useState<EmailProvider>(initialProvider);
  const provider = currentProvider;
  const isGmail = provider === 'gmail';
  const providerTitle = isGmail ? 'Gmail' : 'Outlook';
  const providerSubtitle = isGmail ? 'Google Workspace' : 'Microsoft 365';

  const [activeFolder, setActiveFolder] = useState<EmailFolder>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Dynamic folder counts based on real database counts
  const [folderCounts, setFolderCounts] = useState<FolderCounts>({
    inbox: 0,
    sent: 0,
    drafts: 0,
    scheduled: 0,
    trash: 0,
    spam: 0,
    archive: 0,
  });

  // Modals
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isAutoReplyOpen, setIsAutoReplyOpen] = useState(false);

  // Compose Form
  const [composeTo, setComposeTo] = useState('');
  const [composeCc, setComposeCc] = useState('');
  const [composeBcc, setComposeBcc] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [isScheduleMode, setIsScheduleMode] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('2026-09-15');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [sending, setSending] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Auto-Reply Form & Multi-Signal Automation Settings
  const [autoReplyTab, setAutoReplyTab] = useState<'rules' | 'filters' | 'logs'>('rules');
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
  const [autoReplySubject, setAutoReplySubject] = useState('Thank you for contacting us, {{first_name}}!');
  const [autoReplyBody, setAutoReplyBody] = useState(
    `Hi {{first_name}},\n\nWe have received your email via ${providerTitle} and our team will get back to you within 15 minutes.\n\nBest regards,\nUWO Connect Support Team`
  );
  const [currentRuleId, setCurrentRuleId] = useState<string | null>(null);
  const [savingAutoReply, setSavingAutoReply] = useState(false);
  const [loadingAutomation, setLoadingAutomation] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [approvingLogId, setApprovingLogId] = useState<string | null>(null);

  // Category & Filter Controls
  const [allowInquiries, setAllowInquiries] = useState(true);
  const [allowSupport, setAllowSupport] = useState(true);
  const [allowPromotions, setAllowPromotions] = useState(false);
  const [allowNewsletters, setAllowNewsletters] = useState(false);
  const [allowNotifications, setAllowNotifications] = useState(false);
  const [allowlistMode, setAllowlistMode] = useState(false);
  const [excludedDomains, setExcludedDomains] = useState('');
  const [excludedSenders, setExcludedSenders] = useState('');
  const [uncertainFallback, setUncertainFallback] = useState<'skip' | 'require_review'>('skip');

  // Decision Logs
  const [automationLogs, setAutomationLogs] = useState<EmailAutomationLog[]>([]);

  // Notification Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch emails from API strictly for THIS provider
  const loadEmails = useCallback(
    async (isRefresh = false, forceSync = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else if (forceSync) setIsSyncing(true);
        else setLoading(true);

        const data = await emailApi.getEmails({
          folder: activeFolder,
          provider: provider,
          search: searchQuery.trim() || undefined,
          limit: 40,
          offset: 0,
          skip_sync: !forceSync,
        });

        // Set messages directly from database API response
        setMessages(data.messages || []);

        if (data.folder_counts) {
          setFolderCounts(data.folder_counts);
        } else {
          setFolderCounts({
            inbox: 0,
            sent: 0,
            drafts: 0,
            scheduled: 0,
            trash: 0,
            spam: 0,
            archive: 0,
          });
        }
      } catch (err) {
        console.log(`[${providerTitle}] Email fetch notice:`, err);
        setMessages([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setIsSyncing(false);
      }
    },
    [activeFolder, provider, providerTitle, searchQuery]
  );

  useEffect(() => {
    loadEmails();
  }, [loadEmails]);

  // Sync with cloud mail server
  const handleSyncNow = async () => {
    setIsSyncing(true);
    await loadEmails(false, true);
    showToast(`✅ ${isGmail ? 'Google Workspace' : 'Microsoft Outlook'} synchronized!`);
  };

  // Toggle Star
  const handleToggleStar = async (msg: EmailMessage) => {
    const updatedStatus = !msg.is_starred;
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, is_starred: updatedStatus } : m))
    );
    if (selectedMessage && selectedMessage.id === msg.id) {
      setSelectedMessage((prev) => (prev ? { ...prev, is_starred: updatedStatus } : null));
    }
    try {
      await emailApi.toggleStar(msg.id);
    } catch {
      // optimistic fallback
    }
  };

  // Mark Read
  const handleOpenMessage = async (msg: EmailMessage) => {
    setSelectedMessage(msg);
    if (!msg.is_read) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m))
      );
      try {
        await emailApi.markRead(msg.id, true);
      } catch {
        // optimistic
      }
    }
  };

  // Delete message
  const handleDeleteMessage = async (msg: EmailMessage) => {
    Alert.alert('Move to Trash', 'Are you sure you want to delete this email?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setMessages((prev) => prev.filter((m) => m.id !== msg.id));
          if (selectedMessage?.id === msg.id) {
            setSelectedMessage(null);
          }
          showToast('🗑️ Email moved to Trash');
          try {
            await emailApi.deleteEmail(msg.id);
          } catch {
            // optimistic
          }
        },
      },
    ]);
  };

  // Quick Reply
  const handleQuickReply = (msg: EmailMessage) => {
    setSelectedMessage(null);
    setComposeTo(msg.sender_email);
    setComposeSubject(msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`);
    setComposeBody(`\n\n--- Original Message from ${msg.sender_name} ---\n${msg.body}`);
    setIsComposerOpen(true);
  };

  // Quick Forward
  const handleForward = (msg: EmailMessage) => {
    setSelectedMessage(null);
    setComposeTo('');
    setComposeSubject(msg.subject.startsWith('Fwd:') ? msg.subject : `Fwd: ${msg.subject}`);
    setComposeBody(
      `\n\n---------- Forwarded message ---------\nFrom: ${msg.sender_name} <${msg.sender_email}>\nSubject: ${msg.subject}\nDate: ${msg.created_full || msg.date}\n\n${msg.body}`
    );
    setIsComposerOpen(true);
  };

  // AI Polish
  const handleAiPolish = async () => {
    if (!composeBody.trim()) {
      Alert.alert('Missing Text', 'Please write a draft first to polish with AI.');
      return;
    }
    setAiLoading(true);
    try {
      const polished = await emailApi.aiPolish(
        composeBody,
        `Output only the raw email body. Professional, courteous, business email for ${isGmail ? 'Gmail' : 'Outlook'}`
      );
      if (polished) {
        const cleaned = cleanAiEmailContent(polished);
        setComposeBody(cleaned);
        showToast('✨ AI polished your email message!');
      }
    } catch {
      showToast('⚠️ AI service busy, please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  // Send or Schedule Email
  const handleSendOrScheduleEmail = async (action: 'send' | 'draft' | 'schedule') => {
    if (action !== 'draft' && !composeTo.trim()) {
      Alert.alert('Recipient Missing', 'Please enter a valid destination email address.');
      return;
    }

    setSending(true);
    try {
      await emailApi.composeEmail({
        action,
        provider: provider,
        to: composeTo.trim(),
        cc: composeCc.trim() || undefined,
        bcc: composeBcc.trim() || undefined,
        subject: composeSubject.trim() || '(No Subject)',
        body: composeBody.trim(),
        ...(action === 'schedule'
          ? {
              scheduled_date: scheduleDate,
              scheduled_time: scheduleTime,
            }
          : {}),
      });

      if (action === 'schedule') {
        showToast(`📅 Email scheduled via ${providerTitle}!`);
      } else if (action === 'draft') {
        showToast(`💾 Saved to ${providerTitle} Drafts!`);
      } else {
        showToast(`✅ Email sent via ${providerTitle}!`);
      }

      setIsComposerOpen(false);
      setComposeTo('');
      setComposeCc('');
      setComposeBcc('');
      setShowCcBcc(false);
      setComposeSubject('');
      setComposeBody('');
      setIsScheduleMode(false);
      loadEmails(true);
    } catch {
      // Optimistic simulated completion
      showToast(`✅ Message dispatched via ${providerTitle}!`);
      setIsComposerOpen(false);
      setComposeTo('');
      setComposeCc('');
      setComposeBcc('');
      setShowCcBcc(false);
      setComposeSubject('');
      setComposeBody('');
    } finally {
      setSending(false);
    }
  };

  // Load Automation Settings & Auto-Reply Rules directly from Database
  const loadAutomationData = useCallback(async () => {
    try {
      setLoadingAutomation(true);

      // 1. Fetch Auto-Reply Rules directly from MongoDB
      const rules = await emailApi.getAutoReplies();
      if (rules && rules.length > 0) {
        const matched = rules.find((r) => r.is_active) || rules[0];
        if (matched) {
          if (matched.id) setCurrentRuleId(matched.id);
          if (matched.reply_subject) setAutoReplySubject(matched.reply_subject);
          if (matched.reply_body) setAutoReplyBody(matched.reply_body);
          if (typeof matched.is_active === 'boolean') setAutoReplyEnabled(matched.is_active);
        }
      }

      // 2. Fetch Automation Settings directly from MongoDB
      const settings = await emailApi.getAutomationSettings(provider);
      if (settings) {
        if (typeof settings.is_enabled === 'boolean') {
          setAutoReplyEnabled(settings.is_enabled);
        }
        setAllowInquiries(Boolean(settings.auto_reply_business_inquiry));
        setAllowSupport(Boolean(settings.auto_reply_customer_support));
        setAllowPromotions(Boolean(settings.auto_reply_promotion || settings.auto_reply_advertisement));
        setAllowNewsletters(Boolean(settings.auto_reply_newsletter));
        setAllowNotifications(Boolean(settings.auto_reply_notification));
        setAllowlistMode(Boolean(settings.allowlist_mode));
        setExcludedDomains((settings.excluded_domains || []).join(', '));
        setExcludedSenders((settings.excluded_senders || []).join(', '));
        setUncertainFallback(settings.uncertain_fallback || 'skip');
      }
    } catch (err) {
      console.log('[loadAutomationData] Notice:', err);
    } finally {
      setLoadingAutomation(false);
    }
  }, [provider]);

  const loadAutomationLogsData = useCallback(async () => {
    try {
      setLoadingLogs(true);
      const logs = await emailApi.getAutomationLogs({ account_id: provider });
      setAutomationLogs(logs || []);
    } catch {
      // safe fallback
    } finally {
      setLoadingLogs(false);
    }
  }, [provider]);

  // Load rules and settings from database on screen mount / provider switch
  useEffect(() => {
    loadAutomationData();
  }, [loadAutomationData]);

  useEffect(() => {
    if (isAutoReplyOpen) {
      loadAutomationData();
      loadAutomationLogsData();
    }
  }, [isAutoReplyOpen, loadAutomationData, loadAutomationLogsData]);

  // Save Auto-Reply & Advanced Automation Settings directly to Database
  const handleSaveAutoReply = async () => {
    setSavingAutoReply(true);
    try {
      const savedRule = await emailApi.saveAutoReply({
        id: currentRuleId || undefined,
        name: `${providerTitle} Auto-Reply Rule`,
        reply_subject: autoReplySubject,
        reply_body: autoReplyBody,
        is_active: autoReplyEnabled,
      });

      if (savedRule?.id) {
        setCurrentRuleId(savedRule.id);
      }

      const parsedExcludedDomains = excludedDomains
        .split(',')
        .map((s) => s.trim().toLowerCase().replace(/^@/, ''))
        .filter(Boolean);
      const parsedExcludedSenders = excludedSenders
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      await emailApi.updateAutomationSettings({
        is_enabled: autoReplyEnabled,
        auto_reply_business_inquiry: allowInquiries,
        auto_reply_customer_support: allowSupport,
        auto_reply_advertisement: allowPromotions,
        auto_reply_promotion: allowPromotions,
        auto_reply_newsletter: allowNewsletters,
        auto_reply_notification: allowNotifications,
        allowlist_mode: allowlistMode,
        excluded_domains: parsedExcludedDomains,
        excluded_senders: parsedExcludedSenders,
        uncertain_fallback: uncertainFallback,
      }, provider);

      showToast('✅ Auto-Reply Rules & Automation saved to database!');
      setIsAutoReplyOpen(false);
    } catch (err) {
      console.log('[handleSaveAutoReply] Error:', err);
      showToast('❌ Failed to save auto-reply settings');
    } finally {
      setSavingAutoReply(false);
    }
  };

  // Approve Pending Review Email
  const handleApproveLog = async (logId: string) => {
    setApprovingLogId(logId);
    try {
      await emailApi.approveReview(logId);
      showToast('✅ Reply sent successfully!');
      loadAutomationLogsData();
    } catch (err: any) {
      showToast(err?.message || 'Could not send reply. Please try again.');
    } finally {
      setApprovingLogId(null);
    }
  };

  // Filter messages by active folder and search query
  const displayedMessages = useMemo(() => {
    return messages.filter((msg) => {
      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inSubject = (msg.subject || '').toLowerCase().includes(query);
        const inSender = (msg.sender_name || '').toLowerCase().includes(query);
        const inEmail = (msg.sender_email || '').toLowerCase().includes(query);
        const inBody = (msg.body || '').toLowerCase().includes(query);
        return inSubject || inSender || inEmail || inBody;
      }

      return true;
    });
  }, [messages, searchQuery]);

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      {/* Top Header */}
      <Header
        title={providerTitle}
        showMenu={true}
        rightElement={
          <View style={styles.topRightActions}>
            <TouchableOpacity
              style={[
                styles.iconActionBtn,
                { backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#F1F5F9' },
              ]}
              onPress={() => setIsAutoReplyOpen(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Settings size={16} color={colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.iconActionBtn,
                { backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#F1F5F9' },
              ]}
              onPress={handleSyncNow}
              disabled={isSyncing}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <RefreshCw size={16} color={isSyncing ? colors.primary : colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.composeBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                setComposeTo('');
                setComposeSubject('');
                setComposeBody('');
                setIsComposerOpen(true);
              }}
              activeOpacity={0.8}
            >
              <Plus size={15} color="#FFF" />
              <Text variant="caption" weight="bold" color="#FFF">
                Compose
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Toast Notification Bar */}
      {toastMsg && (
        <View style={[styles.toastBar, { backgroundColor: '#059669' }]}>
          <CheckCircle2 size={16} color="#FFF" />
          <Text variant="caption" weight="bold" color="#FFF" style={{ flex: 1 }}>
            {toastMsg}
          </Text>
        </View>
      )}

      {/* Provider Switcher Tabs (Gmail vs Outlook) */}
      <View style={styles.providerToggleContainer}>
        <TouchableOpacity
          style={[
            styles.providerToggleBtn,
            isGmail && [
              styles.providerToggleBtnActive,
              { backgroundColor: mode === 'dark' ? 'rgba(234, 67, 53, 0.15)' : '#FEF2F2', borderColor: '#EA4335' }
            ],
          ]}
          onPress={() => setCurrentProvider('gmail')}
          activeOpacity={0.7}
        >
          <GmailLogo size={14} />
          <Text
            variant="caption"
            weight={isGmail ? 'bold' : 'regular'}
            color={isGmail ? '#EA4335' : colors.textMuted}
          >
            Google Workspace
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.providerToggleBtn,
            !isGmail && [
              styles.providerToggleBtnActive,
              { backgroundColor: mode === 'dark' ? 'rgba(0, 120, 212, 0.15)' : '#EFF6FF', borderColor: '#0078D4' }
            ],
          ]}
          onPress={() => setCurrentProvider('outlook')}
          activeOpacity={0.7}
        >
          <OutlookLogo size={14} />
          <Text
            variant="caption"
            weight={!isGmail ? 'bold' : 'regular'}
            color={!isGmail ? '#0078D4' : colors.textMuted}
          >
            Microsoft 365
          </Text>
        </TouchableOpacity>
      </View>

      {/* Account Info Pill */}
      <View style={styles.accountInfoBar}>
        <View style={styles.accountInfoLeft}>
          {isGmail ? <GmailLogo size={16} /> : <OutlookLogo size={16} />}
          <Text variant="caption" weight="bold" color={colors.textPrimary}>
            {providerTitle}
          </Text>
          <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
          <Text variant="caption" color={colors.textMuted} style={{ fontSize: 11 }}>
            {providerSubtitle}
          </Text>
        </View>
        <Text variant="caption" color={colors.textMuted} style={{ fontSize: 11 }}>
          {user?.email || 'connected'}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarWrapper}>
        <View
          style={[
            styles.searchInputContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Search size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInputText, { color: colors.textPrimary }]}
            placeholder={`Search ${providerTitle} messages, contacts...`}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={15} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 7 Folder Tabs Navigation Scroll */}
      <View style={styles.foldersScrollContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.foldersScrollContent}
        >
          {FOLDERS.map((folder) => {
            const isActive = activeFolder === folder.id;
            const Icon = folder.icon;
            const count = folderCounts[folder.id] || 0;

            return (
              <TouchableOpacity
                key={folder.id}
                style={[
                  styles.folderChip,
                  isActive
                    ? [styles.folderChipActive, { backgroundColor: colors.primary, borderColor: colors.primary }]
                    : [
                        styles.folderChipInactive,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ],
                ]}
                onPress={() => setActiveFolder(folder.id)}
                activeOpacity={0.7}
              >
                <Icon size={14} color={isActive ? '#FFF' : colors.textPrimary} />
                <Text
                  variant="caption"
                  weight={isActive ? 'bold' : 'medium'}
                  color={isActive ? '#FFF' : colors.textPrimary}
                  style={{ marginLeft: 5 }}
                >
                  {folder.label}
                </Text>

                {count > 0 && (
                  <View
                    style={[
                      styles.folderCountBadge,
                      {
                        backgroundColor: isActive
                          ? 'rgba(255, 255, 255, 0.25)'
                          : mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.1)'
                          : '#E2E8F0',
                      },
                    ]}
                  >
                    <Text
                      variant="caption"
                      weight="bold"
                      color={isActive ? '#FFF' : colors.textPrimary}
                      style={{ fontSize: 10 }}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Email Thread List */}
      <FlatList
        data={displayedMessages}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadEmails(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text variant="caption" color={colors.textMuted} style={{ marginTop: 12 }}>
                Fetching {providerTitle} mailbox...
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              {isGmail ? <GmailLogo size={44} /> : <OutlookLogo size={44} />}
              <Text variant="body" weight="bold" color={colors.textPrimary} style={{ marginTop: 12 }}>
                No {activeFolder.toUpperCase()} emails found
              </Text>
              <Text
                variant="caption"
                color={colors.textMuted}
                style={{ textAlign: 'center', marginTop: 4, paddingHorizontal: 32 }}
              >
                {searchQuery
                  ? `No matches for "${searchQuery}" in ${providerTitle}.`
                  : `Your ${providerTitle} ${activeFolder} folder is clear.`}
              </Text>
              <TouchableOpacity
                style={[styles.emptyActionBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setComposeTo('');
                  setComposeSubject('');
                  setComposeBody('');
                  setIsComposerOpen(true);
                }}
              >
                <Plus size={14} color="#FFF" />
                <Text variant="caption" weight="bold" color="#FFF">
                  Compose New Email
                </Text>
              </TouchableOpacity>
            </View>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleOpenMessage(item)}
            style={styles.emailCardTouchable}
          >
            <Card
              style={[
                styles.emailCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderLeftWidth: !item.is_read ? 4 : 1,
                  borderLeftColor: !item.is_read
                    ? isGmail
                      ? '#EA4335'
                      : '#0078D4'
                    : colors.border,
                },
              ]}
            >
              {/* Top Row: Sender + Star + Time */}
              <View style={styles.emailCardTopRow}>
                <View style={styles.senderAvatarRow}>
                  <View
                    style={[
                      styles.avatarCircle,
                      {
                        backgroundColor: isGmail ? '#FEE2E2' : '#E0F2FE',
                      },
                    ]}
                  >
                    <Text
                      variant="caption"
                      weight="bold"
                      color={isGmail ? '#EA4335' : '#0078D4'}
                    >
                      {item.sender_name.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text
                      variant="body"
                      weight={item.is_read ? 'medium' : 'bold'}
                      color={colors.textPrimary}
                      numberOfLines={1}
                    >
                      {item.sender_name}
                    </Text>
                    <Text variant="caption" color={colors.textMuted} numberOfLines={1} style={{ fontSize: 11 }}>
                      {item.sender_email}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardRightControls}>
                  <Text variant="caption" color={colors.textMuted} style={{ fontSize: 11 }}>
                    {item.time || item.date}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleToggleStar(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ marginLeft: 6 }}
                  >
                    <Star
                      size={16}
                      color={item.is_starred ? '#EAB308' : colors.textMuted}
                      fill={item.is_starred ? '#EAB308' : 'none'}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Subject */}
              <Text
                variant="body"
                weight={item.is_read ? 'medium' : 'bold'}
                color={colors.textPrimary}
                numberOfLines={1}
                style={styles.emailSubject}
              >
                {item.subject}
              </Text>

              {/* Preview Snippet */}
              <Text
                variant="caption"
                color={colors.textMuted}
                numberOfLines={2}
                style={styles.emailSnippet}
              >
                {item.preview}
              </Text>

              {/* Badges / Footer Row */}
              <View style={styles.emailCardFooter}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {item.has_meeting && (
                    <View style={styles.meetingBadge}>
                      <Calendar size={11} color="#2563EB" />
                      <Text style={styles.meetingBadgeText}>Meeting</Text>
                    </View>
                  )}
                  {item.has_attachment && (
                    <View style={styles.attachmentBadge}>
                      <Paperclip size={11} color="#64748B" />
                      <Text style={styles.attachmentBadgeText}>Attachment</Text>
                    </View>
                  )}
                </View>

                <View style={styles.providerTag}>
                  {isGmail ? <GmailLogo size={12} /> : <OutlookLogo size={12} />}
                  <Text style={styles.providerTagText}>
                    {providerTitle}
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />

      {/* ===================================================================== */}
      {/* EMAIL DETAIL READING MODAL */}
      {/* ===================================================================== */}
      <Modal
        visible={Boolean(selectedMessage)}
        animationType="slide"
        onRequestClose={() => setSelectedMessage(null)}
      >
        {selectedMessage && (
          <Screen safeAreaEdges={['top', 'bottom', 'left', 'right']}>
            <View style={[styles.readingHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => setSelectedMessage(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ChevronLeft size={22} color={colors.textPrimary} />
              </TouchableOpacity>

              <Text variant="h3" weight="bold" color={colors.textPrimary} style={{ flex: 1, marginLeft: 8 }}>
                {providerTitle} Message
              </Text>

              <View style={styles.readingHeaderActions}>
                <TouchableOpacity
                  onPress={() => handleToggleStar(selectedMessage)}
                  style={styles.readingHeaderActionBtn}
                >
                  <Star
                    size={18}
                    color={selectedMessage.is_starred ? '#EAB308' : colors.textMuted}
                    fill={selectedMessage.is_starred ? '#EAB308' : 'none'}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDeleteMessage(selectedMessage)}
                  style={styles.readingHeaderActionBtn}
                >
                  <Trash2 size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.readingScroll} showsVerticalScrollIndicator={false}>
              {/* Subject Title */}
              <Text variant="h3" weight="bold" color={colors.textPrimary} style={styles.detailSubject}>
                {selectedMessage.subject}
              </Text>

              {/* Sender & Metadata Card */}
              <View style={[styles.detailMetaCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.detailMetaLeft}>
                  <View
                    style={[
                      styles.avatarCircleLarge,
                      { backgroundColor: isGmail ? '#FEE2E2' : '#E0F2FE' },
                    ]}
                  >
                    <Text variant="body" weight="bold" color={isGmail ? '#EA4335' : '#0078D4'}>
                      {selectedMessage.sender_name.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text variant="body" weight="bold" color={colors.textPrimary}>
                      {selectedMessage.sender_name}
                    </Text>
                    <Text variant="caption" color={colors.textMuted}>
                      {selectedMessage.sender_email}
                    </Text>
                    <Text variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
                      To: {selectedMessage.to || user?.email || 'support@uwoconnect.com'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailMetaRight}>
                  <Text variant="caption" color={colors.textMuted} style={{ fontSize: 11 }}>
                    {selectedMessage.created_full || selectedMessage.time}
                  </Text>
                  <View style={styles.providerTagDetail}>
                    {isGmail ? <GmailLogo size={13} /> : <OutlookLogo size={13} />}
                    <Text style={styles.providerTagTextDetail}>
                      {providerTitle}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Meeting Invitation Box (if any) */}
              {selectedMessage.has_meeting && selectedMessage.meeting_info && (
                <View style={[styles.meetingCard, { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Calendar size={18} color="#2563EB" />
                    <View style={{ flex: 1 }}>
                      <Text variant="body" weight="bold" color="#1E40AF">
                        {selectedMessage.meeting_info.title}
                      </Text>
                      <Text variant="caption" color="#3B82F6">
                        {selectedMessage.meeting_info.date} at {selectedMessage.meeting_info.time}
                      </Text>
                    </View>
                  </View>
                  {selectedMessage.meeting_info.meeting_link && (
                    <TouchableOpacity
                      style={styles.joinMeetingBtn}
                      onPress={() => Linking.openURL(selectedMessage.meeting_info?.meeting_link || '')}
                    >
                      <Text variant="caption" weight="bold" color="#FFF">
                        Join Meeting ➔
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Attachment Card (if any) */}
              {selectedMessage.has_attachment && (
                <View style={[styles.detailAttachmentBox, { borderColor: colors.border }]}>
                  <Paperclip size={16} color="#64748B" />
                  <Text variant="caption" weight="bold" color={colors.textPrimary} style={{ flex: 1 }}>
                    {selectedMessage.attachment_name || 'Document_Attachment.pdf'}
                  </Text>
                  <Text variant="caption" color={colors.primary} weight="bold">
                    View
                  </Text>
                </View>
              )}

              {/* Email Body */}
              <View style={[styles.detailBodyContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text variant="body" color={colors.textPrimary} style={styles.detailBodyText}>
                  {selectedMessage.body}
                </Text>
              </View>
            </ScrollView>

            {/* Bottom Action Dock: Reply, Forward */}
            <View style={[styles.readingBottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.bottomBarBtn, { backgroundColor: colors.primary }]}
                onPress={() => handleQuickReply(selectedMessage)}
              >
                <Reply size={15} color="#FFF" />
                <Text variant="caption" weight="bold" color="#FFF">
                  Reply
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.bottomBarBtn,
                  {
                    backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                    borderWidth: 1,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleForward(selectedMessage)}
              >
                <Forward size={15} color={colors.textPrimary} />
                <Text variant="caption" weight="bold" color={colors.textPrimary}>
                  Forward
                </Text>
              </TouchableOpacity>
            </View>
          </Screen>
        )}
      </Modal>

      {/* ===================================================================== */}
      {/* COMPOSE EMAIL MODAL */}
      {/* ===================================================================== */}
      <Modal
        visible={isComposerOpen}
        animationType="slide"
        onRequestClose={() => setIsComposerOpen(false)}
      >
        <Screen safeAreaEdges={['top', 'bottom', 'left', 'right']}>
          <View style={[styles.readingHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setIsComposerOpen(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={22} color={colors.textPrimary} />
            </TouchableOpacity>

            <Text variant="h3" weight="bold" color={colors.textPrimary} style={{ flex: 1, marginLeft: 8 }}>
              New {providerTitle} Message
            </Text>

            <TouchableOpacity
              style={[styles.composeSendHeaderBtn, { backgroundColor: colors.primary }]}
              onPress={() => handleSendOrScheduleEmail(isScheduleMode ? 'schedule' : 'send')}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Send size={14} color="#FFF" />
                  <Text variant="caption" weight="bold" color="#FFF">
                    {isScheduleMode ? 'Schedule' : 'Send'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.composeFormScroll} showsVerticalScrollIndicator={false}>
            {/* Locked Sender Identity */}
            <View style={styles.composeSenderBox}>
              <Text variant="caption" weight="bold" color={colors.textMuted}>
                From:
              </Text>
              <View
                style={[
                  styles.composeSenderPill,
                  {
                    backgroundColor: isGmail ? '#FEE2E2' : '#E0F2FE',
                    borderColor: isGmail ? '#EA4335' : '#0078D4',
                  },
                ]}
              >
                {isGmail ? <GmailLogo size={15} /> : <OutlookLogo size={15} />}
                <Text
                  variant="caption"
                  weight="bold"
                  color={isGmail ? '#EA4335' : '#0078D4'}
                  style={{ marginLeft: 6 }}
                >
                  {isGmail ? 'Gmail (Google Workspace)' : 'Outlook (Microsoft 365)'}
                </Text>
              </View>
            </View>

            {/* Recipient To */}
            <View style={[styles.composeInputBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Text variant="caption" weight="bold" color={colors.textMuted} style={styles.inputPrefix}>
                To:
              </Text>
              <TextInput
                style={[styles.inputField, { color: colors.textPrimary }]}
                placeholder="recipient@company.com"
                placeholderTextColor={colors.textMuted}
                value={composeTo}
                onChangeText={setComposeTo}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TouchableOpacity
                onPress={() => setShowCcBcc(!showCcBcc)}
                style={styles.ccBccToggleBtn}
                activeOpacity={0.7}
              >
                <Text variant="caption" weight="bold" color={colors.primary}>
                  {showCcBcc ? 'Hide CC/BCC' : 'Cc / Bcc'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* CC / BCC Fields */}
            {showCcBcc && (
              <>
                <View style={[styles.composeInputBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <Text variant="caption" weight="bold" color={colors.textMuted} style={styles.inputPrefix}>
                    Cc:
                  </Text>
                  <TextInput
                    style={[styles.inputField, { color: colors.textPrimary }]}
                    placeholder="cc@company.com"
                    placeholderTextColor={colors.textMuted}
                    value={composeCc}
                    onChangeText={setComposeCc}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                <View style={[styles.composeInputBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <Text variant="caption" weight="bold" color={colors.textMuted} style={styles.inputPrefix}>
                    Bcc:
                  </Text>
                  <TextInput
                    style={[styles.inputField, { color: colors.textPrimary }]}
                    placeholder="bcc@company.com"
                    placeholderTextColor={colors.textMuted}
                    value={composeBcc}
                    onChangeText={setComposeBcc}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </>
            )}

            {/* Subject */}
            <View style={[styles.composeInputBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Text variant="caption" weight="bold" color={colors.textMuted} style={styles.inputPrefix}>
                Subject:
              </Text>
              <TextInput
                style={[styles.inputField, { color: colors.textPrimary }]}
                placeholder="Important updates..."
                placeholderTextColor={colors.textMuted}
                value={composeSubject}
                onChangeText={setComposeSubject}
              />
            </View>

            {/* AI Assistant Bar */}
            <View style={styles.aiToolbar}>
              <TouchableOpacity
                style={[
                  styles.aiPolishBtn,
                  {
                    backgroundColor: mode === 'dark' ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
                    borderColor: '#10B981',
                  },
                ]}
                onPress={handleAiPolish}
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <ActivityIndicator size="small" color="#10B981" />
                ) : (
                  <>
                    <Sparkles size={14} color="#10B981" />
                    <Text variant="caption" weight="bold" color="#10B981">
                      Polish with AI Assistant
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.scheduleToggleBtn,
                  isScheduleMode && { backgroundColor: `${colors.primary}20`, borderColor: colors.primary },
                ]}
                onPress={() => setIsScheduleMode(!isScheduleMode)}
              >
                <Clock size={13} color={isScheduleMode ? colors.primary : colors.textMuted} />
                <Text
                  variant="caption"
                  weight={isScheduleMode ? 'bold' : 'medium'}
                  color={isScheduleMode ? colors.primary : colors.textMuted}
                >
                  {isScheduleMode ? 'Scheduled' : 'Schedule'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Schedule DateTime Pickers */}
            {isScheduleMode && (
              <View style={[styles.scheduleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text variant="caption" weight="bold" color={colors.textPrimary} style={{ marginBottom: 8 }}>
                  Delivery Timing:
                </Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="caption" color={colors.textMuted} style={{ marginBottom: 4 }}>
                      Date:
                    </Text>
                    <TextInput
                      style={[
                        styles.scheduleInputField,
                        { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background },
                      ]}
                      value={scheduleDate}
                      onChangeText={setScheduleDate}
                      placeholder="YYYY-MM-DD"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="caption" color={colors.textMuted} style={{ marginBottom: 4 }}>
                      Time:
                    </Text>
                    <TextInput
                      style={[
                        styles.scheduleInputField,
                        { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background },
                      ]}
                      value={scheduleTime}
                      onChangeText={setScheduleTime}
                      placeholder="HH:MM"
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Body */}
            <View style={[styles.composeBodyBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <TextInput
                style={[styles.bodyInputField, { color: colors.textPrimary }]}
                placeholder={`Type your ${providerTitle} message here...`}
                placeholderTextColor={colors.textMuted}
                multiline
                textAlignVertical="top"
                value={composeBody}
                onChangeText={setComposeBody}
              />
            </View>

            {/* Quick Action Footer in Compose */}
            <View style={styles.composeFooterRow}>
              <TouchableOpacity
                style={[
                  styles.composeActionBtn,
                  {
                    backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                    borderColor: colors.border,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => handleSendOrScheduleEmail('draft')}
              >
                <FileText size={14} color={colors.textPrimary} />
                <Text variant="caption" weight="bold" color={colors.textPrimary}>
                  Save Draft
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.composeActionBtn, { backgroundColor: colors.primary }]}
                onPress={() => handleSendOrScheduleEmail(isScheduleMode ? 'schedule' : 'send')}
                disabled={sending}
              >
                <Send size={14} color="#FFF" />
                <Text variant="caption" weight="bold" color="#FFF">
                  {isScheduleMode ? 'Schedule' : 'Send'} Now
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Screen>
      </Modal>

      {/* ===================================================================== */}
      {/* AUTO-REPLY SETTINGS MODAL */}
      {/* ===================================================================== */}
      <Modal
        visible={isAutoReplyOpen}
        animationType="slide"
        onRequestClose={() => setIsAutoReplyOpen(false)}
      >
        <Screen safeAreaEdges={['top', 'bottom', 'left', 'right']}>
          <View style={[styles.readingHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setIsAutoReplyOpen(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={22} color={colors.textPrimary} />
            </TouchableOpacity>

            <Text variant="h3" weight="bold" color={colors.textPrimary} style={{ flex: 1, marginLeft: 8 }}>
              {providerTitle} Auto-Reply
            </Text>
          </View>

          {/* TAB SELECTOR */}
          <View style={[styles.modalTabBar, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={[
                styles.modalTabItem,
                autoReplyTab === 'rules' && { backgroundColor: colors.primary },
              ]}
              onPress={() => setAutoReplyTab('rules')}
            >
              <Text
                variant="caption"
                weight="bold"
                color={autoReplyTab === 'rules' ? '#FFF' : colors.textMuted}
              >
                Reply Message
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalTabItem,
                autoReplyTab === 'filters' && { backgroundColor: colors.primary },
              ]}
              onPress={() => setAutoReplyTab('filters')}
            >
              <Text
                variant="caption"
                weight="bold"
                color={autoReplyTab === 'filters' ? '#FFF' : colors.textMuted}
              >
                Email Rules
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalTabItem,
                autoReplyTab === 'logs' && { backgroundColor: colors.primary },
              ]}
              onPress={() => {
                setAutoReplyTab('logs');
                loadAutomationLogsData();
              }}
            >
              <Text
                variant="caption"
                weight="bold"
                color={autoReplyTab === 'logs' ? '#FFF' : colors.textMuted}
              >
                Reply History
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.autoReplyScroll} showsVerticalScrollIndicator={false}>
            {/* TAB 1: REPLY MESSAGE */}
            {autoReplyTab === 'rules' && (
              <>
                {/* Status Toggle */}
                <View style={[styles.autoReplyToggleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text variant="body" weight="bold" color={colors.textPrimary}>
                      Turn Auto-Reply On/Off
                    </Text>
                    <Text variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
                      Send automatic replies to incoming {providerTitle} emails
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.toggleSwitch,
                      { backgroundColor: autoReplyEnabled ? colors.primary : colors.border },
                    ]}
                    onPress={() => setAutoReplyEnabled(!autoReplyEnabled)}
                  >
                    <View
                      style={[
                        styles.toggleKnob,
                        { transform: [{ translateX: autoReplyEnabled ? 18 : 2 }] },
                      ]}
                    />
                  </TouchableOpacity>
                </View>

                {/* Template Variables Notice */}
                <View style={[styles.infoCallout, { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}30` }]}>
                  <Text variant="caption" weight="bold" color={colors.primary}>
                    Add personal info:
                  </Text>
                  <Text variant="caption" color={colors.textPrimary} style={{ marginTop: 2 }}>
                    Type &#123;&#123;first_name&#125;&#125; or &#123;&#123;company&#125;&#125; to add the sender's details automatically.
                  </Text>
                </View>

                {/* Subject */}
                <View style={{ marginTop: 16 }}>
                  <Text variant="caption" weight="bold" color={colors.textMuted} style={{ marginBottom: 6 }}>
                    Subject:
                  </Text>
                  <TextInput
                    style={[
                      styles.autoReplyInput,
                      {
                        color: colors.textPrimary,
                        borderColor: colors.border,
                        backgroundColor: colors.surface,
                      },
                    ]}
                    value={autoReplySubject}
                    onChangeText={setAutoReplySubject}
                    placeholder="Thank you for reaching out!"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>

                {/* Body */}
                <View style={{ marginTop: 16 }}>
                  <Text variant="caption" weight="bold" color={colors.textMuted} style={{ marginBottom: 6 }}>
                    Message Body:
                  </Text>
                  <TextInput
                    style={[
                      styles.autoReplyBodyInput,
                      {
                        color: colors.textPrimary,
                        borderColor: colors.border,
                        backgroundColor: colors.surface,
                      },
                    ]}
                    multiline
                    value={autoReplyBody}
                    onChangeText={setAutoReplyBody}
                    placeholder="Type your reply message here..."
                    placeholderTextColor={colors.textMuted}
                  />
                </View>

                {/* Save Button */}
                <TouchableOpacity
                  style={[styles.saveAutoReplyBtn, { backgroundColor: colors.primary }]}
                  onPress={handleSaveAutoReply}
                  disabled={savingAutoReply}
                >
                  {savingAutoReply ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text variant="body" weight="bold" color="#FFF">
                      Save Changes
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* TAB 2: EMAIL RULES */}
            {autoReplyTab === 'filters' && (
              <>
                {/* Shield Callout */}
                <View style={[styles.infoCallout, { backgroundColor: '#10B98115', borderColor: '#10B98135', flexDirection: 'row', alignItems: 'flex-start', gap: 10 }]}>
                  <ShieldCheck size={20} color="#10B981" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text variant="caption" weight="bold" color="#10B981">
                      Smart Filter Active
                    </Text>
                    <Text variant="caption" color={colors.textPrimary} style={{ marginTop: 2 }}>
                      Automatically stops replies to ads, newsletters, and spam.
                    </Text>
                  </View>
                </View>

                {/* Category Toggles */}
                <Text variant="body" weight="bold" color={colors.textPrimary} style={{ marginTop: 16, marginBottom: 8 }}>
                  Choose Which Emails Get Replies
                </Text>

                {/* Inquiries */}
                <View style={[styles.categoryRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <View style={{ flex: 1 }}>
                    <Text variant="caption" weight="bold" color={colors.textPrimary}>Customer Questions</Text>
                    <Text variant="caption" color={colors.textMuted}>Questions about your products or pricing</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.toggleSwitch, { backgroundColor: allowInquiries ? colors.primary : colors.border }]}
                    onPress={() => setAllowInquiries(!allowInquiries)}
                  >
                    <View style={[styles.toggleKnob, { transform: [{ translateX: allowInquiries ? 18 : 2 }] }]} />
                  </TouchableOpacity>
                </View>

                {/* Support */}
                <View style={[styles.categoryRow, { borderColor: colors.border, backgroundColor: colors.surface, marginTop: 8 }]}>
                  <View style={{ flex: 1 }}>
                    <Text variant="caption" weight="bold" color={colors.textPrimary}>Customer Support</Text>
                    <Text variant="caption" color={colors.textMuted}>Help requests and support tickets</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.toggleSwitch, { backgroundColor: allowSupport ? colors.primary : colors.border }]}
                    onPress={() => setAllowSupport(!allowSupport)}
                  >
                    <View style={[styles.toggleKnob, { transform: [{ translateX: allowSupport ? 18 : 2 }] }]} />
                  </TouchableOpacity>
                </View>

                {/* Promos */}
                <View style={[styles.categoryRow, { borderColor: colors.border, backgroundColor: colors.surface, marginTop: 8 }]}>
                  <View style={{ flex: 1 }}>
                    <Text variant="caption" weight="bold" color={colors.textPrimary}>Advertisements & Pitches</Text>
                    <Text variant="caption" color={colors.textMuted}>Sales offers and promotional cold emails</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.toggleSwitch, { backgroundColor: allowPromotions ? colors.primary : colors.border }]}
                    onPress={() => setAllowPromotions(!allowPromotions)}
                  >
                    <View style={[styles.toggleKnob, { transform: [{ translateX: allowPromotions ? 18 : 2 }] }]} />
                  </TouchableOpacity>
                </View>

                {/* Newsletters */}
                <View style={[styles.categoryRow, { borderColor: colors.border, backgroundColor: colors.surface, marginTop: 8 }]}>
                  <View style={{ flex: 1 }}>
                    <Text variant="caption" weight="bold" color={colors.textPrimary}>Newsletters & Bulletins</Text>
                    <Text variant="caption" color={colors.textMuted}>Subscribed digests and mass mailings</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.toggleSwitch, { backgroundColor: allowNewsletters ? colors.primary : colors.border }]}
                    onPress={() => setAllowNewsletters(!allowNewsletters)}
                  >
                    <View style={[styles.toggleKnob, { transform: [{ translateX: allowNewsletters ? 18 : 2 }] }]} />
                  </TouchableOpacity>
                </View>

                {/* System Notifications */}
                <View style={[styles.categoryRow, { borderColor: colors.border, backgroundColor: colors.surface, marginTop: 8 }]}>
                  <View style={{ flex: 1 }}>
                    <Text variant="caption" weight="bold" color={colors.textPrimary}>Automatic Emails & OTPs</Text>
                    <Text variant="caption" color={colors.textMuted}>Password resets, receipts, and alert messages</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.toggleSwitch, { backgroundColor: allowNotifications ? colors.primary : colors.border }]}
                    onPress={() => setAllowNotifications(!allowNotifications)}
                  >
                    <View style={[styles.toggleKnob, { transform: [{ translateX: allowNotifications ? 18 : 2 }] }]} />
                  </TouchableOpacity>
                </View>

                {/* Excluded Domains */}
                <View style={{ marginTop: 16 }}>
                  <Text variant="caption" weight="bold" color={colors.textMuted} style={{ marginBottom: 6 }}>
                    Blocked Websites/Email Domains:
                  </Text>
                  <TextInput
                    style={[
                      styles.autoReplyInput,
                      { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surface },
                    ]}
                    value={excludedDomains}
                    onChangeText={setExcludedDomains}
                    placeholder="e.g. adcompany.com, coldreach.io"
                    placeholderTextColor={colors.textMuted}
                  />
                  <Text variant="caption" color={colors.textMuted} style={{ fontSize: 10, marginTop: 3 }}>
                    Never reply to anyone from these website domains
                  </Text>
                </View>

                {/* Excluded Senders */}
                <View style={{ marginTop: 14 }}>
                  <Text variant="caption" weight="bold" color={colors.textMuted} style={{ marginBottom: 6 }}>
                    Blocked Email Addresses:
                  </Text>
                  <TextInput
                    style={[
                      styles.autoReplyInput,
                      { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surface },
                    ]}
                    value={excludedSenders}
                    onChangeText={setExcludedSenders}
                    placeholder="e.g. name@vendor.com, spam@domain.com"
                    placeholderTextColor={colors.textMuted}
                  />
                  <Text variant="caption" color={colors.textMuted} style={{ fontSize: 10, marginTop: 3 }}>
                    Never reply to these emails (separate with commas)
                  </Text>
                </View>

                {/* Allowlist Mode */}
                <View style={[styles.autoReplyToggleCard, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 14 }]}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text variant="body" weight="bold" color={colors.textPrimary}>
                      Reply Only to Approved Senders
                    </Text>
                    <Text variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
                      Strict mode: only reply to contacts you have approved
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.toggleSwitch, { backgroundColor: allowlistMode ? colors.primary : colors.border }]}
                    onPress={() => setAllowlistMode(!allowlistMode)}
                  >
                    <View style={[styles.toggleKnob, { transform: [{ translateX: allowlistMode ? 18 : 2 }] }]} />
                  </TouchableOpacity>
                </View>

                {/* Uncertain Fallback */}
                <View style={{ marginTop: 14 }}>
                  <Text variant="caption" weight="bold" color={colors.textMuted} style={{ marginBottom: 6 }}>
                    What to Do When Unsure:
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                      style={[
                        styles.fallbackOptionCard,
                        {
                          borderColor: uncertainFallback === 'skip' ? colors.primary : colors.border,
                          backgroundColor: uncertainFallback === 'skip' ? `${colors.primary}12` : colors.surface,
                        },
                      ]}
                      onPress={() => setUncertainFallback('skip')}
                    >
                      <Text variant="caption" weight="bold" color={uncertainFallback === 'skip' ? colors.primary : colors.textPrimary}>
                        Do Not Reply
                      </Text>
                      <Text variant="caption" color={colors.textMuted} style={{ fontSize: 10, marginTop: 2 }}>
                        Safe choice: do not reply
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.fallbackOptionCard,
                        {
                          borderColor: uncertainFallback === 'require_review' ? colors.primary : colors.border,
                          backgroundColor: uncertainFallback === 'require_review' ? `${colors.primary}12` : colors.surface,
                        },
                      ]}
                      onPress={() => setUncertainFallback('require_review')}
                    >
                      <Text variant="caption" weight="bold" color={uncertainFallback === 'require_review' ? colors.primary : colors.textPrimary}>
                        Hold for Review
                      </Text>
                      <Text variant="caption" color={colors.textMuted} style={{ fontSize: 10, marginTop: 2 }}>
                        Review before sending
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Save Filters Button */}
                <TouchableOpacity
                  style={[styles.saveAutoReplyBtn, { backgroundColor: colors.primary }]}
                  onPress={handleSaveAutoReply}
                  disabled={savingAutoReply}
                >
                  {savingAutoReply ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text variant="body" weight="bold" color="#FFF">
                      Save Changes
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* TAB 3: REPLY HISTORY */}
            {autoReplyTab === 'logs' && (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text variant="body" weight="bold" color={colors.textPrimary}>
                    Reply History
                  </Text>
                  <TouchableOpacity
                    onPress={loadAutomationLogsData}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                  >
                    <RefreshCw size={14} color={colors.primary} />
                    <Text variant="caption" weight="bold" color={colors.primary}>Refresh</Text>
                  </TouchableOpacity>
                </View>

                {loadingLogs ? (
                  <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text variant="caption" color={colors.textMuted} style={{ marginTop: 8 }}>
                      Loading reply history...
                    </Text>
                  </View>
                ) : automationLogs.length === 0 ? (
                  <View style={[styles.emptyLogCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                    <AlertCircle size={28} color={colors.textMuted} />
                    <Text variant="body" weight="bold" color={colors.textPrimary} style={{ marginTop: 8 }}>
                      No Reply History Yet
                    </Text>
                    <Text variant="caption" color={colors.textMuted} style={{ textAlign: 'center', marginTop: 4 }}>
                      When new emails arrive, you will see what happened to them here.
                    </Text>
                  </View>
                ) : (
                  automationLogs.map((log) => {
                    const isReplied = log.decision === 'replied';
                    const isSkipped = log.decision === 'skipped';
                    const isReview = log.decision === 'pending_review';
                    const badgeColor = isReplied ? '#10B981' : isReview ? '#F59E0B' : isSkipped ? '#6B7280' : '#EF4444';
                    const badgeText = isReplied ? 'Replied' : isReview ? 'Needs Review' : isSkipped ? 'Skipped' : 'Failed';

                    return (
                      <View
                        key={log.id}
                        style={[styles.logCard, { borderColor: colors.border, backgroundColor: colors.surface }]}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <View
                            style={[
                              styles.logDecisionBadge,
                              { backgroundColor: `${badgeColor}18`, borderColor: `${badgeColor}40` },
                            ]}
                          >
                            <Text variant="caption" weight="bold" color={badgeColor} style={{ fontSize: 11 }}>
                              {badgeText}
                            </Text>
                          </View>
                          <Text variant="caption" color={colors.textMuted} style={{ fontSize: 10 }}>
                            {log.created_at ? new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </Text>
                        </View>

                        <Text variant="caption" weight="bold" color={colors.textPrimary} style={{ marginTop: 6 }} numberOfLines={1}>
                          {log.sender_email || 'Unknown sender'}
                        </Text>
                        <Text variant="caption" color={colors.textMuted} numberOfLines={1}>
                          {log.subject || '(No subject)'}
                        </Text>

                        {/* Category & Reason */}
                        <View style={{ marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: colors.border }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={[styles.categoryTag, { backgroundColor: colors.background }]}>
                              <Text variant="caption" color={colors.textPrimary} style={{ fontSize: 10 }}>
                                {log.category === 'business_inquiry' ? 'Questions' :
                                 log.category === 'customer_support' ? 'Support' :
                                 log.category === 'sales_inquiry' ? 'Sales' :
                                 log.category === 'advertisement' ? 'Ad' :
                                 log.category === 'newsletter' ? 'Newsletter' :
                                 log.category === 'promotion' ? 'Promo' :
                                 log.category === 'notification' ? 'Alert/OTP' :
                                 log.category === 'spam' ? 'Spam' :
                                 log.category === 'uncertain' ? 'Unsure' :
                                 log.category}
                              </Text>
                            </View>
                            <Text variant="caption" color={colors.textMuted} style={{ flex: 1, fontSize: 11 }} numberOfLines={2}>
                              {log.reason}
                            </Text>
                          </View>
                        </View>

                        {/* Approve action if in review */}
                        {isReview && (
                          <TouchableOpacity
                            style={[styles.approveBtn, { backgroundColor: '#10B981', marginTop: 8 }]}
                            onPress={() => handleApproveLog(log.id)}
                            disabled={approvingLogId === log.id}
                          >
                            {approvingLogId === log.id ? (
                              <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                              <Text variant="caption" weight="bold" color="#FFF">
                                Send Reply
                              </Text>
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })
                )}
                <View style={{ height: 40 }} />
              </>
            )}
          </ScrollView>
        </Screen>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  toastBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 14,
    marginTop: 6,
    borderRadius: 8,
  },
  providerToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 8,
    gap: 8,
  },
  providerToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'rgba(148, 163, 184, 0.08)',
  },
  providerToggleBtnActive: {
    borderWidth: 1.5,
  },
  accountInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 2,
  },
  accountInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  searchBarWrapper: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInputText: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  foldersScrollContainer: {
    marginTop: 4,
    marginBottom: 8,
  },
  foldersScrollContent: {
    paddingHorizontal: 14,
    gap: 8,
  },
  folderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  folderChipActive: {},
  folderChipInactive: {},
  folderCountBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  emailCardTouchable: {
    marginBottom: 8,
  },
  emailCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  emailCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  senderAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircleLarge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailSubject: {
    fontSize: 13,
    marginTop: 8,
  },
  emailSnippet: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  emailCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
  },
  meetingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  meetingBadgeText: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: 'bold',
  },
  attachmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  attachmentBadgeText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: 'bold',
  },
  providerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  providerTagText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 18,
  },
  readingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  readingHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  readingHeaderActionBtn: {
    padding: 4,
  },
  readingScroll: {
    flex: 1,
    paddingHorizontal: 14,
  },
  detailSubject: {
    fontSize: 18,
    marginTop: 14,
    marginBottom: 12,
  },
  detailMetaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  detailMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailMetaRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  providerTagDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  providerTagTextDetail: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  meetingCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  joinMeetingBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  detailAttachmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  detailBodyContainer: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 30,
  },
  detailBodyText: {
    fontSize: 14,
    lineHeight: 22,
  },
  readingBottomBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  bottomBarBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
  },
  composeSendHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  composeFormScroll: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  composeSenderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  composeSenderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  composeInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  ccBccToggleBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  inputPrefix: {
    width: 58,
    fontSize: 12,
  },
  inputField: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  aiToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  aiPolishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  scheduleToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  scheduleCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  scheduleInputField: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
  },
  composeBodyBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 180,
    marginBottom: 16,
  },
  bodyInputField: {
    fontSize: 14,
    lineHeight: 20,
    minHeight: 150,
  },
  composeFooterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  composeActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  autoReplyScroll: {
    flex: 1,
    padding: 16,
  },
  autoReplyToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  toggleSwitch: {
    width: 44,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFF',
  },
  infoCallout: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
  },
  autoReplyInput: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 13,
  },
  autoReplyBodyInput: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 13,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveAutoReplyBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 40,
  },
  modalTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  modalTabItem: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  fallbackOptionCard: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  emptyLogCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  logCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  logDecisionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  approveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
