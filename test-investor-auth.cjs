// Simple test script to check investor authentication
const http = require('http');

// Test the investor authentication endpoints
console.log('Testing investor authentication endpoints...');

// Test common investor login
const commonInvestorData = JSON.stringify({
  username: 'demo',
  password: 'demo123'
});

const commonOptions = {
  hostname: '192.168.100.8',
  port: 3002,
  path: '/api/investors/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(commonInvestorData)
  }
};

console.log('\n--- Testing Common Investor Login ---');
const commonReq = http.request(commonOptions, commonRes => {
  let commonData = '';
  
  commonRes.on('data', chunk => {
    commonData += chunk;
  });
  
  commonRes.on('end', () => {
    console.log('Common investor login status:', commonRes.statusCode);
    console.log('Common investor login response:', commonData);
    
    // Test institutional investor login
    const institutionalInvestorData = JSON.stringify({
      username: 'institutional_demo',
      password: 'demo123'
    });

    const institutionalOptions = {
      hostname: '192.168.100.8',
      port: 3002,
      path: '/api/institutional/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(institutionalInvestorData)
      }
    };

    console.log('\n--- Testing Institutional Investor Login ---');
    const institutionalReq = http.request(institutionalOptions, institutionalRes => {
      let institutionalData = '';
      
      institutionalRes.on('data', chunk => {
        institutionalData += chunk;
      });
      
      institutionalRes.on('end', () => {
        console.log('Institutional investor login status:', institutionalRes.statusCode);
        console.log('Institutional investor login response:', institutionalData);
      });
    });

    institutionalReq.on('error', error => {
      console.error('Error with institutional investor login:', error);
    });

    institutionalReq.write(institutionalInvestorData);
    institutionalReq.end();
  });
});

commonReq.on('error', error => {
  console.error('Error with common investor login:', error);
});

commonReq.write(commonInvestorData);
commonReq.end();