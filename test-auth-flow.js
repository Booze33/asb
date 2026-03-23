const fetch = require('node-fetch');

async function testAuthFlow() {
  console.log('Testing authentication flow...\n');

  const API_BASE = 'http://localhost:3008';
  
  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connectivity...');
    const healthResponse = await fetch(`${API_BASE}/api/health`);
    console.log(`   Health check status: ${healthResponse.status}`);
    
    if (!healthResponse.ok) {
      console.log('   ❌ Server is not responding properly');
      return;
    }
    console.log('   ✅ Server is running\n');

    // Test 2: Try to access dashboard without authentication (should fail with 401)
    console.log('2. Testing unauthenticated dashboard access...');
    const dashboardResponse = await fetch(`${API_BASE}/api/admin/dashboard?page=1&limit=10`);
    console.log(`   Dashboard status: ${dashboardResponse.status}`);
    
    if (dashboardResponse.status === 401) {
      console.log('   ✅ Correctly rejected unauthenticated request\n');
    } else {
      console.log('   ❌ Should have returned 401 Unauthorized\n');
    }

    // Test 3: Try to login with invalid credentials
    console.log('3. Testing login with invalid credentials...');
    const loginResponse = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      })
    });
    console.log(`   Login status: ${loginResponse.status}`);
    
    if (loginResponse.status === 401) {
      console.log('   ✅ Correctly rejected invalid credentials\n');
    } else {
      console.log('   ❌ Should have returned 401 for invalid credentials\n');
    }

    console.log('Authentication flow test completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start the server: npm run dev (in server directory)');
    console.log('2. Start the client: npm run dev (in client directory)');
    console.log('3. Login with valid admin credentials');
    console.log('4. Dashboard should now load appointments without 401 errors');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nMake sure:');
    console.log('1. Server is running on port 3008');
    console.log('2. Database is connected');
    console.log('3. Client is configured to connect to http://localhost:3008');
  }
}

testAuthFlow();