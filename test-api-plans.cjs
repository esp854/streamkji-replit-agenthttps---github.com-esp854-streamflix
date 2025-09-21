const http = require('http');

// Test the API endpoint directly
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/subscription/plans',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`Body: ${data}`);
    try {
      const jsonData = JSON.parse(data);
      console.log('Parsed JSON:', jsonData);
    } catch (e) {
      console.log('Not JSON data');
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();