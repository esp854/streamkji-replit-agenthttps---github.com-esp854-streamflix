import { storage } from './server/storage.js';

async function testContent() {
  try {
    // Try to get all content
    const contents = await storage.getAllContent();
    console.log('All content:', contents);
    
    // Try to get content by TMDB ID 11 (Star Wars)
    const content = await storage.getContentByTmdbId(11);
    console.log('Content with TMDB ID 11:', content);
  } catch (error) {
    console.error('Error:', error);
  }
}

testContent();