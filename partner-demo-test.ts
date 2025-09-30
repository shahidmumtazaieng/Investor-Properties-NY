import fetch from 'node-fetch';

async function partnerDemoTest() {
  try {
    console.log('=== Partner Authentication Demo Test ===\n');
    
    // Test 1: Valid demo credentials
    console.log('--- Test 1: Valid Demo Credentials ---');
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
    
    // Test 2: Test partner we added support for
    console.log('--- Test 2: Test Partner Credentials ---');
    const testLoginResponse = await fetch('http://localhost:3002/api/auth/partners/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testpartner',
        password: 'testpassword123'
      })
    });
    
    const testLoginData: any = await testLoginResponse.json();
    console.log('Test Partner Login Status:', testLoginResponse.status);
    console.log('Test Partner Login Message:', testLoginData.message);
    
    if (testLoginResponse.status === 200) {
      console.log('✅ Test partner credentials work!\n');
    } else {
      console.log('❌ Test partner credentials failed!\n');
    }
    
    // Test 3: Invalid credentials
    console.log('--- Test 3: Invalid Credentials ---');
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
    
    // Test 4: Missing credentials
    console.log('--- Test 4: Missing Credentials ---');
    const missingCredsResponse = await fetch('http://localhost:3002/api/auth/partners/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: '',
        password: ''
      })
    });
    
    const missingCredsData: any = await missingCredsResponse.json();
    console.log('Missing Credentials Status:', missingCredsResponse.status);
    console.log('Missing Credentials Message:', missingCredsData.message);
    
    if (missingCredsResponse.status === 400) {
      console.log('✅ Missing credentials properly rejected!\n');
    } else {
      console.log('❌ Missing credentials not properly handled!\n');
    }
    
    // Test 5: Registration validation
    console.log('--- Test 5: Registration Validation ---');
    const registerResponse = await fetch('http://localhost:3002/api/auth/partners/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        password: 'short', // Too short
        email: 'invalid-email', // Invalid format
        firstName: 'Test',
        lastName: 'User'
      })
    });
    
    const registerData: any = await registerResponse.json();
    console.log('Registration Validation Status:', registerResponse.status);
    console.log('Registration Validation Message:', registerData.message);
    
    if (registerResponse.status === 400) {
      console.log('✅ Registration validation works!\n');
    } else {
      console.log('❌ Registration validation failed!\n');
    }
    
    console.log('=== Demo Test Completed ===');
    
  } catch (error) {
    console.error('Error during partner demo test:', error);
  }
}

partnerDemoTest();