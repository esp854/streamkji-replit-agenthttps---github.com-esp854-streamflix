import { config } from "dotenv";
import { Client } from 'pg';
import { execSync } from 'child_process';
import bcrypt from "bcryptjs";

// Charger les variables d'environnement
config();

/**
 * Script complet d'initialisation : DB + Admin
 * Force la création des tables puis de l'admin
 */
export async function initializeDatabaseAndAdmin() {
  console.log("🔧 Initialisation complète : Base de données + Admin...");

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.log("⚠️ Pas de DATABASE_URL - skipping initialization");
    return;
  }

  console.log("📍 DATABASE_URL détectée");

  try {
    // Étape 1: Créer les tables avec Drizzle
    console.log("🏗️ Création des tables...");
    try {
      execSync('npm run db:push', { stdio: 'pipe' });
      console.log("✅ Tables créées");
    } catch (error) {
      console.log("⚠️ Erreur création tables (peut-être déjà existantes):", (error as Error).message);
    }

    // Étape 2: Créer l'admin
    console.log("👤 Création de l'admin...");
    const client = new Client({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log("🔌 Connecté à la DB");

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const query = `
      INSERT INTO users (username, email, password, role, created_at)
      VALUES ('admin', 'admin@streamkji.com', $1, 'admin', NOW())
      ON CONFLICT (email) DO UPDATE SET
        password = EXCLUDED.password,
        role = EXCLUDED.role
    `;

    await client.query(query, [hashedPassword]);
    console.log("✅ Admin créé/mis à jour");

    await client.end();
    console.log("🎯 Initialisation terminée avec succès");

    console.log("\n📋 Informations de connexion admin:");
    console.log("📧 Email: admin@streamkji.com");
    console.log("🔒 Mot de passe: admin123");
    console.log("⚠️  IMPORTANT: Changez ce mot de passe après connexion !");

  } catch (error: any) {
    console.error("❌ Erreur lors de l'initialisation:", error.message);
    console.error("Détails:", error);
  }
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabaseAndAdmin().catch(console.error);
}