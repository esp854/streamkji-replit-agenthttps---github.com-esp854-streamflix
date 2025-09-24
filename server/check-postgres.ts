import { Client } from 'pg';

async function checkPostgres() {
  console.log("🔍 Vérification de PostgreSQL...");
  
  // Only check localhost if no DATABASE_URL is set
  const databaseUrl = process.env.DATABASE_URL;
  let client;
  
  if (databaseUrl) {
    // Use the DATABASE_URL from environment variables
    client = new Client({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false
      }
    });
  } else {
    // Fallback to localhost for local development
    client = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: '1234',
      database: 'postgres',
    });
  }
  
  try {
    await client.connect();
    console.log("✅ PostgreSQL est en cours d'exécution");
    
    // Get PostgreSQL version
    const result = await client.query("SELECT version()");
    console.log(`🐘 Version: ${result.rows[0].version}`);
    
    await client.end();
  } catch (error: any) {
    console.log("❌ PostgreSQL n'est pas accessible");
    
    if (error.code === 'ECONNREFUSED') {
      console.log("💡 PostgreSQL n'est pas démarré");
      console.log("   Veuillez démarrer le service PostgreSQL");
    } else if (error.code === '28P01') {
      console.log("💡 Mot de passe incorrect");
      console.log("   Vérifiez le mot de passe dans votre configuration");
    } else {
      console.log(`💡 Erreur: ${error.message}`);
    }
  }
}

checkPostgres().catch(console.error);