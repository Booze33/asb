const express = require('express');
const cookieParser = require('cookie-parser');
const { authenticateAdmin } = require('./server/src/middleware/auth');

// Create a test app
const app = express();
app.use(cookieParser());

// Test route that uses the authentication middleware
app.get('/test-auth', authenticateAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'Authentication successful',
    user: req.user
  });
});

// Start the test server
const PORT = 3009;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Test the authentication with:');
  console.log('1. curl -H "Cookie: admin_token=valid_token" http://localhost:3009/test-auth');
  console.log('2. curl http://localhost:3009/test-auth (should fail)');
});