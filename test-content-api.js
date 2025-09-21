import { Client } from 'pg';
import jwt from 'jsonwebtoken';

// Database connection configuration
const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/streamkji'
});

const JWT_SECRET = process.env.JWT_SECRET || "EcaR9YIwP+1msKt9HsuBxJcf1KOh0WiLNHm9At2cNrVP7rLCQ+82/Q80+FtwGazICef68c5QuJfgeg6Qi+WLpw==";

async function testContentApi() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check content
    const contentResult = await client.query('SELECT id, title, media_type, odysee_url, language, quality FROM content ORDER BY created_at');
    console.log('\nContent in database:');
    if (contentResult.rows.length > 0) {
      contentResult.rows.forEach(content => {
        console.log(`- ID: ${content.id}, Title: ${content.title}, Type: ${content.media_type}, URL: ${content.odysee_url || 'None'}, Language: ${content.language}, Quality: ${content.quality}`);
      });
    } else {
      console.log('No content found');
    }
    
    // Get the admin user
    const result = await client.query('SELECT id, username, email FROM users WHERE role = $1 LIMIT 1', ['admin']);
    if (result.rows.length === 0) {
      console.log('No admin user found');
      await client.end();
      return;
    }
    
    const adminUser = result.rows[0];
    console.log('\nAdmin user found:', adminUser);
    
    // Generate a new token for this user
    const token = jwt.sign(
      { userId: adminUser.id, email: adminUser.email, username: adminUser.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('\nGenerated token:', token);
    
    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
    if (client) {
      await client.end();
    }
  }
}

testContentApi();