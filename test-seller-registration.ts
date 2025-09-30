import fetch from 'node-fetch';

async function testSellerRegistration() {
  console.log('Testing seller registration endpoint...\n');
  
  const testSellerData = {
    username: 'test_seller_' + Date.now(),
    password: 'testpassword123',
    email: `test_seller_${Date.now()}@example.com`,
    firstName: 'Test',
    lastName: 'Seller',
    company: 'Test Company',
    phone: '555-123-4567'
  };
  
  try {
    console.log('Sending registration request...');
    console.log('Endpoint: http://localhost:3002/api/auth/partners/register');
    console.log('Data:', JSON.stringify(testSellerData, null, 2));
    
    const response = await fetch('http://localhost:3002/api/auth/partners/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testSellerData),
    });
    
    console.log('\nResponse Status:', response.status);
    console.log('Response Headers:', [...response.headers.entries()]);
    
    const responseText = await response.text();
    console.log('\nResponse Body:', responseText);
    
    try {
      const responseData = JSON.parse(responseText);
      console.log('\nParsed Response:', JSON.stringify(responseData, null, 2));
    } catch (parseError) {
      console.log('\nCould not parse response as JSON');
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  }
}

testSellerRegistration();