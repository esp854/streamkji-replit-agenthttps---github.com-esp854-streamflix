# Authentication Troubleshooting Guide

## Common Authentication Errors and Solutions

### 1. 401 Unauthorized Error
```
api/admin/payments:1 Failed to load resource: the server responded with a status of 401 (Unauthorized)
```

**Cause**: User is not authenticated or session has expired.

**Solutions**:
1. **Log out and log back in** to refresh your session
2. **Check if you're logged in as admin** - only admin users can access these endpoints
3. **Verify your auth token** is stored in localStorage:
   ```javascript
   // In browser console
   console.log(localStorage.getItem('auth_token'));
   ```
4. **Clear browser cache and cookies** for the site
5. **Check JWT_SECRET** is properly configured in your .env file

### 2. JSON Parsing Error
```
admin-dashboard.tsx:514 Error importing content: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

**Cause**: Server returned an HTML page (like a login page) instead of JSON.

**Solutions**:
1. **Ensure you're logged in** before trying to import content
2. **Check browser network tab** to see what the server actually returned
3. **Verify admin privileges** - the user must have role "admin"
4. **Check server logs** for authentication errors

### 3. Content Security Policy Error
```
Refused to load the script 'blob:http://127.0.0.1:5000/...' because it violates the following Content Security Policy directive
```

**Cause**: Browser security policy blocking certain scripts during development.

**Solutions**:
1. **This is normal during development** and usually doesn't affect functionality
2. **Use development mode** instead of production mode during testing
3. **Check browser extensions** that might interfere with CSP

## How to Verify Authentication Status

### 1. Check Auth Token in Browser Console
```javascript
// Open browser developer tools (F12) and go to Console tab
console.log('Auth token:', localStorage.getItem('auth_token'));
console.log('User role:', JSON.parse(localStorage.getItem('user') || '{}').role);
```

### 2. Check if User is Admin
```javascript
// In browser console
const user = JSON.parse(localStorage.getItem('user') || '{}');
console.log('User role:', user.role);
if (user.role !== 'admin') {
  console.log('User is not admin - cannot import content');
}
```

### 3. Test API Endpoint Directly
```javascript
// In browser console
fetch('/api/admin/import-content', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
  }
}).then(response => {
  console.log('Status:', response.status);
  return response.text();
}).then(text => {
  console.log('Response:', text);
});
```

## Server-Side Debugging

### 1. Check Server Logs
Look for authentication-related messages in your server console:
```
[LOG] User authenticated: { userId: "...", role: "admin" }
[ERROR] Unauthorized access attempt to /api/admin/import-content
```

### 2. Verify Environment Variables
Ensure these are set in your `.env` file:
```
JWT_SECRET=your-secret-key-here-change-in-production
TMDB_API_KEY=your-tmdb-api-key
DATABASE_URL=your-database-connection-string
```

### 3. Test Database Connection
```bash
npm run test-connection
```

## Common Fixes

### 1. Session Expired
- **Solution**: Log out and log back in
- **Prevention**: Implement automatic token refresh

### 2. User Not Admin
- **Solution**: Create an admin user or promote existing user
- **Command**: `npm run create-admin`

### 3. Missing CSRF Token
- **Solution**: Ensure CSRF token is fetched and sent with requests
- **Check**: Look for `/api/csrf-token` endpoint calls

### 4. CORS Issues
- **Solution**: Ensure proper CORS configuration in server
- **Check**: Browser network tab for CORS errors

## Testing Authentication

### 1. Run Auth Test Script
```bash
npm run test-auth
```

### 2. Manual Verification Steps
1. Navigate to admin dashboard
2. Open browser developer tools
3. Go to Network tab
4. Click "Importer depuis TMDB" button
5. Check the request headers include:
   - Authorization: Bearer [token]
   - X-CSRF-Token: [csrf-token]
6. Check response status and content

## Best Practices

1. **Always check authentication** before making admin requests
2. **Handle errors gracefully** with user-friendly messages
3. **Log authentication failures** for debugging
4. **Implement proper session management**
5. **Use secure storage** for auth tokens
6. **Validate user roles** on both client and server