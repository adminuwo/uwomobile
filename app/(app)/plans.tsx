import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Svg, { Circle, Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { useTheme } from '../../src/theme';
import { apiClient } from '../../src/api/client';
import { env } from '../../src/config/env';
import { iapService } from '../../src/services/iapService';
import { APPLE_LEGAL_LINKS, getAppleProductIdForPlan } from '../../src/config/iapConfig';
import type { Subscription as AppleSubscription } from 'react-native-iap';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Star,
  Crown,
  ChevronDown,
  RefreshCw,
  Check,
  Lock,
  ArrowUpRight,
  Layers,
} from 'lucide-react-native';

WebBrowser.maybeCompleteAuthSession();

function extractQueryParam(url: string, paramName: string): string | null {
  try {
    const regex = new RegExp(`[?&]${paramName}=([^&#]+)`);
    const match = url.match(regex);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

// ── AUTHENTIC BRAND VECTOR LOGOS ──
const WhatsAppLogo = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Circle cx="24" cy="24" r="24" fill="#25D366" />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M35.2 12.8C32.3 9.9 28.3 8.3 24.1 8.3C15.4 8.3 8.4 15.3 8.4 24C8.4 26.8 9.1 29.5 10.5 31.9L8.4 39.6L16.3 37.5C18.6 38.8 21.3 39.5 24.1 39.5C32.8 39.5 39.8 32.5 39.8 23.8C39.8 19.6 38.1 15.6 35.2 12.8ZM24.1 36.8C21.7 36.8 19.4 36.1 17.4 35L16.9 34.7L12.2 35.9L13.5 31.3L13.2 30.8C12 28.7 11.3 26.4 11.3 24C11.3 17 17 11.3 24.1 11.3C27.5 11.3 30.7 12.6 33.1 15C35.5 17.4 36.8 20.6 36.8 24C36.8 31 31.1 36.8 24.1 36.8ZM31 27.2C30.6 27 28.7 26.1 28.4 26C28 25.8 27.8 25.7 27.5 26.1C27.2 26.5 26.5 27.4 26.3 27.6C26.1 27.9 25.8 27.9 25.4 27.7C25 27.5 23.7 27.1 22.2 25.7C21 24.7 20.2 23.4 20 23C19.8 22.6 20 22.4 20.2 22.2C20.4 22 20.6 21.7 20.8 21.5C21 21.3 21.1 21.1 21.2 20.9C21.3 20.7 21.3 20.5 21.2 20.3C21.1 20.1 20.3 18.2 20 17.4C19.7 16.6 19.4 16.7 19.1 16.7H18.4C18.1 16.7 17.7 16.8 17.3 17.2C16.9 17.6 16 18.5 16 20.3C16 22.1 17.3 23.9 17.5 24.1C17.7 24.3 20.1 28 23.7 29.6C24.6 30 25.2 30.2 25.8 30.4C26.7 30.7 27.5 30.6 28.2 30.5C28.9 30.4 30.5 29.5 30.8 28.6C31.1 27.8 31.1 27.1 31 27.2Z"
      fill="#ffffff"
    />
  </Svg>
);

const FacebookLogo = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Circle cx="24" cy="24" r="24" fill="#1877F2" />
    <Path
      d="M29.5 25.1L30.3 19.9H25.3V16.5C25.3 15.1 26 13.7 28.2 13.7H30.5V9.3C30.5 9.3 28.4 9 26.4 9C22.3 9 19.6 11.5 19.6 16V19.9H15V25.1H19.6V37.7C20.5 37.9 21.5 38 22.5 38C23.5 38 24.4 37.9 25.3 37.7V25.1H29.5Z"
      fill="#ffffff"
    />
  </Svg>
);

const InstagramLogo = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Defs>
      <LinearGradient id="igMobGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#FFD600" />
        <Stop offset="25%" stopColor="#FF7A00" />
        <Stop offset="50%" stopColor="#FF0069" />
        <Stop offset="75%" stopColor="#D300C5" />
        <Stop offset="100%" stopColor="#7638FA" />
      </LinearGradient>
    </Defs>
    <Rect width="48" height="48" rx="12" fill="url(#igMobGrad)" />
    <Rect x="11" y="11" width="26" height="26" rx="7" stroke="#ffffff" strokeWidth="3" fill="none" />
    <Circle cx="24" cy="24" r="6" stroke="#ffffff" strokeWidth="3" fill="none" />
    <Circle cx="31.5" cy="16.5" r="1.75" fill="#ffffff" />
  </Svg>
);

interface PlanChannelDetails {
  name: string;
  what_you_get: string[];
  features: string[];
  limits: {
    messages: string;
    contacts: string;
    custom_fields: string;
    custom_tags: string;
  };
  message_costs: { type: string; price: string }[];
  benefits: string[];
}

interface PlanTier {
  id: string;
  name: string;
  slug: string;
  description: string;
  monthly_price: number;
  yearly_price: number;
  max_channels: number;
  allowed_channels: string[];
  badge?: string;
  is_popular?: boolean;
  channel_details: Record<string, PlanChannelDetails>;
}

