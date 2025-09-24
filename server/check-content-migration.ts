import { config } from "dotenv";
import { Client } from 'pg';

// Charger les variables d'environnement
config();

async function checkContentMigration() {
  console.log("🔍 Vérification du contenu dans la base de données Render...");

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL n'est pas définie");
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log("🔌 Connexion à la base de données...");
    await client.connect();
    console.log("✅ Connexion réussie");

    // Compter le contenu total
    const contentResult = await client.query(`
      SELECT COUNT(*) as total_content,
             COUNT(CASE WHEN active = true THEN 1 END) as active_content,
             COUNT(CASE WHEN media_type = 'movie' THEN 1 END) as movies,
             COUNT(CASE WHEN media_type = 'tv' THEN 1 END) as tv_shows
      FROM content
    `);

    const stats = contentResult.rows[0];
    console.log("📊 Statistiques du contenu:");
    console.log(`   - Total contenu: ${stats.total_content}`);
    console.log(`   - Contenu actif: ${stats.active_content}`);
    console.log(`   - Films: ${stats.movies}`);
    console.log(`   - Séries TV: ${stats.tv_shows}`);

    // Vérifier s'il y a du contenu avec des URLs vidéo
    const videoContentResult = await client.query(`
      SELECT COUNT(*) as content_with_video
      FROM content
      WHERE (odysee_url IS NOT NULL AND odysee_url != '')
         OR (mux_url IS NOT NULL AND mux_url != '')
         OR (mux_playback_id IS NOT NULL AND mux_playback_id != '')
    `);

    console.log(`   - Contenu avec vidéos: ${videoContentResult.rows[0].content_with_video}`);

    // Lister quelques exemples de contenu
    const sampleContent = await client.query(`
      SELECT id, title, media_type, active, tmdb_id
      FROM content
      ORDER BY id
      LIMIT 10
    `);

    if (sampleContent.rows.length > 0) {
      console.log("\n📝 Exemples de contenu:");
      sampleContent.rows.forEach(content => {
        console.log(`   - ${content.title} (${content.media_type}) - ${content.active ? 'Actif' : 'Inactif'} - TMDB: ${content.tmdb_id}`);
      });
    }

    await client.end();
    console.log("\n✅ Vérification terminée");

  } catch (error: any) {
    console.error("❌ Erreur:", error.message);
    process.exit(1);
  }
}

checkContentMigration().catch(console.error);