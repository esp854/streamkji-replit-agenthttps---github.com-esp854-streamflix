#!/usr/bin/env tsx

/**
 * Test how the video player processes YouTube URLs
 */

function processYouTubeUrl(url: string): string {
  let embedUrl = url;
  
  try {
    const urlObj = new URL(url);
    
    // Handle youtu.be short URLs
    if (url.includes("youtu.be")) {
      const videoId = urlObj.pathname.substring(1);
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
      console.log(`Converted youtu.be URL to embed: ${embedUrl}`);
    } 
    // Handle regular YouTube URLs
    else if (url.includes("watch")) {
      const videoId = urlObj.searchParams.get("v");
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
        console.log(`Converted watch URL to embed: ${embedUrl}`);
      }
    }
    // Already an embed URL, keep as is
    else if (url.includes("embed")) {
      console.log(`Already an embed URL: ${embedUrl}`);
    }
    // Other YouTube URLs
    else {
      console.log(`Other YouTube URL format: ${embedUrl}`);
    }
  } catch (e) {
    // If URL parsing fails, keep original URL
    console.warn("Failed to parse YouTube URL:", e);
    embedUrl = url;
  }
  
  return embedUrl;
}

const testUrl = "https://youtu.be/FR8KuG3g2rg?si=fUHA4gtk6zTdlPl_";
console.log(`Testing URL: ${testUrl}\n`);

const processedUrl = processYouTubeUrl(testUrl);
console.log(`\nFinal URL to be used in iframe: ${processedUrl}`);