// Same fallback master plans as web PricingComparisonTable.jsx
const MASTER_PLANS: PlanTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    slug: 'starter',
    description: 'Perfect for small teams starting automation on 1 chosen channel',
    monthly_price: 499,
    yearly_price: 5999,
    max_channels: 1,
    allowed_channels: ['whatsapp', 'facebook', 'instagram'],
    channel_details: {
      whatsapp: {
        name: 'WhatsApp',
        what_you_get: [
          'WhatsApp Business API Automation',
          'Shared Team Inbox for WhatsApp',
          'Automated Keyword Replies',
          'Contact & Lead Sync',
        ],
        features: [
          'WhatsApp Auto Replies',
          'Shared Team Inbox',
          'Keyword Triggers & Workflows',
          'Contact Management',
        ],
        limits: {
          messages: 'Unlimited',
          contacts: 'Unlimited',
          custom_fields: '15 Fields',
          custom_tags: '15 Tags',
        },
        message_costs: [
          { type: 'Marketing', price: '₹0.970' },
          { type: 'Authentication', price: '₹0.129' },
          { type: 'Utility', price: '₹0.160' },
          { type: 'Service', price: 'FREE' },
        ],
        benefits: ['No Markup Charges', 'Standard Support', 'Meta API Direct Sync'],
      },
      facebook: {
        name: 'Facebook',
        what_you_get: [
          'Facebook Messenger Automation',
          'Facebook Page Inbox Sync',
          'Automated Page Quick-Replies',
          'Lead Form Acquisition',
        ],
        features: [
          'Facebook Auto Replies',
          'Shared Page Inbox',
          'Ad Lead Capture',
          'Contact Management',
        ],
        limits: {
          messages: 'Unlimited',
          contacts: 'Unlimited',
          custom_fields: '15 Fields',
          custom_tags: '15 Tags',
        },
        message_costs: [
          { type: 'Standard Messaging', price: 'FREE' },
          { type: 'Lead Form Triggers', price: 'FREE' },
        ],
        benefits: ['Meta Graph API Sync', 'Standard Support'],
      },
      instagram: {
        name: 'Instagram',
        what_you_get: [
          'Instagram Direct DM Automation',
          'Story Mention Auto-Replies',
          'Comment Automation & Quick-Flows',
          'Shared Inbox for Insta DMs',
        ],
        features: [
          'Insta Quick-Flows & Price Queries',
          'Comment & Story Mention Triggers',
          'Shared Inbox for DMs & Comments',
          'Giveaway & Promo Automation',
        ],
        limits: {
          messages: 'Unlimited',
          contacts: 'Unlimited',
          custom_fields: '15 Fields',
          custom_tags: '15 Tags',
        },
        message_costs: [
          { type: 'Unlimited DMs & Comments', price: 'FREE' },
          { type: 'Price Query Automation', price: 'FREE' },
        ],
        benefits: ['IG Conversations FREE', 'Standard Support'],
      },
    },
  },
  {
    id: 'growth',
    name: 'Growth',
    slug: 'growth',
    description: 'Empower growing brands with 2 simultaneous channels & catalog sales',
    monthly_price: 1599,
    yearly_price: 15999,
    max_channels: 2,
    allowed_channels: ['whatsapp', 'facebook', 'instagram'],
    badge: 'Most Popular',
    is_popular: true,
    channel_details: {
      whatsapp: {
        name: 'WhatsApp',
        what_you_get: [
          'WhatsApp Business Automation & Broadcasts',
          'FAQ Automations & Decision-Tree Chatbots',
          'Catalog Sync & Product Collections',
          'Native Payments via UPI',
        ],
        features: [
          'FAQ Automations & Linear Bots',
          'Broadcast Campaigns & Catalogs',
          'Native UPI Payment Collection',
          'Public REST APIs & Webhooks',
        ],
        limits: {
          messages: 'Unlimited',
          contacts: 'Unlimited',
          custom_fields: '25 Fields',
          custom_tags: '30 Tags',
        },
        message_costs: [
          { type: 'Marketing', price: '₹0.958' },
          { type: 'Authentication', price: '₹0.128' },
          { type: 'Utility', price: '₹0.150' },
          { type: 'Service', price: 'FREE' },
        ],
        benefits: ['No Markup Charges', 'Higher Rate Limits', 'Priority Support'],
      },
      facebook: {
        name: 'Facebook',
        what_you_get: [
          'Facebook Multi-Page Messenger Sync',
          'Advanced Page Broadcasts',
          'Automated Lead Nurturing',
          'Custom Webhook Integrations',
        ],
        features: [
          'Multi-Page Messenger Bots',
          'Lead Form Auto-Followups',
          'Broadcast Campaigns',
          'Public APIs & CRM Sync',
        ],
        limits: {
          messages: 'Unlimited',
          contacts: 'Unlimited',
          custom_fields: '25 Fields',
          custom_tags: '30 Tags',
        },
        message_costs: [
          { type: 'Standard Messaging', price: 'FREE' },
          { type: 'Lead Form Triggers', price: 'FREE' },
        ],
        benefits: ['No Markup Charges', 'Higher Rate Limits', 'Priority Support'],
      },
      instagram: {
        name: 'Instagram',
        what_you_get: [
          'Instagram Advanced DM Flow Automation',
          'Product Catalog Display in DMs',
          'Story & Reels Mention Triggers',
          'Native Payment Links in DMs',
        ],
        features: [
          'Instagram Decision Tree Bots',
          'Comment & Mention Auto-Replies',
          'Product Catalogs in DMs',
          'Public APIs & Webhooks',
        ],
        limits: {
          messages: 'Unlimited',
          contacts: 'Unlimited',
          custom_fields: '25 Fields',
          custom_tags: '30 Tags',
        },
        message_costs: [
          { type: 'Unlimited DMs & Comments', price: 'FREE' },
          { type: 'Price Automation', price: 'FREE' },
        ],
        benefits: ['IG Conversations FREE', 'Higher Rate Limits', 'Priority Support'],
      },
    },
  },
  {
    id: 'advanced',
    name: 'Advanced',
    slug: 'advanced',
    description: 'Full power automation across all 3 channels with webhooks & AI agents',
    monthly_price: 2499,
    yearly_price: 24999,
    max_channels: 3,
    allowed_channels: ['whatsapp', 'facebook', 'instagram'],
    badge: 'Power House',
    channel_details: {
      whatsapp: {
        name: 'WhatsApp',
        what_you_get: [
          'Enterprise Branching Chatbots & Dynamic Logic',
          'Autonomous AI Copilot & Sales Agents',
          'Chat Auto-Assignment & Round-Robin Routing',
          'Real-Time Webhooks & Dedicated Manager',
        ],
        features: [
          'Branching Chatbot & Conditions',
          'Chat Auto-Assignment & Webhooks',
          'Autonomous AI Agents & Copilot',
          'Multi-Team & Org Management',
        ],
        limits: {
          messages: 'Unlimited',
          contacts: 'Unlimited',
          custom_fields: '30 Fields',
          custom_tags: '45 Tags',
        },
        message_costs: [
          { type: 'Marketing', price: '₹0.949' },
          { type: 'Authentication', price: '₹0.127' },
          { type: 'Utility', price: '₹0.140' },
          { type: 'Service', price: 'FREE' },
        ],
        benefits: [
          'No Markup Charges',
          'Dedicated Account Manager',
          'Highest Rate Limits',
          'Personalized VIP Support',
        ],
      },
      facebook: {
        name: 'Facebook',
        what_you_get: [
          'AI-Powered Facebook Messenger Copilot',
          'Branching Conversational Flow Builder',
          'Round-Robin Agent Routing',
          'Real-Time Webhook Event Streaming',
        ],
        features: [
          'Branching Messenger Flows',
          'AI Copilot & Lead Scoring',
          'Chat Auto-Assignment',
          'Real-Time Webhooks',
        ],
        limits: {
          messages: 'Unlimited',
          contacts: 'Unlimited',
          custom_fields: '30 Fields',
          custom_tags: '45 Tags',
        },
        message_costs: [
          { type: 'Standard Messaging', price: 'FREE' },
          { type: 'Lead Form Triggers', price: 'FREE' },
        ],
        benefits: ['Dedicated Account Manager', 'Highest Rate Limits', 'Personalized Support'],
      },
      instagram: {
        name: 'Instagram',
        what_you_get: [
          'Autonomous AI Copilot for Insta DMs',
          'Branching DM Sales Funnels',
          'Live API Call Triggers in DMs',
          'Real-Time Webhook Event Sync',
        ],
        features: [
          'Branching Insta DM Chatbots',
          'AI Copilot & Auto-Assignment',
          'Real-Time Webhooks & APIs',
          'Org & Multi-Agent Routing',
        ],
        limits: {
          messages: 'Unlimited',
          contacts: 'Unlimited',
          custom_fields: '30 Fields',
          custom_tags: '45 Tags',
        },
        message_costs: [
          { type: 'Unlimited DMs & Comments', price: 'FREE' },
          { type: 'Price & Giveaway Automation', price: 'FREE' },
        ],
        benefits: ['IG Conversations FREE', 'Dedicated Account Manager', 'Personalized Support'],
      },
    },
  },
];

