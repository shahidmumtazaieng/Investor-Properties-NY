import fetch from 'node-fetch';

async function comprehensivePartnerTest() {
  try {
    console.log('=== Comprehensive Partner Authentication Test ===\n');
    
    // Test 1: Partner Registration
    console.log('--- Test 1: Partner Registration ---');
    const registerResponse = await fetch('http://localhost:3002/api/auth/partners/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'comprehensivepartner',
        password: 'comprehensive123',
        email: 'comprehensive@example.com',
        firstName: 'Comprehensive',
        lastName: 'Partner',
        company: 'Comprehensive Testing Co.',
        phone: '987-654-3210'
      })
    });
    
    const registerData: any = await registerResponse.json();
    console.log('Registration Status:', registerResponse.status);
    console.log('Registration Message:', registerData.message);
    
    if (registerResponse.status !== 201) {
      console.log('❌ Partner registration failed!');
      return;
    }
    console.log('✅ Partner registration successful!\n');
    
    // Test 2: Partner Login
    console.log('--- Test 2: Partner Login ---');
    const loginResponse = await fetch('http://localhost:3002/api/auth/partners/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'comprehensivepartner',
        password: 'comprehensive123'
      })
    });
    
    const loginData: any = await loginResponse.json();
    console.log('Login Status:', loginResponse.status);
    console.log('Login Message:', loginData.message);
    
    if (loginResponse.status !== 200) {
      console.log('❌ Partner login failed!');
      return;
    }
    console.log('✅ Partner login successful!\n');
    
    // Test 3: Test with default demo credentials
    console.log('--- Test 3: Default Demo Credentials ---');
    const demoLoginResponse = await fetch('http://localhost:3002/api/auth/partners/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'partner',
        password: 'partner123'
      })
    });
    
    const demoLoginData: any = await demoLoginResponse.json();
    console.log('Demo Login Status:', demoLoginResponse.status);
    console.log('Demo Login Message:', demoLoginData.message);
    
    if (demoLoginResponse.status === 200) {
      console.log('✅ Default demo credentials work!\n');
    } else {
      console.log('❌ Default demo credentials failed!\n');
    }
    
    // Test 4: Invalid credentials
    console.log('--- Test 4: Invalid Credentials ---');
    const invalidLoginResponse = await fetch('http://localhost:3002/api/auth/partners/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'invaliduser',
        password: 'invalidpassword'
      })
    });
    
    const invalidLoginData: any = await invalidLoginResponse.json();
    console.log('Invalid Login Status:', invalidLoginResponse.status);
    console.log('Invalid Login Message:', invalidLoginData.message);
    
    if (invalidLoginResponse.status === 401) {
      console.log('✅ Invalid credentials properly rejected!\n');
    } else {
      console.log('❌ Invalid credentials not properly handled!\n');
    }
    
    // Test 5: Missing fields registration
    console.log('--- Test 5: Missing Fields Registration ---');
    const missingFieldsResponse = await fetch('http://localhost:3002/api/auth/partners/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'missingfields',
        password: 'missing123'
        // Missing required fields
      })
    });
    
    const missingFieldsData: any = await missingFieldsResponse.json();
    console.log('Missing Fields Status:', missingFieldsResponse.status);
    console.log('Missing Fields Message:', missingFieldsData.message);
    
    if (missingFieldsResponse.status === 400) {
      console.log('✅ Missing fields properly rejected!\n');
    } else {
      console.log('❌ Missing fields not properly handled!\n');
    }
    
    console.log('=== All Tests Completed ===');
    
  } catch (error) {
    console.error('Error during comprehensive partner test:', error);
  }
}

comprehensivePartnerTest();