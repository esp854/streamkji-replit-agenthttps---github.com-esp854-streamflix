import { config } from "dotenv";
import { Client } from 'pg';
import bcrypt from "bcryptjs";

// Charger les variables d'environnement
config();

/**
 * Script d'initialisation de l'admin
 * S'exécute automatiquement au démarrage de l'application
 * Crée l'utilisateur admin s'il n'existe pas
 */
export async function initializeAdmin() {
  console.log("🔧 Initialisation de l'utilisateur admin...");

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.warn("⚠️ DATABASE_URL non définie - skipping admin initialization");
    return;
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false // nécessaire sur Render
    }
  });

  try {
    await client.connect();

    const adminEmail = "admin@streamkji.com";
    const adminUsername = "admin";
    const adminPassword = "admin123";

    // Vérifier si la table users existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'users'
      )
    `);

    if (!tableCheck.rows[0].exists) {
      console.log("⚠️ Table 'users' n'existe pas encore - skipping admin initialization");
      await client.end();
      return;
    }

    // Vérifier si l'admin existe déjà
    const existingQuery = `
      SELECT id, username, email, role
      FROM users
      WHERE email = $1
    `;
    const existingResult = await client.query(existingQuery, [adminEmail]);

    if (existingResult.rows.length > 0) {
      const existingAdmin = existingResult.rows[0];
      console.log("✅ Admin déjà existant:", existingAdmin.username);

      // Vérifier si le rôle est correct
      if (existingAdmin.role !== "admin") {
        console.log("🔧 Correction du rôle admin...");
        await client.query(
          `UPDATE users SET role = 'admin', "updatedAt" = NOW() WHERE email = $1`,
          [adminEmail]
        );
      }
    } else {
      console.log("👤 Création de l'utilisateur admin...");

      // Créer le mot de passe haché
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // Insérer l'admin
      const insertQuery = `
        INSERT INTO users (username, email, password, role, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, NOW(), NOW())
      `;

      await client.query(insertQuery, [
        adminUsername,
        adminEmail,
        hashedPassword,
        'admin'
      ]);

      console.log("✅ Admin créé avec succès !");
      console.log("📧 Email:", adminEmail);
      console.log("🔒 Mot de passe:", adminPassword);
      console.log("⚠️  IMPORTANT: Changez ce mot de passe après la première connexion !");
    }

    await client.end();
    console.log("🎯 Initialisation admin terminée");

  } catch (error: any) {
    console.error("❌ Erreur lors de l'initialisation admin:", error.message);
    // Ne pas throw l'erreur pour ne pas bloquer le démarrage de l'app
  }
}

// Fonction pour exécuter l'initialisation au démarrage
export async function initAdminOnStartup() {
  try {
    await initializeAdmin();
  } catch (error) {
    console.error("Erreur lors de l'initialisation de l'admin:", error);
  }
}