export default function PlansScreen() {
  const { colors } = useTheme();
  const [plans, setPlans] = useState<PlanTier[]>(MASTER_PLANS);
  const [currentPlan, setCurrentPlan] = useState<string>('starter');
  const [billingPeriod, setBillingPeriod] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [upgradingSlug, setUpgradingSlug] = useState<string | null>(null);
  const [appleProducts, setAppleProducts] = useState<Map<string, AppleSubscription>>(new Map());
  const [isRestoring, setIsRestoring] = useState(false);

  // Active channel view tab per plan (e.g. { starter: 'whatsapp', growth: 'whatsapp', advanced: 'whatsapp' })
  const [activeChannelTabs, setActiveChannelTabs] = useState<Record<string, string>>({
    starter: 'whatsapp',
    growth: 'whatsapp',
    advanced: 'whatsapp',
  });

  // Expandable details open/close state
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({
    starter: true,
    growth: true,
    advanced: true,
  });

  const fetchPlans = useCallback(async () => {
    try {
      // 1. Fetch public plans from backend
      try {
        const plansData = await apiClient.get<any>('/api/plans/public/');
        const rawPlans = Array.isArray(plansData) ? plansData : (plansData?.results || []);
        if (rawPlans && rawPlans.length > 0) {
          // Merge dynamic prices if available
          const updated = MASTER_PLANS.map((mPlan) => {
            const found = rawPlans.find((p: any) => {
              const pName = (p.name || '').toLowerCase();
              return pName.includes(mPlan.slug) || mPlan.slug.includes(pName);
            });
            if (found) {
              const meta = found.metadata || {};
              const mPrice = Number(found.monthly_price || meta.monthly_price || found.price || mPlan.monthly_price);
              const yPrice = Number(found.yearly_price || meta.yearly_price || mPlan.yearly_price);
              return {
                ...mPlan,
                monthly_price: mPrice,
                yearly_price: yPrice,
              };
            }
            return mPlan;
          });
          setPlans(updated);
        }
      } catch (err) {
        console.log('Using master fallback plans');
      }

      // 2. Fetch current user profile to determine active plan
      try {
        const profileData = await apiClient.get<any>('/api/profile');
        const clientData = profileData?.client || profileData;
        const activeName = (clientData?.plan || clientData?.plan_name || 'starter').toLowerCase();
        setCurrentPlan(activeName);
      } catch {
        // Not critical
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Initialize Apple StoreKit on iOS and fetch product pricing
  useEffect(() => {
    if (Platform.OS === 'ios') {
      iapService.init().then((ready) => {
        if (ready) {
          iapService.getSubscriptions().then((subs) => {
            if (subs && subs.size > 0) {
              setAppleProducts(new Map(subs));
            }
          });
        }
      });
      return () => {
        iapService.end();
      };
    }
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPlans();
  };

  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    try {
      const result = await iapService.restorePurchases();
      if (result.success) {
        Alert.alert(
          'Purchases Restored! 🎉',
          result.message || `Your ${result.plan || ''} subscription has been restored successfully.`,
          [{ text: 'Great!', onPress: () => fetchPlans() }]
        );
      } else {
        Alert.alert('Restore Purchases', result.error || 'No active Apple subscriptions were found to restore.');
      }
    } catch (e: any) {
      Alert.alert('Restore Error', e?.message || 'Failed to restore Apple purchases.');
    } finally {
      setIsRestoring(false);
      fetchPlans();
    }
  };

  const isCurrentPlan = (planSlug: string): boolean => {
    const cur = currentPlan.toLowerCase();
    const slug = planSlug.toLowerCase();
    return cur.includes(slug) || slug.includes(cur);
  };

  // Trigger Razorpay (Android/Web) or Apple StoreKit (iOS) In-App Checkout
  const handleUpgrade = async (plan: PlanTier) => {
    setUpgradingSlug(plan.slug);

    // iOS Apple In-App Purchase (StoreKit Auto-Renewable Subscription)
    // Strictly complies with Apple Review Guideline 3.1.1
    if (Platform.OS === 'ios') {
      try {
        const cycle = billingPeriod.toLowerCase() as 'monthly' | 'yearly';
        const result = await iapService.purchasePlanSubscription(plan.slug, cycle);
        if (result.success) {
          Alert.alert(
            'Subscription Activated! 🎉',
            result.message || `Your workspace has been successfully upgraded to the ${plan.name} plan (${billingPeriod}).`,
            [{ text: 'Great!', onPress: () => fetchPlans() }]
          );
        } else if (result.error !== 'USER_CANCELLED') {
          Alert.alert('Subscription Failed', result.error || 'Could not complete Apple In-App Purchase.');
        }
      } catch (e: any) {
        Alert.alert('Subscription Error', e?.message || 'Failed to initiate Apple subscription.');
      } finally {
        setUpgradingSlug(null);
        fetchPlans();
      }
      return;
    }

    try {
      // 1. Create order on Django backend
      const result = await apiClient.post<any>('/api/payments/create-order/', {
        plan: plan.name,
        billing_cycle: billingPeriod,
      });

      if (result?.amount === 0) {
        Alert.alert(
          'Plan Activated',
          result.message || `Switched to ${plan.name} plan successfully!`,
          [{ text: 'OK', onPress: () => fetchPlans() }]
        );
        return;
      }

      const orderId = result.order_id || result.razorpay_order_id;
      if (!orderId) {
        throw new Error('Payment order could not be generated. Please try again.');
      }

      // 2. Build deep link return URL and In-App Browser checkout URL
      const redirectUrl = Linking.createURL('payment-result');

      // Priority 1: Official Razorpay Hosted Payment Link (rzp.io)
      //    -> Globally trusted by Razorpay, bypasses domain restriction errors on mobile clients
      // Priority 2: Registered Production Domain checkout URL (uwoconnect.aisa24.com)
      let checkoutUrl = result.payment_link_url;

      if (!checkoutUrl) {
        try {
          const planPrice = billingPeriod === 'YEARLY' ? plan.yearly_price : plan.monthly_price;
          const plinkRes = await fetch('https://api.razorpay.com/v1/payment_links', {
            method: 'POST',
            headers: {
              'Authorization': 'Basic cnpwX2xpdmVfU0JGbElueEJpUmZPR2Q6R1FZbnhtT2w5MTBzQzc2clNoWGhSazNv',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: Math.round(planPrice * 100),
              currency: 'INR',
              description: `Upgrade to ${plan.name} Plan (${billingPeriod})`,
              callback_url: 'https://uwoconnect.aisa24.com/checkout/pay?status=paid',
              callback_method: 'get',
            }),
          });
          const plinkData = await plinkRes.json();
          if (plinkData?.short_url) {
            checkoutUrl = plinkData.short_url;
          }
        } catch (linkErr) {
          console.warn('[plans] Direct Razorpay link generation fallback error:', linkErr);
        }
      }

      if (!checkoutUrl) {
        checkoutUrl = `https://uwoconnect.aisa24.com/checkout/pay?order_id=${encodeURIComponent(orderId)}&plan=${encodeURIComponent(plan.name)}&redirect_url=${encodeURIComponent(redirectUrl)}`;
      }

      // 3. Open In-App Browser (Chrome Custom Tabs on Android / ASWebAuth on iOS)
      const browserResult = await WebBrowser.openAuthSessionAsync(checkoutUrl, redirectUrl);

      if (browserResult.type === 'success' && browserResult.url) {
        const status = extractQueryParam(browserResult.url, 'status');
        const plinkStatus = extractQueryParam(browserResult.url, 'razorpay_payment_link_status');
        const isSuccess = status === 'success' || plinkStatus === 'paid';

        if (isSuccess) {
          Alert.alert(
            'Subscription Activated! 🎉',
            `Congratulations! Your workspace has been successfully upgraded to the ${plan.name} plan (${billingPeriod}).`,
            [{ text: 'Great!', onPress: () => fetchPlans() }]
          );
          fetchPlans();
        } else if (status === 'cancelled' || plinkStatus === 'failed') {
          Alert.alert('Checkout Cancelled', 'The checkout session was cancelled. No charges were made.');
        } else {
          const msg = extractQueryParam(browserResult.url, 'message') || 'Payment was not verified.';
          Alert.alert('Payment Incomplete', msg);
        }
      }
    } catch (err: any) {
      Alert.alert('Checkout Error', err?.message || 'Failed to open Razorpay payment gateway.');
    } finally {
      setUpgradingSlug(null);
    }
  };

  if (loading) {
    return (
      <Screen safeAreaEdges={['top', 'left', 'right']}>
        <Header title="Plans & Pricing" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text variant="caption" color={colors.textMuted} style={styles.loadingText}>
            Loading official workspace plans...
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header title="Plans & Pricing" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#059669" />
        }
      >
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 1. HERO HEADER: EXACTLY MATCHING WEB PRICING PAGE                   */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <View style={styles.heroSection}>
          <View style={styles.officialBadge}>
            <Sparkles size={13} color="#059669" />
            <Text variant="caption" weight="bold" color="#065f46" style={styles.officialBadgeText}>
              OFFICIAL WORKSPACE PLANS
            </Text>
          </View>

          <Text variant="h2" weight="bold" color={colors.textPrimary} style={styles.heroTitle}>
            Find the right plan for your business
          </Text>

          <Text variant="caption" color={colors.textMuted} style={styles.heroSubtitle}>
            Scale customer support, marketing broadcasts, and AI sales agents across WhatsApp, Facebook, and Instagram.
          </Text>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 2. MONTHLY | YEARLY BILLING TOGGLE (UWO GREEN HIGHLIGHT -15%)  */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <View style={[styles.toggleContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => setBillingPeriod('MONTHLY')}
              style={[
                styles.toggleBtn,
                billingPeriod === 'MONTHLY' && [styles.toggleBtnActive, { backgroundColor: colors.card }],
              ]}
              activeOpacity={0.8}
            >
              <Text
                variant="body"
                weight="bold"
                color={billingPeriod === 'MONTHLY' ? colors.textPrimary : colors.textMuted}
              >
                Monthly Billing
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setBillingPeriod('YEARLY')}
              style={[
                styles.toggleBtn,
                billingPeriod === 'YEARLY' && styles.toggleBtnActiveGreen,
              ]}
              activeOpacity={0.8}
            >
              <View style={styles.yearlyLabelRow}>
                <Text
                  variant="body"
                  weight="bold"
                  color={billingPeriod === 'YEARLY' ? '#ffffff' : colors.textMuted}
                >
                  Yearly Billing
                </Text>
                <View style={styles.discountBadge}>
                  <Text variant="caption" weight="bold" color="#064e3b" style={styles.discountText}>
                    -15%
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 3. CURRENT ACTIVE PLAN BANNER                                       */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <Card style={[styles.currentPlanCard, { borderColor: '#10b98135', backgroundColor: '#05966910' }]}>
          <View style={styles.currentPlanRow}>
            <View style={styles.currentPlanIconBox}>
              <ShieldCheck size={22} color="#059669" />
            </View>
            <View style={styles.currentPlanInfo}>
              <Text variant="caption" color={colors.textMuted}>
                Your Current Plan
              </Text>
              <View style={styles.currentPlanBadgeRow}>
                <Text variant="h3" weight="bold" color="#059669" style={{ textTransform: 'capitalize' }}>
                  {currentPlan}
                </Text>
                <View style={styles.activePill}>
                  <Text variant="caption" weight="bold" color="#065f46" style={styles.activePillText}>
                    Active
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={handleRefresh} style={styles.refreshBtn}>
              <RefreshCw size={16} color={colors.textMuted} />
            </TouchableOpacity>
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                onPress={handleRestorePurchases}
                disabled={isRestoring}
                style={[styles.restoreBtn, { borderColor: '#10b98150' }]}
                activeOpacity={0.7}
              >
                {isRestoring ? (
                  <ActivityIndicator size="small" color="#059669" />
                ) : (
                  <Text variant="caption" weight="bold" color="#059669">
                    Restore
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 4. PLAN CARDS (STARTER, GROWTH, ADVANCED - SAME-TO-SAME AS WEB)     */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {plans.map((plan) => {
          const isCurrent = isCurrentPlan(plan.slug);
          const isGrowth = plan.is_popular;
          const displayPrice = billingPeriod === 'YEARLY' ? plan.yearly_price : plan.monthly_price;
          const periodLabel = billingPeriod === 'YEARLY' ? '/yr' : '/mo';
          const isExpanded = expandedDetails[plan.slug] ?? true;
          const curTab = activeChannelTabs[plan.slug] || 'whatsapp';
          const channelData = plan.channel_details[curTab] || plan.channel_details['whatsapp'];

          // Apple StoreKit Dynamic Localized Price
          const appleSku = getAppleProductIdForPlan(plan.slug, billingPeriod.toLowerCase() as 'monthly' | 'yearly');
          const appleProduct = appleProducts.get(appleSku);
          const appleLocalizedPrice = (appleProduct as any)?.localizedPrice;
          const hasApplePrice = Platform.OS === 'ios' && !!appleLocalizedPrice;
          const displayPriceText = hasApplePrice
            ? appleLocalizedPrice
            : `₹${displayPrice.toLocaleString('en-IN')}`;

          return (
            <Card
              key={plan.id}
              style={[
                styles.planCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                isGrowth && styles.growthCardBorder,
                isCurrent && styles.currentCardBorder,
              ]}
            >
              {/* Badge Header for Most Popular / Power House */}
              <View style={styles.cardTopHeader}>
                <View style={styles.cardTopLeft}>
                  {plan.slug === 'advanced' ? (
                    <Crown size={20} color="#059669" />
                  ) : isGrowth ? (
                    <Sparkles size={20} color="#059669" />
                  ) : (
                    <Zap size={20} color="#059669" />
                  )}
                  <Text variant="h3" weight="bold" color={colors.textPrimary}>
                    {plan.name}
                  </Text>
                </View>

                {plan.badge && (
                  <View style={[styles.planPillBadge, isGrowth ? styles.popularPill : styles.powerPill]}>
                    {isGrowth && <Star size={10} color="#064e3b" style={{ marginRight: 3 }} />}
                    <Text variant="caption" weight="bold" color="#064e3b" style={styles.planPillText}>
                      {plan.badge}
                    </Text>
                  </View>
                )}
              </View>

              {/* Description */}
              <Text variant="caption" color={colors.textMuted} style={styles.planDesc}>
                {plan.description}
              </Text>

              {/* Price Row */}
              <View style={styles.priceContainer}>
                <View style={styles.priceRow}>
                  <Text variant="h1" weight="bold" color={colors.textPrimary} style={styles.priceAmount}>
                    {displayPriceText}
                  </Text>
                  <Text variant="body" weight="bold" color={colors.textMuted}>
                    {periodLabel}
                  </Text>
                  {!hasApplePrice && (
                    <Text variant="caption" color={colors.textMuted} style={styles.taxInfo}>
                      (+taxes)
                    </Text>
                  )}
                </View>

                {billingPeriod === 'YEARLY' && (
                  <View style={styles.yearlySavingsBadge}>
                    <Text variant="caption" weight="bold" color="#065f46" style={styles.yearlySavingsText}>
                      Billed Yearly (≈ ₹{Math.round(plan.yearly_price / 12).toLocaleString('en-IN')}/mo)
                    </Text>
                  </View>
                )}
              </View>

              {/* CTA Upgrade / Current Button */}
              {isCurrent ? (
                <View style={styles.currentPlanBtn}>
                  <Check size={16} color="#059669" />
                  <Text variant="body" weight="bold" color="#059669">
                    Current Active Plan
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.upgradeBtn, isGrowth ? styles.upgradeBtnHighlight : styles.upgradeBtnNormal]}
                  onPress={() => handleUpgrade(plan)}
                  disabled={upgradingSlug === plan.slug}
                  activeOpacity={0.85}
                >
                  {upgradingSlug === plan.slug ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Text variant="body" weight="bold" color="#ffffff">
                        Upgrade to {plan.name}
                      </Text>
                      <ArrowUpRight size={17} color="#ffffff" />
                    </>
                  )}
                </TouchableOpacity>
              )}

              {/* Channel Selector Section */}
              <View style={styles.channelsSection}>
                <View style={styles.channelsHeaderRow}>
                  <Text variant="caption" weight="bold" color={colors.textPrimary}>
                    {plan.max_channels === 1 && 'Choose any 1 channel'}
                    {plan.max_channels === 2 && 'Choose any 2 channels'}
                    {plan.max_channels >= 3 && 'All 3 channels included'}
                  </Text>
                  <View style={styles.channelCountPill}>
                    <Text variant="caption" weight="bold" color="#065f46">
                      {plan.max_channels >= 3 ? '3/3' : plan.max_channels === 2 ? '2/2' : '1/1'}
                    </Text>
                  </View>
                </View>

                {/* Channel Brand Selector Pills */}
                <View style={styles.channelPillsRow}>
                  {['whatsapp', 'facebook', 'instagram'].map((chKey) => {
                    const isTabActive = curTab === chKey;
                    return (
                      <TouchableOpacity
                        key={chKey}
                        onPress={() =>
                          setActiveChannelTabs((prev) => ({ ...prev, [plan.slug]: chKey }))
                        }
                        style={[
                          styles.channelPill,
                          { borderColor: colors.border },
                          isTabActive && styles.channelPillActive,
                        ]}
                        activeOpacity={0.8}
                      >
                        {chKey === 'whatsapp' && <WhatsAppLogo size={16} />}
                        {chKey === 'facebook' && <FacebookLogo size={16} />}
                        {chKey === 'instagram' && <InstagramLogo size={16} />}
                        <Text
                          variant="caption"
                          weight={isTabActive ? 'bold' : 'medium'}
                          color={isTabActive ? '#059669' : colors.textPrimary}
                          style={{ textTransform: 'capitalize' }}
                        >
                          {chKey}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Accordion Toggle for Detailed Channel Features */}
              <TouchableOpacity
                style={[styles.accordionToggle, { borderColor: colors.border }]}
                onPress={() =>
                  setExpandedDetails((prev) => ({
                    ...prev,
                    [plan.slug]: !prev[plan.slug],
                  }))
                }
                activeOpacity={0.7}
              >
                <View style={styles.accordionLeft}>
                  <Layers size={15} color="#059669" />
                  <Text variant="caption" weight="bold" color={colors.textPrimary}>
                    {channelData.name} Channel Breakdown & Limits
                  </Text>
                </View>
                <ChevronDown
                  size={16}
                  color={colors.textMuted}
                  style={isExpanded ? { transform: [{ rotate: '180deg' }] } : undefined}
                />
              </TouchableOpacity>

              {/* Expandable Channel Details */}
              {isExpanded && (
                <View style={styles.detailsContainer}>
                  {/* 1. What You Get */}
                  <View style={styles.detailsBlock}>
                    <Text variant="caption" weight="bold" color={colors.textMuted} style={styles.blockTitle}>
                      1. WHAT YOU GET
                    </Text>
                    <View style={[styles.itemsBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      {channelData.what_you_get.map((item, idx) => (
                        <View key={idx} style={styles.featureItemRow}>
                          <Check size={14} color="#059669" style={styles.checkIcon} />
                          <Text variant="caption" color={colors.textPrimary} style={styles.itemText}>
                            {item}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* 2. Limits & Quotas */}
                  <View style={styles.detailsBlock}>
                    <Text variant="caption" weight="bold" color={colors.textMuted} style={styles.blockTitle}>
                      2. LIMITS & QUOTAS
                    </Text>
                    <View style={styles.limitsGrid}>
                      <View style={[styles.limitCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text variant="body" weight="bold" color="#059669">
                          {channelData.limits.messages}
                        </Text>
                        <Text variant="caption" color={colors.textMuted}>
                          Messages
                        </Text>
                      </View>
                      <View style={[styles.limitCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text variant="body" weight="bold" color="#059669">
                          {channelData.limits.contacts}
                        </Text>
                        <Text variant="caption" color={colors.textMuted}>
                          Contacts
                        </Text>
                      </View>
                      <View style={[styles.limitCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text variant="body" weight="bold" color="#059669">
                          {channelData.limits.custom_fields}
                        </Text>
                        <Text variant="caption" color={colors.textMuted}>
                          Custom Fields
                        </Text>
                      </View>
                      <View style={[styles.limitCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text variant="body" weight="bold" color="#059669">
                          {channelData.limits.custom_tags}
                        </Text>
                        <Text variant="caption" color={colors.textMuted}>
                          Custom Tags
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* 3. Message Costs */}
                  <View style={styles.detailsBlock}>
                    <Text variant="caption" weight="bold" color={colors.textMuted} style={styles.blockTitle}>
                      3. MESSAGE COSTS
                    </Text>
                    <View style={[styles.itemsBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      {channelData.message_costs.map((c, idx) => (
                        <View key={idx} style={styles.costItemRow}>
                          <Text variant="caption" color={colors.textMuted}>
                            {c.type}
                          </Text>
                          <Text
                            variant="caption"
                            weight="bold"
                            color={c.price === 'FREE' ? '#059669' : colors.textPrimary}
                          >
                            {c.price}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* 4. Additional Benefits */}
                  <View style={styles.detailsBlock}>
                    <Text variant="caption" weight="bold" color={colors.textMuted} style={styles.blockTitle}>
                      4. ADDITIONAL BENEFITS
                    </Text>
                    <View style={[styles.itemsBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      {channelData.benefits.map((b, idx) => (
                        <View key={idx} style={styles.featureItemRow}>
                          <Check size={14} color="#059669" style={styles.checkIcon} />
                          <Text variant="caption" color={colors.textPrimary} style={styles.itemText}>
                            {b}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </Card>
          );
        })}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 5. FOOTER & LEGAL (STOREKIT / RAZORPAY)                             */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {Platform.OS === 'ios' ? (
          <View style={[styles.securityFooter, styles.iosLegalFooter, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ShieldCheck size={18} color="#059669" style={{ alignSelf: 'center', marginBottom: 4 }} />
            <Text variant="caption" weight="bold" color={colors.textPrimary} style={{ textAlign: 'center', marginBottom: 4 }}>
              Apple In-App Purchase Protection
            </Text>
            <Text variant="caption" color={colors.textMuted} style={styles.securityFooterText}>
              Payment will be charged to your Apple ID account at confirmation of purchase. Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current billing period. You can manage and cancel your subscriptions in your Apple ID Account Settings anytime after purchase.
            </Text>

            <View style={styles.legalLinksRow}>
              <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync(APPLE_LEGAL_LINKS.TERMS_OF_USE_URL)}>
                <Text variant="caption" weight="bold" color="#059669" style={styles.legalLink}>
                  Terms of Use (EULA)
                </Text>
              </TouchableOpacity>
              <Text variant="caption" color={colors.textMuted}>•</Text>
              <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync(APPLE_LEGAL_LINKS.PRIVACY_POLICY_URL)}>
                <Text variant="caption" weight="bold" color="#059669" style={styles.legalLink}>
                  Privacy Policy
                </Text>
              </TouchableOpacity>
              <Text variant="caption" color={colors.textMuted}>•</Text>
              <TouchableOpacity onPress={handleRestorePurchases} disabled={isRestoring}>
                <Text variant="caption" weight="bold" color="#059669" style={styles.legalLink}>
                  {isRestoring ? 'Restoring...' : 'Restore'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[styles.securityFooter, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Lock size={16} color="#059669" />
            <Text variant="caption" color={colors.textMuted} style={styles.securityFooterText}>
              Protected by 256-bit Razorpay Secure Encrypted In-App Checkout. Instant plan activation.
            </Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  // Hero
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  officialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    marginBottom: 10,
  },
  officialBadgeText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  heroTitle: {
    textAlign: 'center',
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 8,
  },
  heroSubtitle: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    maxWidth: 320,
    marginBottom: 16,
  },
  // Billing Toggle
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    width: '100%',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  toggleBtnActive: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  toggleBtnActiveGreen: {
    backgroundColor: '#059669',
    elevation: 3,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  yearlyLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  discountBadge: {
    backgroundColor: '#a7f3d0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 10,
  },
  // Current Plan Card
  currentPlanCard: {
    marginBottom: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
  },
  currentPlanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currentPlanIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#05966918',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentPlanInfo: {
    flex: 1,
  },
  currentPlanBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  activePill: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activePillText: {
    fontSize: 10,
  },
  refreshBtn: {
    padding: 8,
  },
  // Plan Cards
  planCard: {
    marginBottom: 20,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  growthCardBorder: {
    borderColor: '#059669',
    borderWidth: 2,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  currentCardBorder: {
    borderColor: '#10b981',
    borderWidth: 2,
  },
  cardTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  popularPill: {
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  powerPill: {
    backgroundColor: '#ccfbf1',
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  planPillText: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
  planDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  // Price
  priceContainer: {
    marginBottom: 16,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 14,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceAmount: {
    fontSize: 26,
    lineHeight: 32,
  },
  taxInfo: {
    fontSize: 11,
    marginLeft: 4,
  },
  yearlySavingsBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#ecfdf5',
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  yearlySavingsText: {
    fontSize: 10,
  },
  // Buttons
  currentPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    marginBottom: 16,
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  upgradeBtnHighlight: {
    backgroundColor: '#059669',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  upgradeBtnNormal: {
    backgroundColor: '#047857',
  },
  // Channels Section
  channelsSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginBottom: 12,
  },
  channelsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  channelCountPill: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  channelPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  channelPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  channelPillActive: {
    borderColor: '#059669',
    borderWidth: 1.5,
    backgroundColor: '#ecfdf5',
  },
  // Accordion
  accordionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#f8fafc',
  },
  accordionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailsContainer: {
    marginTop: 12,
    gap: 12,
  },
  detailsBlock: {
    gap: 6,
  },
  blockTitle: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  itemsBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    gap: 8,
  },
  featureItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkIcon: {
    marginTop: 1,
  },
  itemText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  limitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  limitCard: {
    width: '48%',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  costItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  // Security Footer
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 4,
  },
  securityFooterText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  restoreBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#05966910',
  },
  iosLegalFooter: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 6,
    padding: 16,
  },
  legalLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#00000010',
  },
  legalLink: {
    fontSize: 11,
    textDecorationLine: 'underline',
  },
});
