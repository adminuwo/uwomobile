/**
 * check_all_mobile_endpoints.js
 * Comprehensive tester for all endpoints consumed by UWO Mobile.
 */
const http = require('http');

const BASE_HOST = '127.0.0.1';
const BASE_PORT = 8000;

function request(options, data = null) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const payload = data ? (typeof data === 'string' ? data : JSON.stringify(data)) : null;
    const req = http.request(
      {
        hostname: BASE_HOST,
        port: BASE_PORT,
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
  console.log('=================================================================');
  console.log('🚀 UWO MOBILE — FULL ENDPOINT HEALTH & VERIFICATION SUITE');
  console.log('=================================================================\n');

  // 1. Authenticate to obtain token
  console.log('1. Authenticating as abha@uwo24.com...');
  const loginRes = await request(
    { path: '/api/auth/login', method: 'POST' },
    { email: 'abha@uwo24.com', password: 'admin123' }
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
    { name: 'Auth - Profile (GET)', path: '/api/profile', method: 'GET', auth: true },
    { name: 'Auth - QR Create (POST)', path: '/api/auth/qr/create', method: 'POST', auth: false, body: {} },
    { name: 'Auth - Linked Devices (GET)', path: '/api/auth/linked-devices/', method: 'GET', auth: true },
    
    // Whitelabel & Branding
    { name: 'Branding - Whitelabel Config (GET)', path: '/api/whitelabel/config', method: 'GET', auth: false },
    { name: 'Preferences - User Preferences (GET)', path: '/api/user/preferences/', method: 'GET', auth: true },

    // App Content & Telemetry
    { name: 'Content - Version (GET)', path: '/api/app/content/version/', method: 'GET', auth: false },
    { name: 'Content - Dynamic JSON (GET)', path: '/api/app/content/?lang=en', method: 'GET', auth: false },
    { name: 'Telemetry - Install Tracker (POST)', path: '/api/telemetry/app-install/', method: 'POST', auth: false, body: { installation_id: 'test-node-chk-01', platform: 'android', app_version: '1.0.0' } },

    // Connectors & Channels
    { name: 'Connectors - Global Status (GET)', path: '/api/connectors/global-status/', method: 'GET', auth: true },

    // Stats & Analytics
    { name: 'Stats - Client Stats (GET)', path: '/api/client/stats', method: 'GET', auth: true },
    { name: 'Stats - Monitoring Stats (GET)', path: '/api/monitoring/stats/', method: 'GET', auth: true },

    // CRM
    { name: 'CRM - Contacts (GET)', path: '/api/contacts/', method: 'GET', auth: true },
    { name: 'CRM - Followups (GET)', path: '/api/contacts/upcoming_followups/', method: 'GET', auth: true },

    // Inbox & Chat
    { name: 'Inbox - Conversations (GET)', path: '/api/conversations/', method: 'GET', auth: true },
    { name: 'Inbox - Messages (GET)', path: '/api/messages/', method: 'GET', auth: true },

    // Email
    { name: 'Email - Messages (GET)', path: '/api/email/messages/?folder=inbox&skip_sync=true', method: 'GET', auth: true },

    // Team & Workspace
    { name: 'Team - Members (GET)', path: '/api/team/members/', method: 'GET', auth: true },
    { name: 'Team - Projects (GET)', path: '/api/team/projects/', method: 'GET', auth: true },
    { name: 'Team - Tasks (GET)', path: '/api/team/tasks/', method: 'GET', auth: true },
    { name: 'Team - Chat (GET)', path: '/api/team/chat/', method: 'GET', auth: true },
    { name: 'Team - Invites (GET)', path: '/api/team/invites/', method: 'GET', auth: true },

    // Automation & Workflows
    { name: 'Automations - Rules (GET)', path: '/api/automations/', method: 'GET', auth: true },
    { name: 'Workflows - List (GET)', path: '/api/workflows/', method: 'GET', auth: true },

    // Templates & News
    { name: 'Templates - List (GET)', path: '/api/templates/', method: 'GET', auth: true },
    { name: 'Google News - Feed (GET)', path: '/api/google-news/feed', method: 'GET', auth: true },
    { name: 'YouTube - Videos (GET)', path: '/api/youtube/videos/', method: 'GET', auth: true },

    // Sales & Commerce
    { name: 'Sales - Products (GET)', path: '/api/products/', method: 'GET', auth: true },
    { name: 'Sales - Orders (GET)', path: '/api/orders/', method: 'GET', auth: true },
    { name: 'Sales - Invoices & Quotes (GET)', path: '/api/sales-documents/', method: 'GET', auth: true },
    { name: 'Payments - History (GET)', path: '/api/payments/history/', method: 'GET', auth: true },
    { name: 'Wallet - Dashboard (GET)', path: '/api/wallet/dashboard/', method: 'GET', auth: true },

    // Legal & Compliance
    { name: 'Legal - Documents (GET)', path: '/api/legal/documents/', method: 'GET', auth: false },
    { name: 'Legal - Consent Status (GET)', path: '/api/legal/consent-status/', method: 'GET', auth: true },
  ];

  let passed = 0;
  let failed = 0;

  console.log(
    '%-36s | %-6s | %-6s | %-6s'.replace('%-36s', 'Endpoint Name'.padEnd(36)).replace('%-6s', 'Method'.padEnd(6)).replace('%-6s', 'Status'.padEnd(6)).replace('%-6s', 'Time'.padEnd(6))
  );
  console.log('-'.repeat(68));

  for (const ep of endpoints) {
    const headers = ep.auth ? authHeader : {};
    const res = await request(
      { path: ep.path, method: ep.method, headers },
      ep.body
    );

    const isOk = res.status >= 200 && res.status < 300;
    const statusIcon = isOk ? '✅' : '❌';
    if (isOk) passed++;
    else failed++;

    const nameCol = ep.name.padEnd(36);
    const methodCol = ep.method.padEnd(6);
    const statusCol = `${statusIcon} ${res.status}`.padEnd(8);
    const timeCol = `${res.duration}ms`;

    console.log(`${nameCol} | ${methodCol} | ${statusCol} | ${timeCol}`);
    if (!isOk) {
      console.log(`   └─ Error details:`, JSON.stringify(res.data).slice(0, 140));
    }
  }

  console.log('\n=================================================================');
  console.log(`🏁 Summary: ${passed} PASSED, ${failed} FAILED (Total: ${endpoints.length})`);
  console.log('=================================================================');
}

run();
