import { config } from "dotenv";
import { Client } from 'pg';
import bcrypt from "bcryptjs";

// Charger les variables d'environnement
config();

async function createAdminDirect() {
  console.log("🔧 Création directe de l'admin dans la base de données...");

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL n'est pas définie");
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false // nécessaire sur Render
    }
  });

  try {
    console.log("🔌 Connexion à la base de données...");
    await client.connect();
    console.log("✅ Connecté à PostgreSQL");

    const adminEmail = "admin@streamkji.com";
    const adminUsername = "admin";
    const adminPassword = "admin123";

    console.log("🔍 Vérification de l'utilisateur admin existant...");

    // Vérifier si l'admin existe déjà
    const existingQuery = `
      SELECT id, username, email, role
      FROM users
      WHERE email = $1
    `;
    const existingResult = await client.query(existingQuery, [adminEmail]);

    if (existingResult.rows.length > 0) {
      const existingAdmin = existingResult.rows[0];
      console.log("✅ Admin existant trouvé:", existingAdmin.username);

      // Mettre à jour le rôle et le mot de passe
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const updateQuery = `
        UPDATE users
        SET username = $1, password = $2, role = $3, "updatedAt" = NOW()
        WHERE email = $4
        RETURNING id, username, email, role
      `;

      const updateResult = await client.query(updateQuery, [
        adminUsername,
        hashedPassword,
        'admin',
        adminEmail
      ]);

      console.log("✅ Admin mis à jour:", updateResult.rows[0]);
    } else {
      console.log("👤 Création d'un nouvel admin...");

      // Créer le nouvel admin
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const insertQuery = `
        INSERT INTO users (username, email, password, role, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING id, username, email, role
      `;

      const insertResult = await client.query(insertQuery, [
        adminUsername,
        adminEmail,
        hashedPassword,
        'admin'
      ]);

      console.log("✅ Admin créé:", insertResult.rows[0]);
    }

    // Vérification finale
    const verifyQuery = `
      SELECT id, username, email, role, "createdAt"
      FROM users
      WHERE email = $1
    `;
    const verifyResult = await client.query(verifyQuery, [adminEmail]);

    console.log("\n🎯 Admin prêt dans la base de données:");
    console.log("🆔 ID:", verifyResult.rows[0].id);
    console.log("👤 Nom:", verifyResult.rows[0].username);
    console.log("📧 Email:", verifyResult.rows[0].email);
    console.log("👑 Rôle:", verifyResult.rows[0].role);

    console.log("\n📋 Informations de connexion:");
    console.log("📧 Email:", adminEmail);
    console.log("🔒 Mot de passe:", adminPassword);
    console.log("⚠️  IMPORTANT: Changez ce mot de passe après connexion !");

    await client.end();
    console.log("✅ Opération terminée avec succès");

  } catch (error: any) {
    console.error("❌ Erreur:", error.message);
    process.exit(1);
  }
}

createAdminDirect().catch(console.error);