#!/usr/bin/env node

import { config } from "dotenv";
import { databaseTMDBCache } from "./database-tmdb-cache.js";

// Charger les variables d'environnement
config();

async function bulkSyncTMDB() {
  console.log("🔄 Démarrage de la synchronisation en masse TMDB (500+ éléments)...");
  console.log("⚠️  Cette opération peut prendre plusieurs minutes et consomme des requêtes API");

  const startTime = Date.now();

  try {
    // Synchroniser 500 éléments populaires
    await databaseTMDBCache.bulkSync(500);

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    // Afficher les statistiques finales
    const stats = await databaseTMDBCache.getCacheStats();
    console.log("\n📊 Statistiques finales du cache :");
    console.log(`   - Durée totale: ${duration} secondes`);
    console.log(`   - Entrées totales: ${stats.totalEntries}`);
    console.log(`   - Entrées valides: ${stats.validEntries}`);
    console.log(`   - Entrées expirées: ${stats.expiredEntries}`);

    console.log("\n✅ Synchronisation en masse TMDB terminée avec succès!");
    console.log("💡 Votre application peut maintenant servir du contenu sans dépendre de l'API TMDB");

  } catch (error) {
    console.error("❌ Erreur lors de la synchronisation en masse TMDB:", error);
    process.exit(1);
  }
}

// Vérifier si l'utilisateur confirme l'opération
const args = process.argv.slice(2);
if (args.includes('--confirm')) {
  bulkSyncTMDB();
} else {
  console.log("🚨 ATTENTION: Cette commande va synchroniser 500+ éléments TMDB");
  console.log("💰 Cela consomme des requêtes API (coûts potentiels)");
  console.log("⏱️  Cela peut prendre plusieurs minutes");
  console.log("");
  console.log("Pour confirmer l'exécution, utilisez:");
  console.log("npm run bulk-sync-tmdb -- --confirm");
  console.log("");
  console.log("Ou directement:");
  console.log("tsx server/bulk-sync-tmdb.ts --confirm");
}