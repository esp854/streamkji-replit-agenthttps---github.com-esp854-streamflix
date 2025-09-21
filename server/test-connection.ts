import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import * as schema from "@shared/schema";
const { Client } = pkg;

// Charger les variables d'environnement
config();

async function testConnection() {
  console.log("🔍 Test de connexion PostgreSQL...");
  console.log("📍 Configuration actuelle :");
  
  const currentUrl = process.env.DATABASE_URL;
  console.log(`   DATABASE_URL: ${currentUrl}`);
  
  if (!currentUrl) {
    console.log("❌ DATABASE_URL n'est pas définie dans .env");
    console.log("💡 Vérifiez que le fichier .env contient une ligne DATABASE_URL valide");
    return;
  }
  
  // Extraire les composants de l'URL
  try {
    const url = new URL(currentUrl);
    console.log(`   Host: ${url.hostname}`);
    console.log(`   Port: ${url.port}`);
    console.log(`   Database: ${url.pathname.substring(1)}`);
    console.log(`   Username: ${url.username}`);
    console.log(`   Password: ${'*'.repeat(url.password.length)}`);
  } catch (error) {
    console.log("❌ Format d'URL invalide");
    return;
  }
  
  console.log("\n🔄 Test de connexion...");
  
  // Test avec pg client direct
  const client = new Client({
    connectionString: currentUrl,
  });
  
  try {
    await client.connect();
    console.log("✅ Connexion PostgreSQL réussie !");
    
    // Test d'une requête simple
    const result = await client.query("SELECT NOW() as current_time, version() as version");
    console.log(`📅 Heure: ${result.rows[0].current_time}`);
    console.log(`🐘 Version: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
    
    // Vérifier si la base streamkji existe
    const dbCheck = await client.query("SELECT current_database()");
    console.log(`📊 Base de données active: ${dbCheck.rows[0].current_database}`);
    
    // Test Drizzle ORM
    console.log("\n🧪 Test de Drizzle ORM...");
    const db = drizzle(client, { schema });
    
    // Test a simple query with Drizzle
    try {
      const users = await db.select().from(schema.users).limit(1);
      console.log("✅ Drizzle ORM fonctionne correctement");
    } catch (drizzleError: any) {
      console.log("⚠️  Erreur Drizzle ORM (les tables peuvent ne pas exister encore):", drizzleError.message);
    }
    
    await client.end();
    
    console.log("\n🎉 Tous les tests de connexion ont réussi !");
    console.log("✅ Vous pouvez maintenant exécuter:");
    console.log("   npm run db:push");
    console.log("   npm run create-admin");
    
  } catch (error) {
    console.log("❌ Erreur de connexion:");
    
    if (error instanceof Error) {
      if (error.message.includes("ECONNREFUSED")) {
        console.log("🔴 PostgreSQL n'est pas démarré");
        console.log("💡 Vérifiez que le service PostgreSQL est en cours d'exécution:");
        console.log("   - Ouvrez les Services Windows (services.msc)");
        console.log("   - Recherchez 'postgresql' et démarrez-le");
      } else if (error.message.includes("password authentication failed")) {
        console.log("🔴 Mot de passe incorrect");
        console.log("💡 Mettez à jour le mot de passe dans .env:");
        console.log("   DATABASE_URL=postgresql://postgres:VOTRE_VRAI_MOT_DE_PASSE@localhost:5432/streamkji");
      } else if (error.message.includes("database") && error.message.includes("does not exist")) {
        console.log("🔴 La base de données 'streamkji' n'existe pas");
        console.log("💡 Créez-la avec:");
        console.log("   npm run init-db");
      } else {
        console.log(`🔴 ${error.message}`);
      }
    }
    
    console.log("\n🛠️ Solutions suggérées:");
    console.log("1. Vérifiez que PostgreSQL est installé et démarré");
    console.log("2. Vérifiez le mot de passe dans .env");
    console.log("3. Testez la connexion manuellement:");
    console.log("   psql -U postgres -d streamkji -h localhost -p 5432");
  }
}

testConnection().catch(console.error);