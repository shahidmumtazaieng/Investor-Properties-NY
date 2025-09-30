import fetch from 'node-fetch';

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    
    const response = await fetch('http://localhost:3002/api/auth/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.status === 200) {
      console.log('✅ Admin login test successful!');
    } else {
      console.log('❌ Admin login test failed!');
    }
  } catch (error) {
    console.error('Error testing admin login:', error);
  }
}

testAdminLogin();