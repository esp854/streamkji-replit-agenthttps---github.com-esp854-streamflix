import { config } from "dotenv";

// Charger les variables d'environnement
config();

async function testZuploadIframe() {
  console.log("🧪 Test de l'iframe Zupload...");

  // Test URL d'exemple (remplacez par une vraie URL Zupload si disponible)
  const testUrls = [
    "https://zupload.com/embed/example",
    "https://example.zupload.com/v/example",
    "https://zupload.me/embed/example"
  ];

  console.log("📋 Test des URLs Zupload possibles:");

  for (const url of testUrls) {
    try {
      console.log(`\n🔗 Test de: ${url}`);

      // Test de base de l'URL (HEAD request pour vérifier l'accessibilité)
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      console.log(`📊 Status: ${response.status}`);
      console.log(`📄 Content-Type: ${response.headers.get('content-type')}`);
      console.log(`🔒 X-Frame-Options: ${response.headers.get('x-frame-options')}`);
      console.log(`🛡️ Content-Security-Policy: ${response.headers.get('content-security-policy')?.substring(0, 100)}...`);

      if (response.status === 200) {
        console.log("✅ URL accessible");
      } else if (response.status === 404) {
        console.log("❌ URL non trouvée (404)");
      } else {
        console.log(`⚠️ Status ${response.status}`);
      }

    } catch (error: any) {
      console.log(`❌ Erreur: ${error.message}`);
    }
  }

  console.log("\n🔍 Analyse des paramètres iframe utilisés:");
  const testUrl = "https://example.com/video";
  const modifiedUrl = testUrl.includes('?')
    ? `${testUrl}&branding=0&show_title=0&show_info=0&disable_download=1&no_download=1`
    : `${testUrl}?branding=0&show_title=0&show_info=0&disable_download=1&no_download=1`;

  console.log(`📝 URL originale: ${testUrl}`);
  console.log(`📝 URL modifiée: ${modifiedUrl}`);

  console.log("\n🛡️ Paramètres de sécurité iframe:");
  console.log("- allow: accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen");
  console.log("- sandbox: allow-scripts allow-same-origin allow-presentation");
  console.log("- referrerPolicy: no-referrer");

  console.log("\n💡 Recommandations:");
  console.log("1. Vérifiez que l'URL Zupload est correcte et accessible");
  console.log("2. Assurez-vous que Zupload autorise l'intégration iframe");
  console.log("3. Testez avec une vraie URL Zupload dans votre application");
  console.log("4. Vérifiez la console du navigateur pour les erreurs CSP");
}

testZuploadIframe().catch(console.error);