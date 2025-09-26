import http from 'http';

// Test the properties endpoint
const propertiesOptions = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/public/properties',
  method: 'GET'
};

console.log('Testing /api/public/properties endpoint...');

const propertiesReq = http.request(propertiesOptions, (res) => {
  console.log(`Properties endpoint status: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log(`Received ${jsonData.length} properties`);
      if (jsonData.length > 0) {
        console.log('First property:', jsonData[0].address);
      }
    } catch (error) {
      console.error('Error parsing JSON:', error.message);
    }
  });
});

propertiesReq.on('error', (error) => {
  console.error('Properties endpoint error:', error.message);
});

propertiesReq.end();

// Test the foreclosure samples endpoint
const foreclosureOptions = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/public/foreclosures/samples',
  method: 'GET'
};

console.log('\nTesting /api/public/foreclosures/samples endpoint...');

const foreclosureReq = http.request(foreclosureOptions, (res) => {
  console.log(`Foreclosure samples endpoint status: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('Foreclosure samples response:', Object.keys(jsonData));
      if (jsonData.samples) {
        console.log(`Received ${jsonData.samples.length} foreclosure samples`);
        if (jsonData.samples.length > 0) {
          console.log('First sample:', jsonData.samples[0].address);
        }
      }
    } catch (error) {
      console.error('Error parsing JSON:', error.message);
    }
  });
});

foreclosureReq.on('error', (error) => {
  console.error('Foreclosure samples endpoint error:', error.message);
});

foreclosureReq.end();