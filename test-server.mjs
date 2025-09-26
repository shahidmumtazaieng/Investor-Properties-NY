import http from 'http';

// Test if the server is running
const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();