import { db } from "./db";
import { sql } from "drizzle-orm";

async function testDatabaseConnection() {
  try {
    console.log("🔄 Test de la connexion à la base de données...");
    
    // Test de connexion simple
    const result = await db.execute(sql`SELECT NOW() as current_time, version() as postgres_version`);
    
    console.log("✅ Connexion à la base de données réussie !");
    const firstRow = result.rows[0] as any;
    console.log(`📅 Heure actuelle: ${firstRow.current_time}`);
    console.log(`🐘 Version PostgreSQL: ${firstRow.postgres_version}`);
    
    // Vérifier si les tables existent
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log("\n📊 Tables existantes:");
    if (tables.rows.length === 0) {
      console.log("❌ Aucune table trouvée. Exécutez 'npm run db:push' pour créer les tables.");
    } else {
      tables.rows.forEach((table: any) => {
        console.log(`  - ${table.table_name}`);
      });
    }
    
  } catch (error) {
    console.error("❌ Erreur de connexion à la base de données:");
    if (error instanceof Error) {
      if (error.message.includes("ECONNREFUSED")) {
        console.error("🔴 PostgreSQL n'est pas en cours d'exécution ou n'est pas accessible.");
        console.error("💡 Suggestions:");
        console.error("   1. Vérifiez que PostgreSQL est installé et démarré");
        console.error("   2. Vérifiez que le service PostgreSQL fonctionne");
        console.error("   3. Vérifiez les paramètres de connexion dans .env");
      } else if (error.message.includes("authentication failed")) {
        console.error("🔴 Échec de l'authentification.");
        console.error("💡 Vérifiez le mot de passe dans le fichier .env");
      } else if (error.message.includes("database") && error.message.includes("does not exist")) {
        console.error("🔴 La base de données 'streamkji' n'existe pas.");
        console.error("💡 Exécutez le script setup-db.bat pour créer la base de données");
      } else {
        console.error(error.message);
      }
    }
    process.exit(1);
  }
}

// Exécuter le test
testDatabaseConnection().then(() => {
  console.log("\n🎉 Test de base de données terminé avec succès !");
  process.exit(0);
}).catch((error) => {
  console.error("💥 Échec du test de base de données:", error);
  process.exit(1);
});