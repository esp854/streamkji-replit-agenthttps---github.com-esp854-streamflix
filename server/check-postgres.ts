import { Client } from 'pg';

async function checkPostgres() {
  console.log("🔍 Vérification de PostgreSQL...");
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log("❌ DATABASE_URL environment variable is not set");
    console.log("   Please set the DATABASE_URL in your .env file");
    return;
  }
  
  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
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
      console.log("💡 Connexion refusée");
      console.log("   Vérifiez que l'URL de la base de données est correcte");
    } else if (error.code === '28P01') {
      console.log("💡 Mot de passe incorrect");
      console.log("   Vérifiez le mot de passe dans votre configuration");
    } else {
      console.log(`💡 Erreur: ${error.message}`);
    }
  }
}

checkPostgres().catch(console.error);