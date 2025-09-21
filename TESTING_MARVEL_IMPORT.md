# Testing Marvel Content Import

## Overview
This document explains how to test the new Marvel content import functionality.

## Prerequisites
1. Make sure the development server is running (`npm run dev:both`)
2. Ensure you have a valid TMDB_API_KEY in your .env file
3. Make sure you have an admin account

## Testing Methods

### 1. Command Line Import

The easiest way to test is using the command line:

```bash
# Import Marvel content
npm run import-marvel
```

This will search for and import Marvel movies and TV shows.

### 2. Search for Specific Content

You can also search for specific content:

```bash
# Search for Harry Potter content
npx tsx server/import-content.ts "Harry Potter"
```

### 3. Using the Admin Dashboard

1. Start the development server: `npm run dev:both`
2. Open your browser and navigate to http://localhost:5173
3. Log in with an admin account
4. Go to the Admin Dashboard
5. Navigate to the "Gestion des Contenus" tab
6. Use the search box to search for content like "Marvel" or "Harry Potter"
7. Click the "Importer" button on any content you want to add

## Expected Results

When you run the Marvel import, you should see output similar to:

```
Starting content import from TMDB for query: "Marvel"...

--- Searching for Movies ---
Processing page 1 of movie search results...
Searching for movies with query "Marvel" (page 1)...
Found 20 movies for query "Marvel" (page 1)
Added movie "The Marvels" (TMDB ID: 609681) to database with ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
...

--- Searching for TV Shows ---
Processing page 1 of TV show search results...
Searching for TV shows with query "Marvel" (page 1)...
Found 20 TV shows for query "Marvel" (page 1)
Added TV show "Marvel's Spider-Man" (TMDB ID: 72705) to database with ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
...

--- Search Import Summary ---
Total movies added: 60
Total TV shows added: 60
Search-based content import completed!
```

## Adding Video Links

After importing content, you'll need to add video links:

1. In the Admin Dashboard, go to "Gestion des Contenus"
2. Find the imported content
3. Click the "Ajouter lien" button
4. Enter the video URL (Odysee, YouTube, or Vimeo)
5. Click "Ajouter le lien"

## Troubleshooting

If you encounter issues:

1. Make sure your TMDB_API_KEY is properly configured in your .env file
2. Check that you have internet connectivity
3. Verify that you're using an admin account
4. Check the server logs for any error messages

## Verification

To verify that content was imported successfully:

1. Check the database directly
2. Use the Admin Dashboard to view the content list
3. Try to access the content through the main application interface