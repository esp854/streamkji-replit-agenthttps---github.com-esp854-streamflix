import { config } from "dotenv";

// Charger les variables d'environnement
config();

async function testTMDBAPI() {
  console.log("🧪 Test de l'accès à l'API TMDB...");

  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    console.error("❌ TMDB_API_KEY n'est pas définie dans .env");
    process.exit(1);
  }

  console.log("🔑 Clé API détectée");

  try {
    // Test simple avec l'endpoint trending
    console.log("📡 Test de l'endpoint trending...");
    const response = await fetch(
      `https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}&language=fr-FR&page=1`
    );

    console.log(`📊 Status de la réponse: ${response.status}`);

    if (response.status === 429) {
      console.error("❌ Rate limit atteint (429)");
      console.log("💡 L'API TMDB limite les requêtes. Attendez quelques minutes avant de réessayer.");
      process.exit(1);
    }

    if (!response.ok) {
      console.error(`❌ Erreur API TMDB: ${response.status} ${response.statusText}`);
      process.exit(1);
    }

    const data = await response.json();
    console.log("✅ API TMDB accessible");
    console.log(`📈 ${data.results?.length || 0} éléments trending trouvés`);

    // Vérifier les headers de rate limiting
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');

    if (remaining) {
      console.log(`📊 Requêtes restantes: ${remaining}`);
    }
    if (reset) {
      const resetTime = new Date(parseInt(reset) * 1000);
      console.log(`⏰ Reset du rate limit: ${resetTime.toLocaleString()}`);
    }

  } catch (error: any) {
    console.error("❌ Erreur lors du test TMDB:", error.message);
    process.exit(1);
  }
}

testTMDBAPI().catch(console.error);