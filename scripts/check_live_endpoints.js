/**
 * check_live_endpoints.js
 * Comprehensive automated verification for all mobile endpoints against live backend.
 */
const https = require('https');

const LIVE_HOST = 'uwoconnectforrb-743928421487.asia-south1.run.app';

function request(options, data = null) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const payload = data ? (typeof data === 'string' ? data : JSON.stringify(data)) : null;
    const req = https.request(
      {
        hostname: LIVE_HOST,
        port: 443,
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...(options.headers || {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          const duration = Date.now() - startTime;
          let parsed;
          try {
            parsed = JSON.parse(body);
          } catch {
            parsed = body.slice(0, 100);
          }
          resolve({ status: res.statusCode, duration, data: parsed });
        });
      }
    );

    req.on('error', (err) => {
      resolve({ status: 'ERROR', duration: Date.now() - startTime, error: err.message });
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function run() {
  console.log('======================================================================');
  console.log('🚀 UWO MOBILE — COMPREHENSIVE ENDPOINT AUDIT (GCP CLOUD RUN)');
  console.log(`🌐 Target: https://${LIVE_HOST}`);
  console.log('======================================================================\n');

  // 1. Authenticate to obtain token
  console.log('🔑 Authenticating as admin@uwo24.com...');
  const loginRes = await request(
    { path: '/api/auth/login', method: 'POST' },
    { email: 'admin@uwo24.com', password: 'admin123' }
  );

  if (loginRes.status !== 200 || !loginRes.data?.token) {
    console.error('❌ Login failed:', loginRes);
    process.exit(1);
  }

  const token = loginRes.data.token;
  console.log(`✅ Authenticated! Token acquired in ${loginRes.duration}ms\n`);

  const authHeader = { Authorization: `Bearer ${token}` };

  // 2. Define all endpoints used by the mobile app
  const endpoints = [
    // Auth & Identity
    { category: 'Auth', name: 'Profile', path: '/api/profile', method: 'GET', auth: true },
    { category: 'Auth', name: 'Linked Devices', path: '/api/auth/linked-devices/', method: 'GET', auth: true },
    { category: 'Auth', name: 'QR Code Generator', path: '/api/auth/qr/create', method: 'POST', auth: false, body: {} },

    // Pricing & Apple In-App Purchase
    { category: 'IAP & Plans', name: 'Public Plans List', path: '/api/plans/public/', method: 'GET', auth: false },
    { category: 'IAP & Plans', name: 'Apple Verify Endpoint Reachability', path: '/api/payments/apple/verify/', method: 'POST', auth: true, body: { product_id: 'com.uwo.uwoconnect.starter.monthly' }, expectedStatus: [200, 400] },
    { category: 'IAP & Plans', name: 'Apple Restore Endpoint Reachability', path: '/api/payments/apple/restore/', method: 'POST', auth: true, body: { transactions: [] }, expectedStatus: [200, 400] },
    { category: 'IAP & Plans', name: 'Payment History', path: '/api/payments/history/', method: 'GET', auth: true },

    // Whitelabel & Branding
    { category: 'Branding', name: 'Whitelabel Config', path: '/api/whitelabel/config', method: 'GET', auth: false },
    { category: 'Preferences', name: 'User Preferences', path: '/api/user/preferences/', method: 'GET', auth: true },

    // App Content & Telemetry
    { category: 'App Content', name: 'Content Version', path: '/api/app/content/version/', method: 'GET', auth: false },
    { category: 'App Content', name: 'Dynamic Content JSON', path: '/api/app/content/?lang=en', method: 'GET', auth: false },
    { category: 'Telemetry', name: 'App Install Tracker', path: '/api/telemetry/app-install/', method: 'POST', auth: false, body: { installation_id: 'audit-test-install-01', platform: 'ios', app_version: '1.0.1' } },

    // Connectors & Channels
    { category: 'Channels', name: 'Global Connector Status', path: '/api/connectors/global-status/', method: 'GET', auth: true },

    // Stats & Analytics
    { category: 'Analytics', name: 'Client Stats', path: '/api/client/stats', method: 'GET', auth: true },
    { category: 'Analytics', name: 'Monitoring Stats', path: '/api/monitoring/stats/', method: 'GET', auth: true },

    // CRM
    { category: 'CRM', name: 'Contacts List', path: '/api/contacts/', method: 'GET', auth: true },
    { category: 'CRM', name: 'Upcoming Followups', path: '/api/contacts/upcoming_followups/', method: 'GET', auth: true },

    // Inbox & Chat
    { category: 'Inbox', name: 'Conversations List', path: '/api/conversations/', method: 'GET', auth: true },
    { category: 'Inbox', name: 'Messages List', path: '/api/messages/', method: 'GET', auth: true },

    // Email
    { category: 'Email', name: 'Email Messages', path: '/api/email/messages/?folder=inbox&skip_sync=true', method: 'GET', auth: true },

    // Team & Workspace
    { category: 'Team', name: 'Team Members', path: '/api/team/members/', method: 'GET', auth: true },
    { category: 'Team', name: 'Projects', path: '/api/team/projects/', method: 'GET', auth: true },
    { category: 'Team', name: 'Tasks', path: '/api/team/tasks/', method: 'GET', auth: true },
    { category: 'Team', name: 'Team Chat', path: '/api/team/chat/', method: 'GET', auth: true },
    { category: 'Team', name: 'Invites', path: '/api/team/invites/', method: 'GET', auth: true },

    // Automation & Workflows
    { category: 'Automation', name: 'Automation Rules', path: '/api/automations/', method: 'GET', auth: true },
    { category: 'Automation', name: 'Workflows List', path: '/api/workflows/', method: 'GET', auth: true },

    // Templates & Media
    { category: 'Media & Feed', name: 'Message Templates', path: '/api/templates/', method: 'GET', auth: true },
    { category: 'Media & Feed', name: 'Google News Feed', path: '/api/google-news/feed', method: 'GET', auth: true },
    { category: 'Media & Feed', name: 'YouTube Videos Hub', path: '/api/youtube/videos/', method: 'GET', auth: true },

    // Sales & Commerce
    { category: 'Commerce', name: 'Products Catalog', path: '/api/products/', method: 'GET', auth: true },
    { category: 'Commerce', name: 'Orders List', path: '/api/orders/', method: 'GET', auth: true },
    { category: 'Commerce', name: 'Invoices & Quotes', path: '/api/sales-documents/', method: 'GET', auth: true },
    { category: 'Commerce', name: 'Wallet Dashboard', path: '/api/wallet/dashboard/', method: 'GET', auth: true },

    // Legal & Compliance
    { category: 'Legal', name: 'Legal Documents', path: '/api/legal/documents/', method: 'GET', auth: false },
    { category: 'Legal', name: 'Consent Status', path: '/api/legal/consent-status/', method: 'GET', auth: true },
  ];

  let passed = 0;
  let failed = 0;

  console.log(
    '%-14s | %-32s | %-6s | %-8s | %-6s'.replace('%-14s', 'Category'.padEnd(14)).replace('%-32s', 'Endpoint Name'.padEnd(32)).replace('%-6s', 'Method'.padEnd(6)).replace('%-8s', 'Status'.padEnd(8)).replace('%-6s', 'Latency'.padEnd(6))
  );
  console.log('-'.repeat(74));

  for (const ep of endpoints) {
    const headers = ep.auth ? authHeader : {};
    const res = await request(
      { path: ep.path, method: ep.method, headers },
      ep.body
    );

    const isExpected = ep.expectedStatus
      ? ep.expectedStatus.includes(res.status)
      : res.status >= 200 && res.status < 300;

    const statusIcon = isExpected ? '✅' : '❌';
    if (isExpected) passed++;
    else failed++;

    const catCol = ep.category.padEnd(14);
    const nameCol = ep.name.padEnd(32);
    const methodCol = ep.method.padEnd(6);
    const statusCol = `${statusIcon} ${res.status}`.padEnd(8);
    const timeCol = `${res.duration}ms`;

    console.log(`${catCol} | ${nameCol} | ${methodCol} | ${statusCol} | ${timeCol}`);
    if (!isExpected) {
      console.log(`   └─ Error details:`, JSON.stringify(res.data).slice(0, 150));
    }
  }

  console.log('\n======================================================================');
  console.log(`🏁 Final Audit Result: ${passed} PASSED, ${failed} FAILED out of ${endpoints.length} endpoints`);
  console.log('======================================================================');
}

run();
