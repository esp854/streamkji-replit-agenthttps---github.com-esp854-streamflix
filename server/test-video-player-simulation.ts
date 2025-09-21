#!/usr/bin/env tsx

/**
 * Simulate exactly what happens in the video player component
 */

function simulateVideoPlayer(url: string) {
  console.log(`Simulating video player with URL: "${url}"\n`);
  
  // Step 1: Handle empty or invalid URLs
  if (!url || typeof url !== 'string' || url.trim() === '') {
    console.log("❌ Error: URL de vidéo non fournie");
    console.log("   Veuillez fournir une URL de vidéo valide.");
    return;
  }

  // Step 2: Validate URL format more strictly
  try {
    const parsedUrl = new URL(url);
    // Check for obviously invalid URLs
    if (!parsedUrl.protocol || !parsedUrl.hostname || parsedUrl.hostname.includes('&')) {
      throw new Error('Invalid URL format');
    }
  } catch (e) {
    console.log("❌ Error: URL de vidéo invalide");
    console.log(`   L'URL fournie n'est pas valide : ${url}`);
    return;
  }
  
  console.log("✅ URL validation passed");

  // Step 3: Check for YouTube URLs
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    console.log("📺 Detected YouTube URL");
    // Convert YouTube URLs to embed format if needed
    let embedUrl = url;
    
    try {
      const urlObj = new URL(url);
      
      // Handle youtu.be short URLs
      if (url.includes("youtu.be")) {
        const videoId = urlObj.pathname.substring(1);
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
        console.log(`   Converted to embed URL: ${embedUrl}`);
      } 
      // Handle regular YouTube URLs
      else if (url.includes("watch")) {
        const videoId = urlObj.searchParams.get("v");
        if (videoId) {
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
          console.log(`   Converted to embed URL: ${embedUrl}`);
        }
      }
      // Already an embed URL, keep as is
      else {
        console.log(`   Already in embed format: ${embedUrl}`);
      }
    } catch (e) {
      // If URL parsing fails, keep original URL
      console.warn("   Failed to parse YouTube URL:", e);
      embedUrl = url;
    }
    
    console.log(`✅ Would render YouTube video with embed URL: ${embedUrl}`);
    return;
  }
  
  // Step 4: Check for Zupload URLs
  if (url.includes("zupload")) {
    console.log("💾 Detected Zupload URL");
    console.log(`✅ Would render Zupload video with iframe: ${url}`);
    return;
  }
  
  console.log("❓ URL would be handled by other logic in the video player");
}

// Test with your URL
const providedUrl = "https://youtu.be/FR8KuG3g2rg?si=fUHA4gtk6zTdlPl_";
simulateVideoPlayer(providedUrl);

console.log("\n" + "=".repeat(50) + "\n");

// Test with some problematic URLs
console.log("Testing with some problematic URLs:\n");

const problematicUrls = [
  "", // Empty URL
  "   ", // Whitespace only
  "https://&/", // Invalid hostname
  "not-a-url", // Missing protocol
];

problematicUrls.forEach((url, index) => {
  console.log(`Test ${index + 1}: "${url}"`);
  simulateVideoPlayer(url);
  console.log("");
});

// Test with Zupload URL
console.log("=".repeat(50));
console.log("Testing with Zupload URL:\n");
simulateVideoPlayer("https://zupload.example.com/videos/sample-video.mp4");