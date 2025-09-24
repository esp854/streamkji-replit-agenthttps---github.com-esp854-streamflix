import { config } from "dotenv";
import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Charger les variables d'environnement
config();

async function initDatabase() {
  console.log("🔧 Initialisation de la base de données...");
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL n'est pas définie dans .env");
    process.exit(1);
  }
  
  // Configure SSL based on environment
  const isRender = process.env.RENDER || process.env.NODE_ENV === 'production';
  const sslConfig = isRender ? {
    rejectUnauthorized: false // nécessaire sur Render
  } : false;
  
  // Extraire les composants de l'URL
  const url = new URL(databaseUrl);
  const dbName = url.pathname.substring(1);
  const dbUser = url.username;
  const dbPassword = url.password;
  const dbHost = url.hostname;
  const dbPort = url.port;
  
  console.log(`📍 Configuration: ${dbUser}@${dbHost}:${dbPort}/${dbName}`);
  
  // Créer une connexion sans spécifier la base de données pour créer la base
  const adminClient = new Client({
    connectionString: databaseUrl,
    ssl: sslConfig
  });
  
  try {
    await adminClient.connect();
    console.log("✅ Connexion à PostgreSQL réussie");
    
    // Vérifier si la base de données existe
    const dbCheck = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1", 
      [dbName]
    );
    
    if (dbCheck.rowCount === 0) {
      console.log(`🏗️  Création de la base de données '${dbName}'...`);
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      console.log("✅ Base de données créée avec succès");
    } else {
      console.log(`ℹ️  La base de données '${dbName}' existe déjà`);
    }
    
    await adminClient.end();
    
    // Maintenant se connecter à la base de données spécifique
    const dbClient = new Client({
      connectionString: databaseUrl,
      ssl: sslConfig
    });
    
    await dbClient.connect();
    console.log(`✅ Connecté à la base de données '${dbName}'`);
    
    // Créer les tables avec Drizzle
    console.log("🏗️  Création des tables...");
    const db = drizzle(dbClient, { schema });
    
    // Fermer la connexion
    await dbClient.end();
    console.log("✅ Initialisation terminée avec succès !");
    
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("ECONNREFUSED")) {
        console.log("\n💡 PostgreSQL n'est pas démarré");
        console.log("   Vérifiez que le service PostgreSQL est en cours d'exécution");
      } else if (error.message.includes("password authentication failed")) {
        console.log("\n💡 Mot de passe incorrect");
        console.log("   Mettez à jour le mot de passe dans .env");
      } else {
        console.log(`\n💡 ${error.message}`);
      }
    }
    
    process.exit(1);
  }
}

initDatabase().catch(console.error);