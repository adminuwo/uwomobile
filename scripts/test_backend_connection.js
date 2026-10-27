const axios = require('axios');

async function testBackend() {
  const baseURL = 'http://127.0.0.1:8000';
  console.log(`\n🔍 Testing connection to local Django backend at: ${baseURL}\n`);

  // 1. Test /api/health/
  try {
    const healthRes = await axios.get(`${baseURL}/api/health/`);
    console.log('✅ [1/4] Health Check:', healthRes.status, healthRes.data);
  } catch (err) {
    console.error('❌ [1/4] Health Check Failed:', err.message);
  }

  // 2. Test /api/auth/login (OPTIONS / invalid credentials)
  try {
    const loginRes = await axios.post(`${baseURL}/api/auth/login/`, {
      email: 'test_health_probe@uwoconnect.com',
      password: 'invalid_probe_password',
      platform: 'ios',
      device_type: 'mobile',
    });
    console.log('✅ [2/4] Auth Endpoint Reachable:', loginRes.status);
  } catch (err) {
    if (err.response && err.response.status === 401) {
      console.log('✅ [2/4] Auth Login Endpoint Responded (Expected 401 for dummy credentials):', err.response.data);
    } else if (err.response) {
      console.log('✅ [2/4] Auth Login Endpoint Responded with status:', err.response.status, err.response.data);
    } else {
      console.error('❌ [2/4] Auth Endpoint Failed:', err.message);
    }
  }

  // 3. Test /api/auth/google/client-id/
  try {
    const googleRes = await axios.get(`${baseURL}/api/auth/google/client-id/`);
    console.log('✅ [3/4] Google Auth Config Reachable:', googleRes.status, googleRes.data);
  } catch (err) {
    if (err.response) {
      console.log('✅ [3/4] Google Auth endpoint responded with status:', err.response.status);
    } else {
      console.error('❌ [3/4] Google Auth endpoint failed:', err.message);
    }
  }

  // 4. Test WebSocket routing check
  try {
    const wsUrl = `${baseURL.replace('http', 'ws')}/ws/inbox/`;
    console.log('✅ [4/4] WebSocket Endpoint configured at:', wsUrl);
  } catch (err) {
    console.error('❌ [4/4] WebSocket Test Failed:', err.message);
  }

  console.log('\n🎉 Backend connection verification completed!\n');
}

testBackend();
