import { config } from "dotenv";
import { Client } from 'pg';
import bcrypt from "bcryptjs";

// Charger les variables d'environnement
config();

/**
 * Version simplifiée de l'initialisation admin
 * Crée directement l'admin sans vérifications complexes
 */
export async function initializeAdminSimple() {
  console.log("🔧 Initialisation simplifiée de l'admin...");

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.log("⚠️ Pas de DATABASE_URL - skipping");
    return;
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("🔌 Connexion DB...");
    await client.connect();
    console.log("✅ Connecté");

    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Créer ou mettre à jour l'admin
    const query = `
      INSERT INTO users (username, email, password, role, "createdAt", "updatedAt")
      VALUES ('admin', 'admin@streamkji.com', $1, 'admin', NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        "updatedAt" = NOW()
    `;

    await client.query(query, [hashedPassword]);
    console.log("✅ Admin créé/mis à jour");

    await client.end();
    console.log("🎯 Initialisation terminée");

  } catch (error: any) {
    console.error("❌ Erreur:", error.message);
  }
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeAdminSimple().catch(console.error);
}