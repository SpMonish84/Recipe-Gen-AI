const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/users';
const timestamp = Date.now();
const testUser = {
  username: `testuser${timestamp}`,
  email: `test${timestamp}@example.com`,
  password: 'testpassword123'
};

async function testRegisterAndLogin() {
  try {
    // Register
    console.log('Testing registration...');
    const registerRes = await axios.post(`${BASE_URL}/register`, testUser);
    console.log('✅ Registration successful:', registerRes.data);

    // Login
    console.log('\nTesting login...');
    const loginRes = await axios.post(`${BASE_URL}/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful:', loginRes.data);

    // Clean up: Optionally, you could delete the user here if you have a delete endpoint
  } catch (err) {
    if (err.response) {
      console.error('❌ Error:', err.response.data);
      console.error('Status:', err.response.status);
      console.error('Headers:', err.response.headers);
    } else if (err.request) {
      console.error('❌ No response received:', err.request);
    } else {
      console.error('❌ Error:', err.message);
    }
    console.error('Full error:', err);
  }
}

testRegisterAndLogin(); 