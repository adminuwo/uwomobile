import { Router } from 'expo-router';

// History stack to track visited paths
const historyStack: string[] = [];
let lastRootTab: string = '/(app)/home';

const ROOT_TABS = new Set([
  '/',
  '/(app)',
  '/home',
  '/(app)/home',
  '/inbox',
  '/(app)/inbox',
  '/crm',
  '/(app)/crm',
  '/more',
  '/(app)/more',
]);

/**
 * Check if the given pathname corresponds to one of the 4 root tabs
 */
export function isRootTab(pathname: string): boolean {
  if (!pathname) return true;
  const clean = pathname.split('?')[0].replace(/\/+$/, '').toLowerCase();
  return ROOT_TABS.has(clean);
}

/**
 * Clean path helper
 */
function cleanPath(pathname: string): string {
  return (pathname || '').split('?')[0].replace(/\/+$/, '').toLowerCase();
}

/**
 * Record a route change in history
 */
export function recordRoute(pathname: string): void {
  if (!pathname) return;
  const clean = cleanPath(pathname);

  // If entering a root tab, remember it
  if (ROOT_TABS.has(clean)) {
    lastRootTab = clean;
    // Don't accumulate endless history on root tab switches
    const currentTop = historyStack[historyStack.length - 1];
    if (currentTop !== clean) {
      historyStack.push(clean);
      if (historyStack.length > 25) {
        historyStack.shift();
      }
    }
    return;
  }

  // If sub-screen, push to history if not duplicate of top
  const currentTop = historyStack[historyStack.length - 1];
  if (currentTop !== clean) {
    historyStack.push(clean);
    if (historyStack.length > 25) {
      historyStack.shift();
    }
  }
}

/**
 * Returns the natural logical parent of a given screen
 */
export function getLogicalParent(pathname: string): string {
  const path = cleanPath(pathname);

  // Chat / Messages -> Inbox
  if (path.includes('/conversation') || path.includes('conversation/')) {
    return '/(app)/inbox';
  }

  // Lead / Contact details -> CRM
  if (path.includes('/lead') || path.includes('lead/')) {
    return '/(app)/crm';
  }

  // Settings sub-screens
  if (path.includes('/linked-devices')) {
    return '/(app)/settings';
  }

  // Legal sub-pages -> Legal index
  if (path.includes('/legal/') && !path.endsWith('/legal')) {
    return '/(app)/legal';
  }

  // Secondary more screens -> More tab
  if (
    path.includes('/settings') ||
    path.includes('/appearance') ||
    path.includes('/language') ||
    path.includes('/plans') ||
    path.includes('/reports') ||
    path.includes('/support') ||
    path.includes('/agency') ||
    path.includes('/legal')
  ) {
    return '/(app)/more';
  }

  // Team sub-screens
  if (path.includes('/workspace/team')) {
    return '/(app)/team';
  }

  // Main feature hubs -> Home
  if (
    path.includes('/connectors') ||
    path.includes('/workflows') ||
    path.includes('/broadcasts') ||
    path.includes('/knowledge') ||
    path.includes('/team') ||
    path.includes('/team-chat') ||
    path.includes('/calls') ||
    path.includes('/google-news') ||
    path.includes('/gmail') ||
    path.includes('/email') ||
    path.includes('/youtube') ||
    path.includes('/automations') ||
    path.includes('/sales/') ||
    path.includes('/guides')
  ) {
    return '/(app)/home';
  }

  return lastRootTab || '/(app)/home';
}

/**
 * Perform smart, reliable back navigation
 */
export function smartNavigateBack(
  router: Router,
  currentPathname: string,
  customBack?: () => void
): void {
  if (customBack) {
    customBack();
    return;
  }

  const current = cleanPath(currentPathname);

  // Pop current from our history stack if it matches the top
  if (historyStack.length > 0 && historyStack[historyStack.length - 1] === current) {
    historyStack.pop();
  }

  // Look for the preceding distinct route
  let targetRoute: string | null = null;
  while (historyStack.length > 0) {
    const candidate = historyStack.pop();
    if (candidate && candidate !== current) {
      targetRoute = candidate;
      break;
    }
  }

  if (targetRoute) {
    router.replace(targetRoute as any);
    return;
  }

  // If Expo Router's native stack can pop, let it pop
  if (router.canGoBack()) {
    router.back();
    return;
  }

  // Fallback to logical parent
  const fallback = getLogicalParent(currentPathname);
  router.replace(fallback as any);
}
