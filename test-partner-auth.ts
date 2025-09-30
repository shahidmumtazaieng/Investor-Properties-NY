import fetch from 'node-fetch';

async function testPartnerAuth() {
  try {
    console.log('Testing partner registration and login...');
    
    // Test partner registration
    console.log('\n--- Testing Partner Registration ---');
    const registerResponse = await fetch('http://localhost:3002/api/auth/partners/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testpartner',
        password: 'testpassword123',
        email: 'testpartner@example.com',
        firstName: 'Test',
        lastName: 'Partner',
        company: 'Test Company',
        phone: '123-456-7890'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('Registration response status:', registerResponse.status);
    console.log('Registration response data:', registerData);
    
    if (registerResponse.status === 201) {
      console.log('✅ Partner registration successful!');
      
      // Test partner login
      console.log('\n--- Testing Partner Login ---');
      const loginResponse = await fetch('http://localhost:3002/api/auth/partners/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testpartner',
          password: 'testpassword123'
        })
      });
      
      const loginData = await loginResponse.json();
      console.log('Login response status:', loginResponse.status);
      console.log('Login response data:', loginData);
      
      if (loginResponse.status === 200) {
        console.log('✅ Partner login successful!');
      } else {
        console.log('❌ Partner login failed!');
      }
    } else {
      console.log('❌ Partner registration failed!');
    }
  } catch (error) {
    console.error('Error testing partner auth:', error);
  }
}

testPartnerAuth();