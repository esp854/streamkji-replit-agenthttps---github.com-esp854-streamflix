// Simple script to import content from TMDB
// This script can be run with: node import-content.js

const { exec } = require('child_process');

console.log('Starting content import from TMDB...');

// Run the TypeScript import script
exec('npx ts-node server/import-movies.ts', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing import script: ${error}`);
    return;
  }
  
  if (stderr) {
    console.error(`Script stderr: ${stderr}`);
  }
  
  console.log(`Script output: ${stdout}`);
  console.log('Content import completed!');
});