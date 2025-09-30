import fetch from 'node-fetch';

async function comprehensiveInvestorTest() {
  try {
    console.log('=== Comprehensive Investor Authentication Test ===\n');
    
    // Test 1: Common Investor Registration
    console.log('--- Test 1: Common Investor Registration ---');
    const commonRegisterResponse = await fetch('http://localhost:3002/api/auth/investors/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testcommoninvestor',
        password: 'testpassword123',
        email: 'testcommon@example.com',
        firstName: 'Test',
        lastName: 'CommonInvestor',
        phone: '123-456-7890',
        subscriptionPlan: 'monthly'
      })
    });
    
    const commonRegisterData: any = await commonRegisterResponse.json();
    console.log('Common Investor Registration Status:', commonRegisterResponse.status);
    console.log('Common Investor Registration Message:', commonRegisterData.message);
    
    if (commonRegisterResponse.status === 201) {
      console.log('✅ Common investor registration successful!\n');
    } else {
      console.log('❌ Common investor registration failed!\n');
    }
    
    // Test 2: Common Investor Login
    console.log('--- Test 2: Common Investor Login ---');
    const commonLoginResponse = await fetch('http://localhost:3002/api/auth/investors/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'demo', // Using demo credentials
        password: 'demo123'
      })
    });
    
    const commonLoginData: any = await commonLoginResponse.json();
    console.log('Common Investor Login Status:', commonLoginResponse.status);
    console.log('Common Investor Login Message:', commonLoginData.message);
    
    if (commonLoginResponse.status === 200) {
      console.log('✅ Common investor login successful!\n');
    } else {
      console.log('❌ Common investor login failed!\n');
    }
    
    // Test 3: Institutional Investor Registration
    console.log('--- Test 3: Institutional Investor Registration ---');
    const instRegisterResponse = await fetch('http://localhost:3002/api/auth/institutional/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testinstitutional',
        password: 'testpassword123',
        email: 'testinstitutional@example.com',
        firstName: 'Test',
        lastName: 'Institutional',
        companyName: 'Test Institution',
        jobTitle: 'Investment Manager',
        workPhone: '123-456-7890',
        personalPhone: '098-765-4321',
        subscriptionPlan: 'yearly'
      })
    });
    
    const instRegisterData: any = await instRegisterResponse.json();
    console.log('Institutional Investor Registration Status:', instRegisterResponse.status);
    console.log('Institutional Investor Registration Message:', instRegisterData.message);
    
    if (instRegisterResponse.status === 201) {
      console.log('✅ Institutional investor registration successful!\n');
    } else {
      console.log('❌ Institutional investor registration failed!\n');
    }
    
    // Test 4: Institutional Investor Login
    console.log('--- Test 4: Institutional Investor Login ---');
    const instLoginResponse = await fetch('http://localhost:3002/api/auth/institutional/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'institutional_demo', // Using demo credentials
        password: 'demo123'
      })
    });
    
    const instLoginData: any = await instLoginResponse.json();
    console.log('Institutional Investor Login Status:', instLoginResponse.status);
    console.log('Institutional Investor Login Message:', instLoginData.message);
    
    if (instLoginResponse.status === 200) {
      console.log('✅ Institutional investor login successful!\n');
    } else {
      console.log('❌ Institutional investor login failed!\n');
    }
    
    // Test 5: Default Demo Credentials
    console.log('--- Test 5: Default Institutional Demo Credentials ---');
    const defaultInstLoginResponse = await fetch('http://localhost:3002/api/auth/institutional/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'institutional',
        password: 'institutional123'
      })
    });
    
    const defaultInstLoginData: any = await defaultInstLoginResponse.json();
    console.log('Default Institutional Login Status:', defaultInstLoginResponse.status);
    console.log('Default Institutional Login Message:', defaultInstLoginData.message);
    
    if (defaultInstLoginResponse.status === 200) {
      console.log('✅ Default institutional investor login successful!\n');
    } else {
      console.log('❌ Default institutional investor login failed!\n');
    }
    
    // Test 6: Invalid Credentials
    console.log('--- Test 6: Invalid Credentials ---');
    const invalidLoginResponse = await fetch('http://localhost:3002/api/auth/investors/login', {
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
    
    console.log('=== All Tests Completed ===');
    
  } catch (error) {
    console.error('Error during comprehensive investor test:', error);
  }
}

comprehensiveInvestorTest();