#!/usr/bin/env tsx

/**
 * Test URL encoding for MUX URLs
 */

function testUrlEncoding(url: string) {
  console.log(`Original URL: "${url}"\n`);
  
  // Check if URL is already encoded
  try {
    // Try to decode the URL
    const decodedUrl = decodeURIComponent(url);
    console.log(`Decoded URL: "${decodedUrl}"`);
    
    // Check if they're different
    if (decodedUrl !== url) {
      console.log("⚠️ URL was encoded, using decoded version");
      return decodedUrl;
    } else {
      console.log("✅ URL was not encoded");
      return url;
    }
  } catch (e) {
    console.log("❌ Error decoding URL:", e);
    return url;
  }
}

// Test with the user's MUX URL
const userMuxUrl = "https://player.mux.com/nxJGpRqIjgXGrfiYf3X01jWUVTpn02yKNfZtFsApwHLXs?metadata-video-title=EP+4+The+Defects+saison+1+%C3%A9pisode+4&video-title=EP+4+The+Defects+saison+1+%C3%A9pisode+4";
const result = testUrlEncoding(userMuxUrl);

console.log("\n" + "=".repeat(50) + "\n");

// Test creating a URL object with the result
try {
  const urlObj = new URL(result);
  console.log("✅ URL object created successfully");
  console.log(`Protocol: ${urlObj.protocol}`);
  console.log(`Hostname: ${urlObj.hostname}`);
  console.log(`Pathname: ${urlObj.pathname}`);
  console.log(`Search: ${urlObj.search}`);
} catch (e) {
  console.log("❌ Error creating URL object:", e);
}