const http = require('http');

// Test admin endpoint with the token we got
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIxZjA5Yi1lZjM1LTRkMjItYmU0Yy04NWQ3MWUzODQxZDgiLCJlbWFpbCI6ImFkbWluQHN0cmVhbWtqaS5jb20iLCJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNzU4MTEwMzkzLCJleHAiOjE3NTg3MTUxOTN9.i9jw7m4Xz1dp8b2tA0yK4brJXZQlq-O9IHFFgnIpNIA';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/admin/users',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
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
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();