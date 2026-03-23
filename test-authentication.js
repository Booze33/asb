const jwt = require('jsonwebtoken');

// Test the authentication fix
console.log('Testing authentication fix...');

// Create a test JWT token
const testPayload = {
  id: 1,
  email: 'admin@example.com',
  role: 'admin'
};

const secret = 'test-secret-key';
const token = jwt.sign(testPayload, secret, { expiresIn: '1h' });

console.log('Generated test token:', token);
console.log('Test payload:', testPayload);

// Test the JWT service
const { jwtService } = require('./server/src/services/jwtService');

// Test token verification
try {
  const decoded = jwtService.verifyToken(token);
  console.log('Token verification successful:', decoded);
} catch (error) {
  console.log('Token verification failed:', error.message);
}

console.log('\nAuthentication fix summary:');
console.log('1. Fixed cookie name from "auth_token" to "admin_token" in middleware');
console.log('2. Removed debug console.log statements');
console.log('3. Updated TypeScript configuration to resolve compilation errors');
console.log('4. The authentication flow should now work correctly');