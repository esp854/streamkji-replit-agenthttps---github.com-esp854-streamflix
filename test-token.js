import jwt from 'jsonwebtoken';
import { Client } from 'pg';

// Database connection configuration
const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/streamkji'
});

const JWT_SECRET = process.env.JWT_SECRET || "EcaR9YIwP+1msKt9HsuBxJcf1KOh0WiLNHm9At2cNrVP7rLCQ+82/Q80+FtwGazICef68c5QuJfgeg6Qi+WLpw==";

async function testToken() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Get the admin user
    const result = await client.query('SELECT id, username, email FROM users WHERE role = $1 LIMIT 1', ['admin']);
    if (result.rows.length === 0) {
      console.log('No admin user found');
      await client.end();
      return;
    }
    
    const adminUser = result.rows[0];
    console.log('Admin user found:', adminUser);
    
    // Generate a new token for this user
    const token = jwt.sign(
      { userId: adminUser.id, email: adminUser.email, username: adminUser.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('Generated token:', token);
    
    // Verify the token
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        console.error('Token verification failed:', err.message);
      } else {
        console.log('Token verified successfully:', user);
      }
    });
    
    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
    if (client) {
      await client.end();
    }
  }
}

testToken();