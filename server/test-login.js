const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:3008/api/admin/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    console.log('Login successful!');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('Login failed:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
  }
}

testLogin();