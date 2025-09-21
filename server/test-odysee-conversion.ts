#!/usr/bin/env tsx

/**
 * Test script to verify improved Odysee URL conversion logic
 */

// Improved Odysee URL conversion function
function convertOdyseeUrl(url: string): string {
  let embedUrl = url;
  
  // Si ce n'est pas déjà une URL d'embed, la convertir
  if (!url.includes("/$/embed/")) {
    try {
      // Extraire l'identifiant de la vidéo
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      // Extraire l'ID de la vidéo (la dernière partie après le dernier :)
      const parts = pathname.split(':');
      if (parts.length > 0) {
        const videoId = parts[parts.length - 1];
        // Construire l'URL d'embed correcte
        embedUrl = `https://odysee.com/$/embed/${videoId}`;
      }
    } catch (e) {
      // Si l'URL n'est pas valide, on utilise l'URL originale
      console.warn("Failed to parse Odysee URL:", e);
    }
  }
  
  return embedUrl;
}

// Test Odysee URLs
const odyseeTestUrls = [
  'https://odysee.com/@username:channel/video-title:video-id',
  'https://odysee.com/$/embed/video-title:video-id',
  'https://odysee.com/@username:channel/video-title:video-id?param=value',
  'https://odysee.com/$/embed/video-title:video-id?param=value',
  'https://odysee.com/@FilmClub:5/avengers-endgame-film-complet-vf:8e11057a4f0ec135c4bd4b5247eea8441e307d89'
];

console.log('Testing improved Odysee URL conversion...\n');

odyseeTestUrls.forEach((url, index) => {
  console.log(`Test ${index + 1}: ${url}`);
  
  const convertedUrl = convertOdyseeUrl(url);
  console.log(`  Converted to embed: ${convertedUrl}`);
  
  console.log('');
});

console.log('Test completed.');