#!/usr/bin/env node

import { config } from "dotenv";
import { tmdbCacheService } from "./tmdb-cache-service.js";

// Charger les variables d'environnement
config();

async function syncTMDBCache() {
  console.log("🔄 Démarrage de la synchronisation du cache TMDB...");

  try {
    // Synchroniser le contenu populaire
    await tmdbCacheService.syncPopularContent();

    // Afficher les statistiques du cache
    const stats = tmdbCacheService.getCacheStats();
    console.log("📊 Statistiques du cache après synchronisation:");
    console.log(`   - Entrées totales: ${stats.totalEntries}`);
    console.log(`   - Entrées valides: ${stats.validEntries}`);
    console.log(`   - Capacité max: ${stats.maxSize}`);
    if (stats.oldestEntry) {
      console.log(`   - Plus ancienne entrée: ${stats.oldestEntry.toISOString()}`);
    }

    console.log("✅ Synchronisation du cache TMDB terminée avec succès!");

  } catch (error) {
    console.error("❌ Erreur lors de la synchronisation du cache TMDB:", error);
    process.exit(1);
  }
}

// Exécuter la synchronisation
syncTMDBCache().catch(console.error);