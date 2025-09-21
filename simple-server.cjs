const http = require('http');
const fs = require('fs');
const path = require('path');

const hostname = '127.0.0.1';
const port = 3001;

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Serve the test mux iframe file
  if (req.url === '/' || req.url === '/test-mux-iframe.html') {
    const filePath = path.join(__dirname, 'test-mux-iframe.html');
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }
  
  // Serve the permissions test file
  if (req.url === '/iframe-permissions-test.html') {
    const filePath = path.join(__dirname, 'iframe-permissions-test.html');
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }
  
  // Serve the Mux Player implementation test file
  if (req.url === '/test-mux-player-implementation.html') {
    const filePath = path.join(__dirname, 'test-mux-player-implementation.html');
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }
  
  // Serve the Mux CSP fallback test file
  if (req.url === '/test-mux-csp-fallback.html') {
    const filePath = path.join(__dirname, 'test-mux-csp-fallback.html');
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }
  
  // Serve the Mux CSP solution test file
  if (req.url === '/test-mux-csp-solution.html') {
    const filePath = path.join(__dirname, 'test-mux-csp-solution.html');
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }
  
  // Serve the simplified Mux Player test file
  if (req.url === '/test-simplified-mux-player.html') {
    const filePath = path.join(__dirname, 'test-simplified-mux-player.html');
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }
  
  // Serve the hybrid Mux Player test file
  if (req.url === '/test-hybrid-mux-player.html') {
    const filePath = path.join(__dirname, 'test-hybrid-mux-player.html');
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }
  
  // Serve the Zupload Player test file
  if (req.url === '/test-zupload-player.html') {
    const filePath = path.join(__dirname, 'test-zupload-player.html');
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }
  
  // Serve other files
  const filePath = path.join(__dirname, req.url);
  const extname = path.extname(filePath);
  
  let contentType = 'text/html';
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
      contentType = 'image/jpg';
      break;
    case '.wav':
      contentType = 'audio/wav';
      break;
  }
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  console.log(`Open http://${hostname}:${port}/test-mux-iframe.html to test the Mux iframe`);
  console.log(`Open http://${hostname}:${port}/iframe-permissions-test.html to test iframe permissions`);
  console.log(`Open http://${hostname}:${port}/test-mux-player-implementation.html to test Mux Player implementation`);
  console.log(`Open http://${hostname}:${port}/test-mux-csp-fallback.html to test Mux CSP fallback`);
  console.log(`Open http://${hostname}:${port}/test-mux-csp-solution.html to test Mux CSP solution`);
  console.log(`Open http://${hostname}:${port}/test-simplified-mux-player.html to test simplified Mux Player`);
  console.log(`Open http://${hostname}:${port}/test-hybrid-mux-player.html to test hybrid Mux Player`);
  console.log(`Open http://${hostname}:${port}/test-zupload-player.html to test Zupload Player`);
});