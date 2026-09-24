/**
 * Centralized Apple In-App Purchase (IAP) Configuration
 * Single source of truth for Apple Auto-Renewable Subscriptions.
 */

export interface IAPProductConfig {
  planSlug: 'starter' | 'growth' | 'enterprise';
  billingPeriod: 'monthly' | 'yearly';
  productId: string;
  defaultPrice: number;
}

// Master Apple Product Identifiers
// Matches App Store Connect -> Monetization -> Subscriptions
export const APPLE_IAP_SUBSCRIPTION_SKUS: Record<string, string> = {
  STARTER_MONTHLY: 'com.uwo.uwoconnect.starter.monthly',
  STARTER_YEARLY: 'com.uwo.uwoconnect.starter.annual',
  STARTER_YEARLY_ALT: 'com.uwo.uwoconnect.starter.yearly',
  GROWTH_MONTHLY: 'com.uwo.uwoconnect.growth.monthly',
  GROWTH_YEARLY: 'om.uwo.uwoconnect.growth.annual',
  GROWTH_YEARLY_ALT: 'com.uwo.uwoconnect.growth.annual',
  ENTERPRISE_MONTHLY: 'com.uwo.uwoconnect.advance.monthly',
  ENTERPRISE_MONTHLY_ALT: 'com.uwo.uwoconnect.enterprise.monthly',
  ENTERPRISE_YEARLY: 'com.uwo.uwoconnect.advance.annual',
  ENTERPRISE_YEARLY_ALT: 'com.uwo.uwoconnect.advance.yearly',
};

// Array of all active Apple Subscription SKUs for getSubscriptions()
export const ALL_APPLE_SUBSCRIPTION_SKUS: string[] = Object.values(APPLE_IAP_SUBSCRIPTION_SKUS);

/**
 * Returns the Apple Product ID matching a given Plan and Billing Period.
 */
export function getAppleProductIdForPlan(planSlug: string, billingPeriod: 'monthly' | 'yearly'): string {
  const normSlug = planSlug.toLowerCase().trim();
  const isYearly = billingPeriod === 'yearly';

  if (normSlug.includes('starter') || normSlug.includes('basic')) {
    return isYearly ? APPLE_IAP_SUBSCRIPTION_SKUS.STARTER_YEARLY : APPLE_IAP_SUBSCRIPTION_SKUS.STARTER_MONTHLY;
  }
  if (normSlug.includes('growth') || normSlug.includes('pro')) {
    return isYearly ? APPLE_IAP_SUBSCRIPTION_SKUS.GROWTH_YEARLY : APPLE_IAP_SUBSCRIPTION_SKUS.GROWTH_MONTHLY;
  }
  if (normSlug.includes('enterprise') || normSlug.includes('advance')) {
    return isYearly ? APPLE_IAP_SUBSCRIPTION_SKUS.ENTERPRISE_YEARLY : APPLE_IAP_SUBSCRIPTION_SKUS.ENTERPRISE_MONTHLY;
  }

  // Fallback
  return isYearly ? APPLE_IAP_SUBSCRIPTION_SKUS.STARTER_YEARLY : APPLE_IAP_SUBSCRIPTION_SKUS.STARTER_MONTHLY;
}

/**
 * Legal Links required by Apple App Store Review Guidelines (Guideline 3.1.2)
 */
export const APPLE_LEGAL_LINKS = {
  TERMS_OF_USE_URL: 'https://uwoconnect.aisa24.com/legal/terms',
  PRIVACY_POLICY_URL: 'https://uwoconnect.aisa24.com/legal/privacy',
};
