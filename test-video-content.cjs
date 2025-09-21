const { storage } = require('./dist/index.js');

async function testContent() {
  try {
    console.log('Testing database connection and content...');
    
    // Try to get all content
    const contents = await storage.getAllContent();
    console.log('All content:', JSON.stringify(contents, null, 2));
    
    if (contents && contents.length > 0) {
      console.log(`Found ${contents.length} content items in database`);
      
      // Try to get content by TMDB ID of the first item
      const firstContent = contents[0];
      console.log('First content item:', firstContent);
      
      const contentByTmdbId = await storage.getContentByTmdbId(firstContent.tmdbId);
      console.log('Content by TMDB ID:', JSON.stringify(contentByTmdbId, null, 2));
    } else {
      console.log('No content found in database');
    }
  } catch (error) {
    console.error('Error testing content:', error.message);
  }
}

testContent();