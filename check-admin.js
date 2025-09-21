import { Client } from 'pg';

// Database connection configuration
const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/streamkji'
});

async function checkAdminUser() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check if there are any users
    const result = await client.query('SELECT id, username, email, role FROM users ORDER BY created_at');
    console.log('Users in database:');
    result.rows.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}`);
    });
    
    // Check specifically for admin users
    const adminResult = await client.query('SELECT id, username, email, role FROM users WHERE role = $1', ['admin']);
    console.log('\nAdmin users:');
    if (adminResult.rows.length > 0) {
      adminResult.rows.forEach(user => {
        console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
      });
    } else {
      console.log('No admin users found');
    }
    
    // Check content
    const contentResult = await client.query('SELECT id, title, media_type, odysee_url FROM content ORDER BY created_at');
    console.log('\nContent in database:');
    if (contentResult.rows.length > 0) {
      contentResult.rows.forEach(content => {
        console.log(`- ID: ${content.id}, Title: ${content.title}, Type: ${content.media_type}, URL: ${content.odysee_url || 'None'}`);
      });
    } else {
      console.log('No content found');
    }
    
    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
    if (client) {
      await client.end();
    }
  }
}

checkAdminUser();