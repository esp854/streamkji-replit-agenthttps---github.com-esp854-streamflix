import { config } from "dotenv";
import { Client } from 'pg';

// Charger les variables d'environnement
config();

async function checkRenderDatabase() {
  console.log("🔍 Vérification de la base de données Render...");

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL n'est pas définie");
    console.log("💡 Définissez DATABASE_URL dans les variables d'environnement Render");
    process.exit(1);
  }

  console.log("📍 URL de base de données détectée");
  console.log(`🔗 ${databaseUrl.substring(0, 50)}...`);

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false // nécessaire sur Render
    }
  });

  try {
    console.log("🔌 Tentative de connexion...");
    await client.connect();
    console.log("✅ Connexion à la base de données réussie !");

    // Vérifier si les tables existent
    console.log("📋 Vérification des tables...");

    const tables = [
      'users', 'favorites', 'watch_history', 'user_preferences',
      'contact_messages', 'subscriptions', 'payments', 'banners',
      'collections', 'content', 'notifications', 'user_sessions', 'view_tracking'
    ];

    for (const tableName of tables) {
      try {
        const result = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_name = $1
          )
        `, [tableName]);

        if (result.rows[0].exists) {
          console.log(`✅ Table '${tableName}' existe`);
        } else {
          console.log(`❌ Table '${tableName}' manquante`);
        }
      } catch (error) {
        console.log(`❌ Erreur vérification table '${tableName}':`, (error as Error).message);
      }
    }

    // Vérifier les utilisateurs admin
    console.log("👤 Vérification des utilisateurs admin...");
    try {
      const adminResult = await client.query(`
        SELECT id, username, email, role
        FROM users
        WHERE role = 'admin'
      `);

      if (adminResult.rowCount && adminResult.rowCount > 0) {
        console.log(`✅ ${adminResult.rowCount} utilisateur(s) admin trouvé(s):`);
        adminResult.rows.forEach(user => {
          console.log(`   - ${user.username} (${user.email})`);
        });
      } else {
        console.log("❌ Aucun utilisateur admin trouvé");
        console.log("💡 Exécutez: npm run create-admin");
      }
    } catch (error) {
      console.log("❌ Erreur vérification utilisateurs admin:", (error as Error).message);
    }

    await client.end();
    console.log("✅ Vérification terminée");

  } catch (error: any) {
    console.error("❌ Erreur de connexion à la base de données:");
    console.error(`💡 ${error.message}`);

    if (error.code === 'ECONNREFUSED') {
      console.log("💡 Vérifiez que DATABASE_URL est correcte");
    } else if (error.message.includes('password authentication failed')) {
      console.log("💡 Vérifiez les identifiants dans DATABASE_URL");
    } else if (error.message.includes('does not exist')) {
      console.log("💡 La base de données n'existe pas - exécutez d'abord: npm run db:push");
    }

    process.exit(1);
  }
}

checkRenderDatabase().catch(console.error);