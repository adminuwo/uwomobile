import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Linking,
} from 'react-native';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { useTheme } from '../../src/theme';
import { apiClient } from '../../src/api/client';
import {
  Layers,
  Check,
  X,
  Sparkles,
  Zap,
  ShieldCheck,
  Star,
  Crown,
  ArrowUpRight,
  ChevronRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react-native';

interface PlanFeature {
  key: string;
  label: string;
  included: boolean;
}

interface Plan {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  billing_cycle?: string;
  is_active?: boolean;
  is_popular?: boolean;
  feature_keys?: string[];
}

const FEATURE_LABELS: Record<string, string> = {
  channel_whatsapp: 'WhatsApp Business',
  channel_instagram: 'Instagram Direct',
  channel_facebook: 'Facebook Messenger',
  channel_youtube: 'YouTube Community',
  connector_gmail: 'Gmail Integration',
  connector_outlook: 'Microsoft Outlook',
  connector_google_maps: 'Google Maps',
  connector_google_docs: 'Google Docs',
  connector_onedrive: 'OneDrive',
  connector_google_sheets: 'Google Sheets',
  connector_google_slides: 'Google Slides',
  connector_google_news: 'Google News Feed',
  connector_zoho: 'Zoho CRM',
  connector_google_calendar: 'Google Calendar',
  feature_team_dashboard: 'Team Dashboard',
  feature_quotation: 'Quotations',
  feature_invoice: 'GST Invoices',
  feature_proposal: 'Proposals',
  feature_catalog: 'Product Catalog',
  feature_payment: 'Payment Gateway',
  feature_crm: 'CRM & Leads',
  feature_autoreply: 'Auto Reply Bot',
  feature_voice_video_call: 'Voice & Video Calls',
  feature_broadcast: 'Broadcast Campaigns',
  feature_knowledge_base: 'AI Knowledge Base',
  feature_workflow: 'Workflows & Bots',
  feature_reports: 'Work Reports',
  feature_order: 'Orders',
};

const ALL_FEATURE_KEYS = Object.keys(FEATURE_LABELS);

const FALLBACK_PLANS: Plan[] = [
  {
    id: 'plan-starter',
    name: 'Starter',
    description: 'Essential channels, workspace connectors & sales invoicing for small businesses.',
    price: 499,
    currency: 'INR',
    billing_cycle: 'Monthly',
    is_active: true,
    feature_keys: [
      'channel_whatsapp', 'channel_instagram',
      'connector_gmail', 'connector_google_docs',
      'feature_team_dashboard', 'feature_quotation', 'feature_invoice',
    ],
  },
  {
    id: 'plan-pro',
    name: 'Growth',
    description: 'Complete suite with full channels, cloud connectors, catalog, proposals & payment processing.',
    price: 1599,
    currency: 'INR',
    billing_cycle: 'Monthly',
    is_active: true,
    is_popular: true,
    feature_keys: [
      'channel_whatsapp', 'channel_instagram', 'channel_facebook', 'channel_youtube',
      'connector_gmail', 'connector_outlook', 'connector_google_maps', 'connector_google_docs',
      'connector_onedrive', 'connector_google_sheets',
      'feature_team_dashboard', 'feature_quotation', 'feature_invoice', 'feature_proposal',
      'feature_catalog', 'feature_payment', 'feature_crm', 'feature_autoreply',
    ],
  },
  {
    id: 'plan-enterprise',
    name: 'Advanced',
    description: 'Unlimited access to all 4 channels, all 8 cloud connectors, and all 9 business modules.',
    price: 2499,
    currency: 'INR',
    billing_cycle: 'Monthly',
    is_active: true,
    feature_keys: [
      'channel_whatsapp', 'channel_instagram', 'channel_facebook', 'channel_youtube',
      'connector_gmail', 'connector_outlook', 'connector_google_maps', 'connector_google_docs',
      'connector_onedrive', 'connector_google_sheets', 'connector_google_slides', 'connector_google_news',
      'feature_team_dashboard', 'feature_quotation', 'feature_invoice', 'feature_proposal',
      'feature_catalog', 'feature_payment', 'feature_crm', 'feature_autoreply', 'feature_voice_video_call',
    ],
  },
];

function getPlanIcon(name: string, colors: any) {
  const low = (name || '').toLowerCase();
  if (low.includes('advanced') || low.includes('enterprise')) return <Crown size={22} color="#F59E0B" />;
  if (low.includes('growth') || low.includes('pro')) return <Sparkles size={22} color="#8B5CF6" />;
  return <Zap size={22} color={colors.primary} />;
}

function getPlanGradient(name: string): [string, string] {
  const low = (name || '').toLowerCase();
  if (low.includes('advanced') || low.includes('enterprise')) return ['#F59E0B', '#D97706'];
  if (low.includes('growth') || low.includes('pro')) return ['#8B5CF6', '#7C3AED'];
  return ['#3B82F6', '#2563EB'];
}

export default function PlansScreen() {
  const { colors } = useTheme();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState<string | number | null>(null);
  const [upgrading, setUpgrading] = useState<string | number | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      // Fetch plans
      const plansData = await apiClient.get<any>('/api/plans/public/');
      const rawPlans = Array.isArray(plansData) ? plansData : (plansData?.results || []);
      const activeOnly = rawPlans.filter((p: Plan) => p.is_active !== false);
      
      if (activeOnly.length > 0) {
        // Deduplicate to max 3 tiers
        const unique3: Plan[] = [];
        const seenCategories = new Set<string>();
        activeOnly.forEach((p: Plan) => {
          const lowName = (p.name || '').toLowerCase();
          let catKey = 'starter';
          if (lowName.includes('growth') || lowName.includes('pro')) catKey = 'growth';
          else if (lowName.includes('enterprise') || lowName.includes('advanced') || lowName.includes('full')) catKey = 'enterprise';
          if (!seenCategories.has(catKey) && unique3.length < 3) {
            seenCategories.add(catKey);
            unique3.push(p);
          }
        });
        setPlans(activeOnly);
      } else {
        setPlans([]);
      }

      // Fetch current user profile to know active plan
      try {
        const profileData = await apiClient.get<any>('/api/profile');
        const clientData = profileData?.client || profileData;
        setCurrentPlan((clientData?.plan || clientData?.plan_name || '').toLowerCase());
      } catch {
        // Not critical
      }
    } catch (err) {
      console.warn('Failed to fetch plans:', err);
      setPlans([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPlans();
  };

  const isCurrentPlan = (planName: string): boolean => {
    return currentPlan.includes(planName.toLowerCase());
  };

  const handleUpgrade = async (plan: Plan) => {
    setUpgrading(plan.id);
    try {
      const result = await apiClient.post<any>('/api/payments/create-order/', {
        plan: plan.name,
        billing_cycle: (plan.billing_cycle || 'Monthly').toUpperCase(),
      });

      if (result?.checkout_url) {
        // If backend provides a checkout URL, open it in browser
        await Linking.openURL(result.checkout_url);
      } else if (result?.razorpay_order_id) {
        // Payment order created — redirect to web checkout for Razorpay
        Alert.alert(
          'Payment Order Created',
          `Order ID: ${result.razorpay_order_id}\n\nPlease complete the payment on the web dashboard for a seamless Razorpay checkout experience.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Upgrade Requested',
          `Your upgrade request to "${plan.name}" plan has been submitted. Our team will contact you shortly.`,
          [{ text: 'OK' }]
        );
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to initiate upgrade. Please try again.');
    } finally {
      setUpgrading(null);
    }
  };

  const formatPrice = (price: number, currency?: string) => {
    if (currency === 'USD') return `$${price}`;
    return `₹${price}`;
  };

  if (loading) {
    return (
      <Screen safeAreaEdges={['top', 'left', 'right']}>
        <Header title="Plans & Pricing" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="caption" color={colors.textMuted} style={styles.loadingText}>
            Loading plans...
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
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {/* Current Plan Banner */}
        {currentPlan ? (
          <Card style={[styles.currentPlanCard, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
            <View style={styles.currentPlanRow}>
              <ShieldCheck size={20} color={colors.primary} />
              <View style={styles.currentPlanInfo}>
                <Text variant="caption" color={colors.textMuted}>Your Current Plan</Text>
                <Text variant="body" weight="bold" color={colors.primary} style={{ textTransform: 'capitalize' }}>
                  {currentPlan}
                </Text>
              </View>
              <TouchableOpacity onPress={handleRefresh} style={styles.refreshBtn}>
                <RefreshCw size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </Card>
        ) : null}

        {/* Plan Cards */}
        {plans.map((plan, index) => {
          const isCurrent = isCurrentPlan(plan.name);
          const isExpanded = expandedPlan === plan.id;
          const [gradStart, gradEnd] = getPlanGradient(plan.name);
          const featureKeys = plan.feature_keys || [];

          return (
            <Card
              key={plan.id || index}
              style={[
                styles.planCard,
                isCurrent && { borderColor: colors.primary, borderWidth: 2 },
                plan.is_popular && !isCurrent && { borderColor: '#8B5CF6', borderWidth: 1.5 },
              ]}
            >
              {/* Plan Header */}
              <View style={styles.planHeader}>
                <View style={[styles.planIconBox, { backgroundColor: gradStart + '20' }]}>
                  {getPlanIcon(plan.name, colors)}
                </View>
                <View style={styles.planHeaderText}>
                  <View style={styles.planNameRow}>
                    <Text variant="h3" weight="bold" color={colors.textPrimary}>
                      {plan.name}
                    </Text>
                    {plan.is_popular && (
                      <View style={[styles.popularBadge, { backgroundColor: '#8B5CF6' }]}>
                        <Star size={10} color="#fff" />
                        <Text variant="caption" color="#fff" style={styles.popularText}>Popular</Text>
                      </View>
                    )}
                    {isCurrent && (
                      <View style={[styles.popularBadge, { backgroundColor: colors.success }]}>
                        <Check size={10} color="#fff" />
                        <Text variant="caption" color="#fff" style={styles.popularText}>Active</Text>
                      </View>
                    )}
                  </View>
                  <Text variant="caption" color={colors.textMuted} numberOfLines={2} style={styles.planDesc}>
                    {plan.description || 'Access to core features'}
                  </Text>
                </View>
              </View>

              {/* Price */}
              <View style={styles.priceRow}>
                <Text variant="h2" weight="bold" color={colors.textPrimary}>
                  {formatPrice(plan.price, plan.currency)}
                </Text>
                <Text variant="caption" color={colors.textMuted}>
                  /{(plan.billing_cycle || 'Month').toLowerCase()}
                </Text>
              </View>

              {/* Feature Count */}
              <TouchableOpacity
                style={[styles.featureToggle, { backgroundColor: colors.surface }]}
                onPress={() => setExpandedPlan(isExpanded ? null : plan.id)}
              >
                <View style={styles.featureToggleLeft}>
                  <Layers size={16} color={colors.primary} />
                  <Text variant="body" weight="medium" color={colors.textPrimary}>
                    {featureKeys.length} features included
                  </Text>
                </View>
                <ChevronRight
                  size={18}
                  color={colors.textMuted}
                  style={isExpanded ? { transform: [{ rotate: '90deg' }] } : undefined}
                />
              </TouchableOpacity>

              {/* Expanded Feature List */}
              {isExpanded && (
                <View style={styles.featureList}>
                  {ALL_FEATURE_KEYS.map((key) => {
                    const included = featureKeys.includes(key);
                    return (
                      <View key={key} style={styles.featureRow}>
                        {included ? (
                          <Check size={15} color={colors.success} />
                        ) : (
                          <X size={15} color={colors.error + '60'} />
                        )}
                        <Text
                          variant="caption"
                          color={included ? colors.textPrimary : colors.textMuted}
                          style={[styles.featureLabel, !included && { textDecorationLine: 'line-through' }]}
                        >
                          {FEATURE_LABELS[key] || key.replace(/^(channel_|connector_|feature_)/, '').replace(/_/g, ' ')}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* CTA Button */}
              {isCurrent ? (
                <View style={[styles.ctaButton, { backgroundColor: colors.success + '20' }]}>
                  <Check size={18} color={colors.success} />
                  <Text variant="body" weight="bold" color={colors.success}>
                    Current Plan
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.ctaButton, { backgroundColor: gradStart }]}
                  onPress={() => handleUpgrade(plan)}
                  disabled={upgrading === plan.id}
                >
                  {upgrading === plan.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <ArrowUpRight size={18} color="#fff" />
                      <Text variant="body" weight="bold" color="#fff">
                        Upgrade Now
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </Card>
          );
        })}

        {/* Info Banner */}
        <Card style={[styles.infoCard, { backgroundColor: colors.warning + '10', borderColor: colors.warning + '30' }]}>
          <View style={styles.infoRow}>
            <AlertCircle size={18} color={colors.warning} />
            <Text variant="caption" color={colors.textMuted} style={styles.infoText}>
              For complex payment processing (Razorpay, Stripe), please complete the checkout from the web dashboard. In-app purchases coming soon.
            </Text>
          </View>
        </Card>

      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  currentPlanCard: {
    marginBottom: 16,
    borderWidth: 1,
    padding: 16,
  },
  currentPlanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currentPlanInfo: {
    flex: 1,
  },
  refreshBtn: {
    padding: 8,
  },
  planCard: {
    marginBottom: 16,
    padding: 20,
  },
  planHeader: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  planIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planHeaderText: {
    flex: 1,
  },
  planNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '700',
  },
  planDesc: {
    marginTop: 4,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 16,
  },
  featureToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  featureToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureList: {
    paddingHorizontal: 4,
    marginBottom: 16,
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureLabel: {
    flex: 1,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  infoCard: {
    borderWidth: 1,
    padding: 14,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    lineHeight: 18,
  },
});
